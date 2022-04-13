const {
  FORTA_STAKING_ADDRESS,
  EVENT_SIGNATURES,
  createAlert,
} = require('./agent.config');

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURES, FORTA_STAKING_ADDRESS);

  events.forEach((event) => {
    const { name } = event;

    // Filter out args that are not "name: value"
    const args = {};
    Object.entries(event.args)
      .filter(([key]) => Number.isNaN(+key)) // Remove all number elements (they are indexes)
      .map(([key, value]) => [key, value.toString()]) // Call toString to convert BigNumber elements
      .forEach(([key, value]) => {
        args[key] = value;
      });

    findings.push(createAlert(name, args));
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
