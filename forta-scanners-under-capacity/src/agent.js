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
const dispatcherContract = new Contract(contractAddresses[0], dispatcherAbi);
const scannerRegistryContract = new Contract(contractAddresses[2], scannerAbi);
const scannersCountByChainId = {};
const totalScannersPerQuery = 900; //Cannot exceed 900
let scannersLoadedWithChainId = [];
let scannerIds = [];
let shouldCheckCapacity = true;
async function fetchConfigVariables() {
  const fetchedConfig = await axios.default.get(
    "https://gist.githubusercontent.com/Tdrachev/984a1ded766e1334dd28e383fb157d5a/raw/cad40372ef992b4b38f650ae7353d9ff67d40466/scanner-threshold-config.json"
  );
  const jsonConfig = fetchedConfig.data;

  config.underCapacityThreshold = jsonConfig.underCapacityThreshold;
  config.overCapacityThreshold = jsonConfig.overCapacityThreshold;
  setTimeout(async () => fetchConfigVariables, 3600 * 1000); //Update config once per hour
}

async function fetchScannersFromGraph(skip, array) {
  if (totalScannersPerQuery > 900) {
    throw new Error("The subgraph query cannot exceed 900");
  }

  const query = `{
    scanners (first:${totalScannersPerQuery} skip:${skip}){
          id
          chainId
    }
  }`;

  const fetched = await axios.default.post(config.subgraphURL, {
    query,
  });
  const res = fetched.data.data;
  array = [...array, ...res.scanners];
  if (res.scanners.length < totalScannersPerQuery) {
    const arr = [];
    array.reduce((prev, curr) => {
      prev.push({
        id: curr.id,
        chainId: curr.chainId,
      });
      return prev;
    }, arr);
    return arr;
  }
  return fetchScannersFromGraph(skip + totalScannersPerQuery, array);
}

async function initialize() {
  await ethcallProvider.init();
  await fetchConfigVariables();
  let scanners = await fetchScannersFromGraph(0, []);

  const scannerIdCalls = [];
  for (let scanner of scanners) {
    if (ethers.utils.isAddress(scanner.id))
      if (scanner.id.length > 0)
        scannerIdCalls.push(
          scannerRegistryContract.scannerAddressToId(scanner.id)
        );
  }

  scannerIds = await ethcallProvider.all(scannerIdCalls);

  const isActiveCalls = [];
  for (let scanner of scannerIds) {
    isActiveCalls.push(scannerRegistryContract.isEnabled(scanner));
  }

  const enabled = await ethcallProvider.all(isActiveCalls);
  scannerIds = scannerIds.filter((s, i) => {
    return enabled[i];
  });
  scanners = scanners.filter((s, i) => {
    return enabled[i];
  });

  for (let scanner of scanners) {
    if (scannersCountByChainId[scanner.chainId]) {
      scannersCountByChainId[scanner.chainId]++;
    } else {
      scannersCountByChainId[scanner.chainId] = 1;
    }
  }

  for (let scanner of scanners) {
    scannersLoadedWithChainId.push(scanner);
  }
  console.log(scannersLoadedWithChainId);
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
        scannerIds.push(tokenIdString);
        scannersLoaded.push({
          id: tokenIdString,
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
    if (shouldCheckCapacity) {
      scannerIds.forEach((s) => {
        scannerCapacityCalls.push(dispatcherContract.numAgentsFor(s));
      });
      const scannersCapacities = await ethcallProvider.all(
        scannerCapacityCalls
      );

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

        if (
          scannerCapacityForChainIdNormalized > config.overCapacityThreshold
        ) {
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
      shouldCheckCapacity = false;
      setTimeout(() => {
        shouldCheckCapacity = true;
      }, 3600 * 1000);
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
  setScannerIds: (ids) => {
    for (let id of ids) {
      scannerIds.push(id);
    }
  },
  resetShouldCheckCapacity: () => {
    shouldCheckCapacity = true;
  },
};
