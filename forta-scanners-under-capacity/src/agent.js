const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} = require("forta-agent");

const { Contract, Provider } = require("ethers-multicall");
const { config } = require("./agent.config");
const ADDRESS_ZERO = ethers.constants.AddressZero;
const axios = require("axios");
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
let scannersCountByChainId = {};
const scannersLoadedWithChainId = [];

async function initialize() {
  await ethcallProvider.init();
  const fetchedConfig = await axios.default.get(
    "https://gist.githubusercontent.com/Tdrachev/984a1ded766e1334dd28e383fb157d5a/raw/cad40372ef992b4b38f650ae7353d9ff67d40466/scanner-threshold-config.json"
  );
  const jsonConfig = fetchedConfig.data;

  config.underCapacityThreshold = jsonConfig.underCapacityThreshold;
  config.overCapacityThreshold = jsonConfig.overCapacityThreshold;

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

  //Add the chainId for each scanner
  const scannerChainIdCalls = [];
  scannersLoaded.forEach((s) => {
    scannerChainIdCalls.push(scannerRegistryContract.getScannerChainId(s));
  });
  const scannerChainIds = await ethcallProvider.all(scannerChainIdCalls);

  for (let [i, s] of scannersLoaded.entries()) {
    const scannerChainId = scannerChainIds[i];
    const scannerChainIdNormalized = scannerChainId.toNumber();
    scannersLoadedWithChainId.push({
      scannerId: s,
      chainId: scannerChainIdNormalized,
    });
  }

  //Get the count of scanners for each ChainId
  const scannersByChainCount = {};
  for (let obj of scannersLoadedWithChainId) {
    let key = obj["chainId"];
    scannersByChainCount[key] = scannersLoadedWithChainId.filter(
      (s) => s["chainId"] == key
    ).length;
  }

  Object.assign(scannersCountByChainId, scannersByChainCount);
}

//Here we check if a new scanner is minted so we can add it to the array of scanners
function provideHandleTransaction(
  scannersLoaded,
  scannersCountByChainId,
  ethcallProvider
) {
  return async function handleTransaction(txEvent) {
    const findings = [];
    const txFiltered = txEvent.filterLog(mintAbi, contractAddresses[2]);

    for (let tx of txFiltered) {
      const { from, tokenId } = tx.args;

      if (from === ADDRESS_ZERO) {
        const scannerChainIdCall =
          scannerRegistryContract.getScannerChainId(tokenId);
        const [scannerChainId] = await ethcallProvider.all([
          scannerChainIdCall,
        ]);
        const scannerChainIdNormalized = scannerChainId.toNumber();
        scannersCountByChainId[scannerChainIdNormalized]++;
        const tokenIdString = tokenId.toString();
        scannersLoaded.push({
          scannerId: tokenIdString,
          chainId: scannerChainIdNormalized,
        });
      }
    }

    return findings;
  };
}

//Here we check once per block if scanners of a specific chainId are over or under capacity
function provideHandleBlock(
  scannersLoaded,
  scannersCountByChainId,
  ethcallProvider
) {
  return async function handleBlock(blockNumber) {
    const findings = [];
    const scannerCapacityCalls = [];
    scannersLoaded.forEach((s) => {
      scannerCapacityCalls.push(dispatcherContract.numAgentsFor(s.scannerId));
    });
    const scannersCapacities = await ethcallProvider.all(scannerCapacityCalls);

    for (let id of config.chainIds) {
      let scannerCapacityForChainId = 0;

      for (let [i, s] of scannersLoaded.entries()) {
        if (s.chainId != id) continue;

        const scannerCapacity = scannersCapacities[i].toNumber();

        const scannerCapacityPercentage = (scannerCapacity / 25) * 100;
        scannerCapacityForChainId += scannerCapacityPercentage;
      }

      const scannerCapacityForChainIdNormalized =
        scannerCapacityForChainId / scannersCountByChainId[id];

      if (isNaN(scannerCapacityForChainIdNormalized)) continue;

      if (scannerCapacityForChainIdNormalized > config.overCapacityThreshold) {
        findings.push(
          Finding.fromObject({
            name: "FORTA Scanner over capacity threshold",
            description: `FORTA Scanners capacity is almost full for chainId: ${id}`,
            alertId: "FORTA-SCANNER-OVER-CAPACITY-THRESHOLD",
            severity: FindingSeverity.Medium,
            type: FindingType.Info,
            metadata: {
              threshold: config.overCapacityThreshold,
              capacityPercentage: scannerCapacityForChainIdNormalized,
              chainId: id,
            },
          })
        );
      } else if (
        scannerCapacityForChainIdNormalized < config.underCapacityThreshold
      ) {
        findings.push(
          Finding.fromObject({
            name: "FORTA Scanner under capacity threshold for chain",
            description: `FORTA Scanners are almost under capacity threshold for chainId: ${id}`,
            alertId: "FORTA-SCANNER-UNDER-CAPACITY-THRESHOLD",
            severity: FindingSeverity.Medium,
            type: FindingType.Info,
            metadata: {
              threshold: config.underCapacityThreshold,
              capacityPercentage: scannerCapacityForChainIdNormalized,
              chainId: id,
            },
          })
        );
      }
    }

    return findings;
  };
}

module.exports = {
  initialize,
  handleTransaction: provideHandleTransaction(
    scannersLoadedWithChainId,
    scannersCountByChainId,
    ethcallProvider
  ),
  handleBlock: provideHandleBlock(
    scannersLoadedWithChainId,
    scannersCountByChainId,
    ethcallProvider
  ),
  provideHandleTransaction,
  provideHandleBlock,
};
