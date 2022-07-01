const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} = require("forta-agent");
const axios = require("axios");
const { config } = require("./agent.config");
const { Provider, Contract } = require("ethers-multicall");
const ADDRESS_ZERO = ethers.constants.AddressZero;
const mintAbi =
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)";
const totalScannersPerQuery = 900; //Max scanners per query cannot exceed 900
const provider = getEthersProvider();
const ethcallProvider = new Provider(provider);
const scannerABI = require("./abis/scannerregistry.json");
const scannerRegistry = new Contract(
  config.scannerRegistryContract,
  scannerABI
);
let scannersLoaded = [];
let alerts = [];
let isChecking = false;
let lastCheck = 0;

async function fetchScannersFromGraph(skip, array) {
  if (totalScannersPerQuery > 900) {
    throw new Error("The subgraph query cannot exceed 900");
  }

  const query = `{
    scanners (first:${totalScannersPerQuery} skip:${skip}){
          id
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
  let scanners = await fetchScannersFromGraph(0, []);
  const scannerEnabledCalls = [];
  scanners.forEach((s) => {
    scannerEnabledCalls.push(
      scannerRegistry.isEnabled(ethers.BigNumber.from(s.id).toString())
    );
  });
  const scannersEnabled = await ethcallProvider.all(scannerEnabledCalls);
  scanners = scanners.filter((s, i) => {
    return scannersEnabled[i];
  });
  for (let scanner of scanners) {
    scannersLoaded.push(scanner);
  }
}

//Here we check if a new scanner is minted so we can add it to the array of scanners
function provideHandleTransaction(scannersLoaded) {
  return async function handleTransaction(txEvent) {
    const findings = [];
    const txFiltered = txEvent.filterLog(
      mintAbi,
      config.scannerRegistryContract
    );

    for (let tx of txFiltered) {
      const { from, tokenId } = tx.args;

      if (from === ADDRESS_ZERO) {
        const tokenIdString = tokenId.toHexString();
        scannersLoaded.push({ id: tokenIdString });
      }
    }

    return findings;
  };
}

function provideHandleBlock(scannersLoaded) {
  return async function handleBlock(blockNumber) {
    const now = Date.now();
    let findings = [];
    if (alerts.length > 0) {
      findings = alerts;
      alerts = [];
    }
    if (!isChecking && now - lastCheck > config.interval) {
      runJob(scannersLoaded);
    }
    return findings;
  };
}

async function runJob(scannersLoaded) {
  isChecking = true;
  lastCheck = Date.now();
  for (let s of scannersLoaded) {
    const scannerAddress = s.id;

    try {
      const scannerSlaData = await axios.default.get(
        "https://api.forta.network/stats/sla/scanner/" + scannerAddress
      );

      const scannerSlaAvgValue = scannerSlaData.data.statistics.avg;

      if (scannerSlaAvgValue < config.SLA_THRESHOLD) {
        alerts.push(
          Finding.fromObject({
            name: "Scanner SLA under threshold",
            description: `Scanner SLA is under the threshold and might get disqualifed, scannerId: ${s.id}`,
            alertId: "FORTA-SCANNER-SLA-UNDER-THRESHOLD",
            severity: FindingSeverity.High,
            type: FindingType.Info,
            metadata: {
              scannerId: s,
              slaValue: scannerSlaAvgValue,
            },
          })
        );
      }
    } catch (e) {
      console.log(e.message);
    }
  }
  isChecking = false;
}

module.exports = {
  initialize,
  handleTransaction: provideHandleTransaction(scannersLoaded),
  handleBlock: provideHandleBlock(scannersLoaded),
  provideHandleBlock,
  provideHandleTransaction,
};
