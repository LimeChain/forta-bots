const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const chainIdsToName = {
  1: "Ethereum",
  137: "Polygon",
  56: "Binance Smart Chain",
  43114: "Avalanche",
  42161: "Arbitrum",
  10: "Optimism",
  250: "Fantom",
};

const eventSigs = [
  "event AgentUpdated(uint256 indexed agentId, address indexed by, string metadata, uint256[] chainIds)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];
const ADDRESS_ZERO = ethers.constants.AddressZero;
const agentRegistryContractAddress =
  "0x61447385B019187daa48e91c55c02AF1F1f3F863";
const handleTransaction = async (txEvent) => {
  const findings = [];
  const filtered = txEvent.filterLog(eventSigs, agentRegistryContractAddress);

  for (let tx of filtered) {
    const { agentId, by, metadata, chainIds } = tx.args;
    const { from, tokenId } = tx.args;

    if (from && from == ADDRESS_ZERO) {
      const agentIdNormalised = ethers.BigNumber.from(tokenId).toHexString();
      findings.push(
        Finding.fromObject({
          name: "Forta Bot Created",
          description: `Bot Created with AgentId: ${agentIdNormalised}`,
          alertId: "FORTA-BOT-CREATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            agentId: agentIdNormalised,
          },
        })
      );
    } else {
      const agentIdNormalised = ethers.BigNumber.from(agentId).toHexString();
      const chainIdsWithNames = chainIds.map(
        (id) => chainIdsToName[id.toNumber()]
      );
      findings.push(
        Finding.fromObject({
          name: "Forta Bot Updated",
          description: `Bot Updated with AgentId: ${agentIdNormalised}`,
          alertId: "FORTA-BOT-UPDATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            agentId: agentIdNormalised,
            by,
            metadata,
            chainIds: chainIdsWithNames,
          },
        })
      );
    }
  }
  return findings;
};

module.exports = {
  handleTransaction,
};
