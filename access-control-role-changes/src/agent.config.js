const { Finding, FindingSeverity, FindingType } = require('forta-agent');

const roles = {
  '0x0000000000000000000000000000000000000000000000000000000000000000': 'DEFAULT_ADMIN_ROLE',
  '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775': 'ADMIN_ROLE',
  // Routing
  '0x56623da34b1ec5cb86498f15a28504a6323a0eedfb150423fe6f418d952826ee': 'ROUTER_ADMIN_ROLE',
  // Base component
  '0x664245c7af190fec316596e8231f724e8171b1966cfcd124347ac5a66c34f64a': 'ENS_MANAGER_ROLE',
  '0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3': 'UPGRADER_ROLE',
  // Registries
  '0x2a32a1662c1214ad9d5a31a0a1cb01ef357b3d1954570b75c128485ad3931dbc': 'AGENT_ADMIN_ROLE',
  '0xbfe45770ac5a9057f648bdbd7f3526086df3fa2d93fe61f5b631e50d01f0074a': 'SCANNER_ADMIN_ROLE',
  '0xfbd38eecf51668fdbc772b204dc63dd28c3a3cf32e3025f52a80aa807359f50c': 'DISPATCHER_ROLE',
  // Staking
  '0x12b42e8a160f6064dc959c6f251e3af0750ad213dbecf573b4710d67d6c28e39': 'SLASHER_ROLE',
  '0x8aef0597c0be1e090afba1f387ee99f604b5d975ccbed6215cdf146ffd5c49fc': 'SWEEPER_ROLE',
  '0xdb6fbae5cd13d8264d7ed12219ef2882c1e83b8b12f47819baa96f32f69a1682': 'REWARDS_ADMIN_ROLE',
  // Scanner Node Version
  '0x93bf097503ee765c5402c05999a7d54bac82299bf183ba1f5f2681ab2c6bd70c': 'SCANNER_VERSION_ROLE',
};

// Returns the name of the role or 'UKNOWN_ROLE' if the role is not in the list
function getRoleName(role) {
  return roles[role] || 'UNKNOWN_ROLE';
}

module.exports = {
  ACCESS_CONTROL_ADDRESS: '0x107Ac13567b1b5D84691f890A5bA07EdaE1a11c3',
  EVENT_SIGNATURES: [
    'event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)',
    'event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)',
    'event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)',
  ],
  getRoleName,
  createRoleGrantedAlert(role, account, sender) {
    return Finding.fromObject({
      name: 'Role Granted',
      description: `Role ${getRoleName(role)} granted for ${account}`,
      alertId: 'FORTA-ACCESS-CONTROL-ROLE-GRANTED',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        role,
        account,
        sender,
      },
    });
  },
  createRoleRevokedAlert(role, account, sender) {
    return Finding.fromObject({
      name: 'Role Revoked',
      description: `Role ${getRoleName(role)} revoked for ${account}`,
      alertId: 'FORTA-ACCESS-CONTROL-ROLE-REVOKED',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        role,
        account,
        sender,
      },
    });
  },
  createAdminRoleChangedAlert(role, previousAdminRole, newAdminRole) {
    return Finding.fromObject({
      name: 'Role Admin Changed',
      description: `${getRoleName(role)}'s admin role changed from ${getRoleName(previousAdminRole)} to ${getRoleName(newAdminRole)}`,
      alertId: 'FORTA-ACCESS-CONTROL-ROLE-ADMIN-CHANGED',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        role,
        previousAdminRole,
        newAdminRole,
      },
    });
  },
};
