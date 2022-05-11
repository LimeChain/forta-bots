const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contract } = require("./agent.config.json");

const handleTransaction = async (txEvent) => {
  const findings = [];

  // filter the transaction logs for abi defined events
  const txFiltered = txEvent.filterLog(abi, contract);

  txFiltered.forEach((tx) => {
    const from = txEvent.from;
    const fromLowerCase = from.toLowerCase();
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
            changedBy: fromLowerCase,
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
            changedBy: fromLowerCase,
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
