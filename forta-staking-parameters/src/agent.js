const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contract } = require("./agent.config.json");

const handleTransaction = async (txEvent) => {
  const findings = [];

  // filter the transaction logs for abi defined events
  const txFiltered = txEvent.filterLog(abi, contract);
  const from = txEvent.from;
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
          protocol: "forta",
          metadata: {
            oldHandler,
            newHandler,
            changedBy: from,
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
          protocol: "forta",
          metadata: {
            staking,
            changedBy: from,
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
