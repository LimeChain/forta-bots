const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");
const {
  contractAddress,
  eventABI,
  timeThreshold,
} = require("./agent.config.json");

const TimeHandler = require("./TimeHandler");

const timeHandler = new TimeHandler(timeThreshold);

function provideHandleTransaction(timeHandler) {
  return async function handleTransaction(txEvent) {
    const findings = [];
    const filtered = txEvent.filterLog(eventABI, contractAddress);
    let aboveThreshold = [];

    filtered.forEach((tx) => {
      const { name } = tx;
      if (name == "Transfer") {
        timeHandler.addToListUpdated(tx.args.agentId);
      } else if (name == "Link") {
        timeHandler.addToListLinked(tx.args.agentId);
      }
    });

    aboveThreshold = timeHandler.checkIfPassedThreshold();

    if (aboveThreshold.length > 0) {
      aboveThreshold.forEach((address) => {
        const addressAsHex = ethers.BigNumber.from(address).toHexString();
        findings.push(
          Finding.fromObject({
            name: "Forta Bot Linked over threshold ",
            description: `Forta Bot Linked: botAddress: ${addressAsHex} over the threshold: ${
              timeThreshold / 60
            } minutes`,
            alertId: "FORTA-BOT-LINKED",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              botAddress: addressAsHex,
            },
          })
        );
      });
      timeHandler.reset();
    }
    return findings;
  };
}

module.exports = {
  handleTransaction: provideHandleTransaction(timeHandler),
  provideHandleTransaction,
};
