const {
  contracts,
  EVENT_SIGNATURE,
  createAlert,
} = require('./agent.config');

const contractAddresses = Object.keys(contracts);

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURE, contractAddresses);

  events.forEach((event) => {
    const { newstakeController } = event.args;
    findings.push(createAlert(event.address, newstakeController));
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
