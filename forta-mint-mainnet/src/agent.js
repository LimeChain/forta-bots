const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");
const { event, contractAddress } = require("./agent.config.json");
const ADDRESS_ZERO = ethers.constants.AddressZero;
function provideHandleTransaction() {
  return async function handleTransaction(txEvent) {
    const findings = [];

    const filteredTxEvent = txEvent.filterLog(event, contractAddress);
    const from = txEvent.from;
    filteredTxEvent.forEach((tx) => {
      const fromToLower = from.toLowerCase();
      if (tx.args.from === ADDRESS_ZERO) {
        const valueMinted = ethers.utils.formatEther(tx.args.value);
        //if it is a mint transaction we report it
        findings.push(
          Finding.fromObject({
            name: "Forta MainNet Mint",
            description: `Forta tokens minted amount: ${valueMinted}`,
            alertId: "FORTA-MINT-MAINNET",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            protocol: "forta",
            metadata: {
              to: tx.args.to,
              value: valueMinted,
              mintedBy: fromToLower,
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
