const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const ADDRESS_ZERO = ethers.constants.AddressZero;

function handleBotMintingTransactions(
  txEvent,
  abi,
  contractAddresses,
  contractNames
) {
  const findings = [];

  const txFiltered = txEvent.filterLog(abi, contractAddresses);

  txFiltered.forEach((tx) => {
    const { from, to, tokenId } = tx.args;
    const tokenIdNormalized = ethers.BigNumber.from(tokenId).toString();
    if (tokenId && from === ADDRESS_ZERO) {
      findings.push(
        Finding.fromObject({
          name: "Forta new bot minted",
          description: `New bot minted with tokenId: ${tokenIdNormalized}`,
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
  mintAgent: handleBotMintingTransactions,
};
