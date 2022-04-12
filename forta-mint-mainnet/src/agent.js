const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");
const { events, contractAddresses } = require("./agent.config.json");
const ADDRESS_ZERO = ethers.constants.AddressZero;
function provideHandleTransaction() {
  return async function handleTransaction(txEvent) {
    const findings = [];

    const filteredTxEvent = txEvent.filterLog(events[0], contractAddresses[0]);

    filteredTxEvent.forEach((tx) => {
      if (tx.args.from === ADDRESS_ZERO) {
        const valueMinted = ethers.utils.formatEther(tx.args.value);
        //if it is a mint transaction we report it
        findings.push(
          Finding.fromObject({
            name: "Forta MainNet Mint",
            description: `Forta tokens minted amount: ${valueMinted}`,
            alertId: "FORTA-1",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              to: tx.args.to,
              value: valueMinted,
            },
          })
        );
      }
    });

    return findings;
  };
}

module.exports = {
  handleTransaction: provideHandleTransaction(),
};
