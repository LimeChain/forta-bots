const config = {
  scannerRegistryContract: "0xbF2920129f83d75DeC95D97A879942cCe3DcD387",
  chainIds: [1, 137, 56, 43114, 42161, 10, 250],
  SLA_THRESHOLD: 0.9,
  interval: 60 * 60 * 1000,
  subgraphURL:
    "https://api.thegraph.com/subgraphs/name/tdrachev/forta-subgraph",
};

module.exports = {
  config,
};
