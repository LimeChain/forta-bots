const config = {
  contracts: {
    "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573": "Dispatcher",
    "0x61447385B019187daa48e91c55c02AF1F1f3F863": "Agent Registry",
  },
  chainIds: [1, 137, 56, 43114, 42161, 10, 250],
  SLA_THRESHOLD: 0.9,
  interval: 60 * 1000,
};

module.exports = {
  config,
};
