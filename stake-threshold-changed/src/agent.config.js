const { Finding, FindingSeverity, FindingType } = require('forta-agent');

const contracts = {
  '0xbf2920129f83d75dec95d97a879942cce3dcd387': 'Forta Scanners',
  '0x61447385b019187daa48e91c55c02af1f1f3f863': 'Forta Agents',
};

module.exports = {
  contracts,
  EVENT_SIGNATURES: [
    'event StakeThresholdChanged(uint256 indexed chainId, uint256 min, uint256 max, bool activated)',
    'event StakeThresholdChanged(uint256 min, uint256 max, bool activated)',
  ],
  createScannersAlert(args) {
    const {
      chainId,
      min,
      max,
      activated,
    } = args;

    return Finding.fromObject({
      name: 'Stake Threshold Changed',
      description: 'stakeController changed for Forta Scanners',
      alertId: 'FORTA-STAKE-THRESHOLD-CHANGED',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        chainId: chainId.toString(),
        min: min.toString(),
        max: max.toString(),
        activated,
      },
    });
  },
  createAgentsAlert(args) {
    const {
      min,
      max,
      activated,
    } = args;

    return Finding.fromObject({
      name: 'Stake Threshold Changed',
      description: 'stakeController changed for Forta Agents',
      alertId: 'FORTA-STAKE-THRESHOLD-CHANGED',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        min: min.toString(),
        max: max.toString(),
        activated,
      },
    });
  },
};
