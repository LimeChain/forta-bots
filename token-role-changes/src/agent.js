const { getEthersProvider } = require('forta-agent');
const {
  EVENT_SIGNATURES,
  getAddressByChainId,
  createRoleGrantedAlert,
  createRoleRevokedAlert,
  createAdminRoleChangedAlert,
} = require('./agent.config');

// Set the FORT contract address based on the chainId
let contractAddress;
function provideInitialize(getProvider) {
  return async function initialize() {
    const { chainId } = await getProvider().getNetwork();
    contractAddress = getAddressByChainId(chainId);
  };
}

const handleTransaction = async (txEvent) => {
  const findings = [];

  const events = txEvent.filterLog(EVENT_SIGNATURES, contractAddress);

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
  initialize: provideInitialize(getEthersProvider),
  provideInitialize,
  handleTransaction,
  getContractAddress: () => contractAddress, // exported for unit tests
};
