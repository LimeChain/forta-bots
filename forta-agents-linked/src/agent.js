const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { contractAddress, eventABI } = require("./agent.config.json");

const handleTransaction = async (txEvent) => {
  const findings = [];
  const filtered = txEvent.filterLog(eventABI, contractAddress);
  filtered.forEach((tx) => {
    const { agentId, scannerId, enable } = tx.args;
    if (enable) {
      const agentAddress = agentId.toHexString();
      const scannerAddress = scannerId.toHexString();

      findings.push(
        Finding.fromObject({
          name: "Forta Agent Assigned ",
          description: `Forta Agent Assigned: agentAddress: ${agentAddress}`,
          alertId: "FORTA-AGENT-ASSIGNED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentAddress,
            scannerAddress,
            enable,
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
