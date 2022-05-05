const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const eventSig =
  "event AgentUpdated(uint256 indexed agentId, address indexed by, string metadata, uint256[] chainIds)";
const agentRegistryContractAddress =
  "0x61447385B019187daa48e91c55c02AF1F1f3F863";
const handleTransaction = async (txEvent) => {
  const findings = [];
  const filtered = txEvent.filterLog(eventSig, agentRegistryContractAddress);
  for (let tx of filtered) {
    const { agentId, by, metadata } = tx.args;
    const agentIdNormalised = ethers.BigNumber.from(agentId).toHexString();
    findings.push(
      Finding.fromObject({
        name: "Forta Agent Updated",
        description: `Agent Updated with AgentId: ${agentIdNormalised}`,
        alertId: "FORTA-AGENT-UPDATED",
        severity: FindingSeverity.Low,
        type: FindingType.Info,
        metadata: {
          agentId: agentIdNormalised,
          by,
          metadata,
        },
      })
    );
  }
  return findings;
};

module.exports = {
  handleTransaction,
};
