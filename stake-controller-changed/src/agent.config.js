const { Finding, FindingSeverity, FindingType } = require('forta-agent');

const contracts = {
  '0xbf2920129f83d75dec95d97a879942cce3dcd387': 'Forta Scanners',
  '0x61447385b019187daa48e91c55c02af1f1f3f863': 'Forta Agents',
};

module.exports = {
  contracts,
  EVENT_SIGNATURE: 'event StakeControllerUpdated(address indexed newstakeController)',
  createAlert(address, newstakeController) {
    const contractName = contracts[address];
    const alertName = contractName.replace(' ', '-').toUpperCase();
    return Finding.fromObject({
      name: 'Stake Controller Changed',
      description: `stakeController changed for ${contractName}`,
      alertId: `FORTA-STAKE-CONTROLLER-CHANGED-FOR-${alertName}`,
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        address,
        newstakeController,
      },
    });
  },
};
