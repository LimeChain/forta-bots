const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} = require("forta-agent");
const axios = require("axios");
const { config } = require("./agent.config");
const { Contract, Provider } = require("ethers-multicall");
const ADDRESS_ZERO = ethers.constants.AddressZero;

const agentRegistryAbi = require("./abis/agentregistry.json");
const dispatcherAbi = require("./abis/dispatcher.json");
const scannerAbi = require("./abis/scannerregistry.json");
const mintAbi =
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)";

const provider = getEthersProvider();

const contractAddresses = Object.keys(config.contracts);
const ethcallProvider = new Provider(provider);
const agentRegistryContract = new Contract(
  contractAddresses[1],
  agentRegistryAbi
);
const dispatcherContract = new Contract(contractAddresses[0], dispatcherAbi);
const scannerRegistryContract = new Contract(contractAddresses[2], scannerAbi);
let scannersLoaded = [];

async function initialize() {
  await ethcallProvider.init();

  //Here we loop trough all available chain ids and fetch all the scannerIds that are currently available
  for (let id of config.chainIds) {
    const agentCountCall = agentRegistryContract.getAgentCountByChain(id);
    const [agentCountFetched] = await ethcallProvider.all([agentCountCall]);

    //Agent count as number
    const agentCount = agentCountFetched.toNumber();
    const agentCalls = [];
    for (let i = 0; i < agentCount; i++) {
      agentCalls.push(agentRegistryContract.getAgentByChainAndIndex(id, i));
    }

    //All agents
    let agents = await ethcallProvider.all(agentCalls);

    const agentDataCalls = [];
    agents.forEach((a) => {
      agentDataCalls.push(agentRegistryContract.isEnabled(a));
    });

    //Remove disabled agents from the list since they are not located on a scanner eitherway
    const agentEnabled = await ethcallProvider.all(agentDataCalls);

    agents = agents.filter((a, i) => {
      if (agentEnabled[i] == true) return a;
    });

    const numScannersForCalls = agents.map((a) =>
      dispatcherContract.numScannersFor(a)
    );

    //Get all scanner count for a specific agent
    const numScannersFor = await ethcallProvider.all(numScannersForCalls);

    //Get scanners by getting the total scanners for an agent and then looping trough each agent and pushing the scannerAt call for later
    const scannerCalls = [];
    numScannersFor
      .map((e) => e.toNumber())
      .forEach((num, agentIndex) => {
        for (let i = 0; i < num; i++) {
          scannerCalls.push(
            dispatcherContract.scannerAt(agents[agentIndex], i)
          );
        }
      });

    //Get all scanners
    const scanners = await ethcallProvider.all(scannerCalls);

    //Convert the scannerIds to strings since they overflow as numbers
    const scannersAsStrings = scanners.map((s) => s.toString());

    //Filter out duplicate scanners
    const scannersFiltered = scannersAsStrings.filter((s, i) => {
      return scannersAsStrings.indexOf(s) === i;
    });

    //Put all found scanners in the global scannersLoaded object
    scannersFiltered.forEach((s) => {
      scannersLoaded.push(s);
    });
  }

  //Filter all scanners just in case there are duplicates
  scannersLoaded = scannersLoaded.filter((s, i) => {
    return scannersLoaded.indexOf(s) === i;
  });
}

//Here we check if a new scanner is minted so we can add it to the array of scanners
function provideHandleTransaction(scannersLoaded) {
  return async function handleTransaction(txEvent) {
    const findings = [];
    const txFiltered = txEvent.filterLog(mintAbi, contractAddresses[2]);

    for (let tx of txFiltered) {
      const { from, tokenId } = tx.args;

      if (from === ADDRESS_ZERO) {
        const tokenIdString = tokenId.toString();
        scannersLoaded.push(tokenIdString);
        findings.push(
          Finding.fromObject({
            name: "FORTA Scanner minted",
            description: `FORTA Scanner minted with scannerId: ${tokenIdString}`,
            alertId: "FORTA-SCANNER-MINTED",
            severity: FindingSeverity.Info,
            type: FindingType.Info,
            metadata: {
              scannerId: tokenIdString,
            },
          })
        );
      }
    }

    return findings;
  };
}

const handleBlock = async (blockNumber) => {
  const findings = [];

  for (let s of scannersLoaded) {
    // const scannerDataCall = scannerRegistryContract.getScanner(s);

    // const [scannerData] = await ethcallProvider.all([scannerDataCall]);

    const scannerAddress = ethers.BigNumber.from(s);

    try {
      const scannerSlaData = await axios.default.get(
        "https://api.forta.network/stats/sla/scanner/" + scannerAddress
      );
      console.log(scannerSlaData);
      const scannerSlaAvgValue = scannerSlaData.data.statistics.avg;
      console.log(scannerSlaAvgValue);
      if (scannerSlaAvgValue < config.SLA_THRESHOLD) {
        findings.push(
          Finding.fromObject({
            name: "Scanner SLA under threshold",
            description: `Scanner SLA is under the threshold and might get disqualifed, scannerId: ${scannerId.manifest}`,
            alertId: "FORTA-SCANNER-SLA-UNDER-THRESHOLD",
            severity: FindingSeverity.High,
            type: FindingType.Info,
            metadata: {
              scannerId: scannerId.manifest,
              slaValue: scannerSlaAvgValue,
            },
          })
        );
      }
    } catch (e) {
      console.log(e.message);
    }
  }
  return findings;
};

module.exports = {
  handleTransaction: provideHandleTransaction(scannersLoaded),
  handleBlock,
};
