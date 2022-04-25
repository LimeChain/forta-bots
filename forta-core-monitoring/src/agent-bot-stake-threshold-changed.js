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
          name: "Forta Staking Threshold changed",
          description: `Staking threshold changed `,
          alertId: "FORTA-STAKING-THRESHOLD-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
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
