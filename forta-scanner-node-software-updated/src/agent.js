const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contract } = require("./agent.config.json");

const handleTransaction = async (txEvent) => {
  const findings = [];

  const txFiltered = txEvent.filterLog(abi, contract);
  const from = txEvent.from;
  txFiltered.forEach((tx) => {
    const { oldVersion, newVersion } = tx.args;
    const fromLowerCase = from.toLowerCase();
    findings.push(
      Finding.fromObject({
        name: "Scanner Node Version Updated",
        description: `Scanner Node Version has been updated on Polygon Mainnet`,
        alertId: "FORTA-SCANNER-NODE-UPDATED",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        protocol: "forta",
        metadata: {
          oldVersion,
          newVersion,
          updatedBy: fromLowerCase,
        },
      })
    );
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
