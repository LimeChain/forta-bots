const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contract } = require("./agent.config.json");

const handleTransaction = async (txEvent) => {
  const findings = [];

  // filter the transaction logs for abi defined events
  const txFiltered = txEvent.filterLog(abi, contract);

  txFiltered.forEach((tx) => {
    const { oldHandler, newHandler, staking } = tx.args;
    if (oldHandler) {
      findings.push(
        Finding.fromObject({
          name: "Forta Staking Parameters emitted",
          description: `Forta Staking Parameters emitted: ${tx.name} `,
          alertId: `FORTA-STAKING-PARAMETERS-${tx.name.toUpperCase()}`,
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            oldHandler,
            newHandler,
          },
        })
      );
    } else if (staking) {
      findings.push(
        Finding.fromObject({
          name: "Forta Staking Parameters emitted",
          description: `Forta Staking Parameters emitted: ${tx.name} `,
          alertId: `FORTA-STAKING-PARAMETERS-${tx.name.toUpperCase()}`,
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            staking,
          },
        })
      );
    }
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
