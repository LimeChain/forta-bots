const {
  ACCESS_CONTROL_ADDRESS,
  EVENT_SIGNATURES,
  createRoleGrantedAlert,
  createRoleRevokedAlert,
  createAdminRoleChangedAlert,
} = require('./agent.config');

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURES, ACCESS_CONTROL_ADDRESS);

  events.forEach((event) => {
    const { name } = event;

    switch (name) {
      case 'RoleGranted': {
        const { role, account, sender } = event.args;
        findings.push(createRoleGrantedAlert(
          role,
          account,
          sender,
        ));
        break;
      }
      case 'RoleRevoked': {
        const { role, account, sender } = event.args;
        findings.push(createRoleRevokedAlert(
          role,
          account,
          sender,
        ));
        break;
      }
      case 'RoleAdminChanged': {
        const { role, previousAdminRole, newAdminRole } = event.args;
        findings.push(createAdminRoleChangedAlert(
          role,
          previousAdminRole,
          newAdminRole,
        ));
        break;
      }
      // no default
    }
  });

  return findings;
};

module.exports = {
  handleTransaction,
};
