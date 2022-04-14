const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} = require("forta-agent");
const fs = require("fs");
const { Contract, Provider } = require("ethers-multicall");
const { config } = require("./agent.config");
const ADDRESS_ZERO = ethers.constants.AddressZero;

const agentRegistryAbi = require("./abis/agentregistry.json");
const scannerAbi = require("./abis/scannerregistry.json");
const dispatcherAbi = require("./abis/dispatcher.json");
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

    const agents = await ethcallProvider.all(agentCalls);

    const numScannersForCalls = agents.map((a) =>
      dispatcherContract.numScannersFor(a)
    );

    //Get all scanner count for a specific agent
    const numScannersFor = await ethcallProvider.all(numScannersForCalls);

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

    //Test function to see if the scanners are grouped by chainID and if all of them are enabled
    // const scannerFilteredAndState = [];
    // for (let s of scannersFiltered) {
    //   const scannerStateCall = scannerRegistryContract.getScannerState(s);
    //   const [scannerState] = await ethcallProvider.all([scannerStateCall]);
    //   scannerFilteredAndState.push({
    //     scannerId: s,
    //     scannerState: scannerState.enabled,
    //     chainId: id,
    //   });
    // }

    //Put all found scanners in the global scannersLoaded object
    scannersFiltered.forEach((s) => {
      scannersLoaded.push(s);
    });
  }

  //Do a secondary filtering since there were duplicates after completion
  scannersLoaded = scannersLoaded.filter((s, i) => {
    return scannersLoaded.indexOf(s) === i;
  });
}

const handleTransaction = async (txEvent) => {
  const findings = [];
  const txFiltered = txEvent.filterLog(mintAbi, contractAddresses[2]);

  txFiltered.forEach((tx) => {
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
  });

  return findings;
};

const handleBlock = async (blockNumber) => {
  const findings = [];

  for (let s of scannersLoaded) {
    const scannerCapacityCall = dispatcherContract.numAgentsFor(s);
    const [scannerCapacity] = await ethcallProvider.all([scannerCapacityCall]);
    const scannerCapacityPercentage = (scannerCapacity.toNumber() / 25) * 100;

    if (scannerCapacityPercentage > config.overCapacityThreshold) {
      findings.push(
        Finding.fromObject({
          name: "FORTA Scanner over capacity threshold",
          description: `FORTA Scanner capacity is almost full for scannerId: ${s}`,
          alertId: "FORTA-SCANNER-OVER-CAPACITY-THRESHOLD",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            threshold: config.overCapacityThreshold,
            capacityPercentage: scannerCapacityPercentage,
            scannerId: s,
          },
        })
      );
    } else if (scannerCapacityPercentage < config.underCapacityThreshold) {
      findings.push(
        Finding.fromObject({
          name: "FORTA Scanner under capacity threshold",
          description: `FORTA Scanner is almost under capacity threshold for scannerId: ${s}`,
          alertId: "FORTA-SCANNER-UNDER-CAPACITY-THRESHOLD",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            threshold: config.underCapacityThreshold,
            capacityPercentage: scannerCapacityPercentage,
            scannerId: s,
          },
        })
      );
    }
  }

  return findings;
};

module.exports = {
  initialize,
  handleTransaction,
  handleBlock,
};
