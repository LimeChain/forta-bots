const {
  contracts,
  EVENT_SIGNATURES,
  createScannersAlert,
  createAgentsAlert,
} = require("./agent.config");

const contractAddresses = Object.keys(contracts);

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURES, contractAddresses);
  const from = txEvent.from;
  const fromToLowerCase = from.toLowerCase();
  events.forEach((event) => {
    const { address } = event;

    if (contracts[address] === "Forta Scanners") {
      findings.push(createScannersAlert(event.args, fromToLowerCase));
    } else {
      findings.push(createAgentsAlert(event.args, fromToLowerCase));
    }
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
