const config = {
  contracts: {
    "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573": "Dispatcher",
    "0x61447385B019187daa48e91c55c02AF1F1f3F863": "Agent Registry",
    "0xbF2920129f83d75DeC95D97A879942cCe3DcD387": "Scanner Registry",
  },
  chainIds: [1, 137, 56, 43114, 42161, 10, 250],
  overCapacityThreshold: 90,
  underCapacityThreshold: 20,
};

module.exports = {
  config,
};
