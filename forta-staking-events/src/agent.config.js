const { Finding, FindingSeverity, FindingType } = require('forta-agent');

module.exports = {
  FORTA_STAKING_ADDRESS: '0xd2863157539b1D11F39ce23fC4834B62082F6874',
  EVENT_SIGNATURES: [
    'event Slashed(uint8 indexed subjectType, uint256 indexed subject, address indexed by, uint256 value)',
    'event TokensSwept(address indexed token, address to, uint256 amount)',
    'event DelaySet(uint256 newWithdrawalDelay)',
    'event TreasurySet(address newTreasury)',
    'event StakeParamsManagerSet(address indexed newManager)',
    'event Froze(uint8 indexed subjectType, uint256 indexed subject, address indexed by, bool isFrozen)',
  ],
  createAlert(name, args) {
    return Finding.fromObject({
      name: 'Forta Staking Event',
      description: `Event ${name} emitted from the Forta Staking contract`,
      alertId: 'FORTA-STAKING-EVENTS',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        event: name,
        args,
      },
    });
  },
};
