const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contract } = require("./agent.config.json");

const handleTransaction = async (txEvent) => {
  const findings = [];

  const txFiltered = txEvent.filterLog(abi, contract);

  txFiltered.forEach((tx) => {
    const { oldVersion, newVersion } = tx.args;

    findings.push(
      Finding.fromObject({
        name: "Scanner Node Version Updated",
        description: `Scanner Node Version has been updated on Polygon Mainnet`,
        alertId: "FORTA-SCANNER-NODE-UPDATED",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          oldVersion,
          newVersion,
        },
      })
    );
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
