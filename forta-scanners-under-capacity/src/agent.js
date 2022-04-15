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
const scannersCountByChainId = [];
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

    let agents = await ethcallProvider.all(agentCalls);

    const agentDataCalls = [];
    agents.forEach((a) => {
      agentDataCalls.push(agentRegistryContract.isEnabled(a));
    });

    const agentEnabled = await ethcallProvider.all(agentDataCalls);

    agents = agents.filter((a, i) => {
      if (agentEnabled[i] == true) return a;
    });

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

    //Put all found scanners in the global scannersLoaded object
    scannersFiltered.forEach((s) => {
      scannersLoaded.push(s);
    });
  }

  scannersLoaded = scannersLoaded.filter((s, i) => {
    return scannersLoaded.indexOf(s) === i;
  });

  const scannersLoadedWithChainId = [];
  for (let s of scannersLoaded) {
    const scannerChainIdCall = scannerRegistryContract.getScannerChainId(s);
    const [scannerChainId] = await ethcallProvider.all([scannerChainIdCall]);

    const scannerChainIdNormalized = scannerChainId.toNumber();
    scannersLoadedWithChainId.push({
      scannerId: s,
      chainId: scannerChainIdNormalized,
    });
  }

  const scannersByChainCount = {};
  for (let obj of scannersLoadedWithChainId) {
    let key = obj["chainId"];
    scannersByChainCount[key] = scannersLoadedWithChainId.filter(
      (s) => s["chainId"] == key
    ).length;
  }
  scannersCountByChainId.push(scannersByChainCount);
  scannersLoaded = scannersLoadedWithChainId;
}

const handleTransaction = async (txEvent) => {
  const findings = [];
  const txFiltered = txEvent.filterLog(mintAbi, contractAddresses[2]);

  for (let tx of txFiltered) {
    const { from, tokenId } = tx.args;

    if (from === ADDRESS_ZERO) {
      const scannerChainIdCall =
        scannerRegistryContract.getScannerChainId(tokenId);
      const [scannerChainId] = await ethcallProvider.all([scannerChainIdCall]);
      const scannerChainIdNormalized = scannerChainId.toNumber();
      const tokenIdString = tokenId.toString();
      scannersLoaded.push({
        scannerId: tokenIdString,
        chainId: scannerChainIdNormalized,
      });
      findings.push(
        Finding.fromObject({
          name: "FORTA Scanner minted",
          description: `FORTA Scanner minted with scannerId: ${tokenIdString}`,
          alertId: "FORTA-SCANNER-MINTED",
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            scannerId: tokenIdString,
            chainId: scannerChainIdNormalized,
          },
        })
      );
    }
  }

  return findings;
};

const handleBlock = async (blockNumber) => {
  const findings = [];
  for (let id of config.chainIds) {
    let scannerCapacityForChainId = 0;
    for (let s of scannersLoaded) {
      if (s.chainId != id) continue;
      const scannerCapacityCall = dispatcherContract.numAgentsFor(s.scannerId);
      const [scannerCapacity] = await ethcallProvider.all([
        scannerCapacityCall,
      ]);
      const scannerCapacityPercentage = (scannerCapacity.toNumber() / 25) * 100;
      scannerCapacityForChainId += scannerCapacityPercentage;
    }

    const scannerCapacityForChainIdNormalized =
      scannerCapacityForChainId / scannersCountByChainId[0][id];
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

module.exports = {
  initialize,
  handleTransaction,
  handleBlock,
};
