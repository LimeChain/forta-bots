const { Finding, FindingSeverity, FindingType } = require("forta-agent");

const roles = {
  "0x0000000000000000000000000000000000000000000000000000000000000000":
    "DEFAULT_ADMIN_ROLE",
  "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775":
    "ADMIN_ROLE",
  "0xdc72ed553f2544c34465af23b847953efeb813428162d767f9ba5f4013be6760":
    "WHITELIST_ROLE",
  "0x8619cecd8b9e095ab43867f5b69d492180450fe862e6b50bfbfb24b75dd84c8a":
    "WHITELISTER_ROLE",
  "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6":
    "MINTER_ROLE",
};

const ETHEREUM_CONTRACT_ADDRESS = "0x41545f8b9472D758bB669ed8EaEEEcD7a9C4Ec29";
const POLYGON_CONTRACT_ADDRESS = "0x9ff62d1FC52A907B6DCbA8077c2DDCA6E6a9d3e1";

// Returns the name of the role or 'UKNOWN_ROLE' if the role is not in the list
function getRoleName(role) {
  return roles[role] || "UNKNOWN_ROLE";
}

module.exports = {
  EVENT_SIGNATURES: [
    "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
    "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
    "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
  ],
  getRoleName,
  getAddressAndNetworkByChainId: (chainId) => {
    switch (chainId) {
      case 1:
        return {
          contractAddress: ETHEREUM_CONTRACT_ADDRESS,
          network: "Ethereum",
        };
      case 137:
        return {
          contractAddress: POLYGON_CONTRACT_ADDRESS,
          network: "Polygon",
        };
      default:
        throw new Error(
          `Unsupported chainId (${chainId}). The bot supports Ethereum (1) and Polygon (137)`
        );
    }
  },
  createRoleGrantedAlert(role, account, sender, network) {
    return Finding.fromObject({
      name: "Role Granted",
      description: `Role ${getRoleName(
        role
      )} granted for ${account} on the ${network} blockchain`,
      alertId: "FORTA-TOKEN-ROLE-GRANTED",
      protocol: "forta",
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        role: getRoleName(role),
        account,
        sender,
        network,
      },
    });
  },
  createRoleRevokedAlert(role, account, sender, network) {
    return Finding.fromObject({
      name: "Role Revoked",
      description: `Role ${getRoleName(
        role
      )} revoked for ${account} on the ${network} blockchain`,
      alertId: "FORTA-TOKEN-ROLE-REVOKED",
      protocol: "forta",
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        role: getRoleName(role),
        account,
        sender,
        network,
      },
    });
  },
  createAdminRoleChangedAlert(role, previousAdminRole, newAdminRole, network) {
    return Finding.fromObject({
      name: "Role Admin Changed",
      description: `${getRoleName(
        role
      )}'s admin role changed from ${getRoleName(
        previousAdminRole
      )} to ${getRoleName(newAdminRole)} on the ${network} blockchain`,
      alertId: "FORTA-TOKEN-ROLE-ADMIN-CHANGED",
      protocol: "forta",
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        role: getRoleName(role),
        previousAdminRole,
        newAdminRole,
        network,
      },
    });
  },
  ETHEREUM_CONTRACT_ADDRESS, // exported for unit tests
  POLYGON_CONTRACT_ADDRESS, // exported for unit tests
};
