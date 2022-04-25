const {
  contracts,
  EVENT_SIGNATURES,
  createScannersAlert,
  createAgentsAlert,
} = require('./agent.config');

const contractAddresses = Object.keys(contracts);

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURES, contractAddresses);

  events.forEach((event) => {
    const { address } = event;

    if (contracts[address] === 'Forta Scanners') {
      findings.push(createScannersAlert(event.args));
    } else {
      findings.push(createAgentsAlert(event.args));
    }
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
