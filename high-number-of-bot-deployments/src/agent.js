const { ethers } = require('forta-agent');
const {
  AGENT_REGISTRY,
  EVENT_SIGNATURE,
  COUNT_THRESHOLD,
  TIME_INTERVAL_MINS,
  createAlert,
} = require('./agent.config');
const TransactionCounter = require('./transaction.counter');

const ADDRESS_ZERO = ethers.constants.AddressZero;

const txCounter = new TransactionCounter(TIME_INTERVAL_MINS);

function provideHandleTransaction(counter) {
  return async function handleTransaction(txEvent) {
    const findings = [];

    const { hash, timestamp } = txEvent;
    const events = txEvent.filterLog(EVENT_SIGNATURE, AGENT_REGISTRY);

    events.forEach((event) => {
      const { from } = event.args;

      // If the 'from' address is the address zero then
      // this is a mint transaction
      if (from === ADDRESS_ZERO) {
        const count = counter.increment(hash, timestamp);

        if (count === COUNT_THRESHOLD) {
          findings.push(createAlert(counter.getTransactions()));
          counter.reset();
        }
      }
    });

    return findings;
  };
}

module.exports = {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(txCounter),
};
