const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contracts } = require("./agent.config.json");

let contractNames;
let contractAddresses;

function initialize() {
  const contractNames = Object.keys(contracts);
  const contractAddresses = contracts.map((i) => i.address);
  console.log(contractNames, contractAddresses);
}

const handleTransaction = async (txEvent) => {
  const findings = [];

  tetherTransferEvents.forEach((transferEvent) => {
    // extract transfer event arguments
    const { to, from, value } = transferEvent.args;
    // shift decimals of transfer value
    const normalizedValue = value.div(10 ** TETHER_DECIMALS);

    // if more than 10,000 Tether were transferred, report it
    if (normalizedValue.gt(10000)) {
      findings.push(
        Finding.fromObject({
          name: "High Tether Transfer",
          description: `High amount of USDT transferred: ${normalizedValue}`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to,
            from,
          },
        })
      );
    }
  });

  return findings;
};

module.exports = {
  initialize,
  handleTransaction,
};
