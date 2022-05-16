const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const ADDRESS_ZERO = ethers.constants.AddressZero;

function handleBotStakeThresholdChanges(
  txEvent,
  abi,
  contractAddresses,
  contractNames
) {
  const findings = [];

  const txFiltered = txEvent.filterLog(abi, contractAddresses);

  txFiltered.forEach((tx) => {
    const { min, max, activated } = tx.args;
    const minNormalized = ethers.BigNumber.from(min).toString();
    const maxNormalized = ethers.BigNumber.from(max).toString();
    if (min && max && activated) {
      findings.push(
        Finding.fromObject({
          name: "Forta Bot Staking Threshold changed",
          description: `Forta Bot Staking threshold changed `,
          alertId: "FORTA-BOT-STAKING-THRESHOLD-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            min: minNormalized,
            max: maxNormalized,
            activated,
          },
        })
      );
    }
  });

  return findings;
}

module.exports = {
  stakingChange: handleBotStakeThresholdChanges,
};
