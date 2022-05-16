const data = {
  abi: [
    "event ScannerEnabled(uint256 indexed scannerId, bool indexed enabled, uint8 permission, bool value)",
    "event AgentEnabled(uint256 indexed agentId, bool indexed enabled, uint8 permission, bool value)",
  ],
  contracts: {
    "0xbF2920129f83d75DeC95D97A879942cCe3DcD387": "Scanner Registry",
    "0x61447385B019187daa48e91c55c02AF1F1f3F863": "Agent Registry",
  },
};

const PermissionsScanner = {
  0: "ADMIN",
  1: "SELF",
  2: "OWNER",
  3: "MANAGER",
  4: "length",
};

const PermissionsBot = {
  0: "ADMIN",
  1: "OWNER",
  2: "length",
};

module.exports = {
  abi: data.abi,
  contracts: data.contracts,
  PermissionsScanner,
  PermissionsBot,
};
