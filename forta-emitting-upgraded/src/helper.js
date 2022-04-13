const { contractsPolygon, contractsEthereum } = require("./agent.config.json");

const getContractsByChainId = (chainId) => {
  switch (chainId) {
    case 1:
      return contractsEthereum;
    case 137:
      return contractsPolygon;
    default:
      return null;
  }
};

module.exports = {
  getContractsByChainId,
};
