const {
  ROUTER_ADDRESS,
  EVENT_SIGNATURE,
  createAlert,
} = require("./agent.config");

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURE, ROUTER_ADDRESS);
  const from = txEvent.from;

  events.forEach((event) => {
    findings.push(createAlert(event.args, from));
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
