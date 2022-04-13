const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const ADDRESS_ZERO = ethers.constants.AddressZero;

function handleBotStateChanges(txEvent, abi, contractAddresses, contractNames) {
  const findings = [];

  const txFiltered = txEvent.filterLog(abi, contractAddresses);

  txFiltered.forEach((tx) => {
    const { from, to, tokenId } = tx.args;
    const tokenIdNormalized = ethers.BigNumber.from(tokenId).toString();
    if (tokenId && from === ADDRESS_ZERO) {
      findings.push(
        Finding.fromObject({
          name: "Forta bot state updated",
          description: `Forta bot state updated with agentId: ${}`,
          alertId: "FORTA-NEW-BOT",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to,
            tokenId: tokenIdNormalized,
          },
        })
      );
    }
  });

  return findings;
}

module.exports = {
  stateAgent: handleBotStateChanges,
};
