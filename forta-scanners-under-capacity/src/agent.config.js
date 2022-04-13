const { Contract, Provider } = require("ethers-multicall");
const { ethers } = require("forta-agent");

const agentRegistryAbi = require("./abis/agentregistry.json");

const config = {
  contracts: {
    "0xd46832F3f8EA8bDEFe5316696c0364F01b31a573": "Dispatcher",
    "0x61447385B019187daa48e91c55c02AF1F1f3F863": "Agent Registry",
  },
  chainIds: [1, 137, 56, 43114, 42161, 10, 250],
};

const generateInternalScannerBotDatabase = async (provider) => {
  const contractAddresses = Object.keys(config.contracts);
  const ethcallProvider = new Provider(provider);
  await ethcallProvider.init();

  const agentRegistryContract = new Contract(
    contractAddresses[1],
    agentRegistryAbi
  );

  const agentCountChainCall = agentRegistryContract.getAgentCountByChain(1);

  const [agentCountForChainId] = await ethcallProvider.all([
    agentCountChainCall,
  ]);
  console.log(ethers.BigNumber.from(agentCountForChainId).toNumber());
};

module.exports = {
  generateInternalScannerBotDatabase,
};
