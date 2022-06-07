const {
  Finding,
  FindingSeverity,
  FindingType,
  getEthersProvider,
  ethers,
} = require("forta-agent");

const ETHEREUM_CONTRACT_ADDRESS = "0x41545f8b9472D758bB669ed8EaEEEcD7a9C4Ec29";
const POLYGON_CONTRACT_ADDRESS = "0x9ff62d1FC52A907B6DCbA8077c2DDCA6E6a9d3e1";

const ABI = ["function whitelistDisabled() external view returns (bool)"];

module.exports = {
  getContractAndNetwork: async () => {
    const { chainId } = await getEthersProvider().getNetwork();
    switch (chainId) {
      case 1: {
        const contract = new ethers.Contract(
          ETHEREUM_CONTRACT_ADDRESS,
          ABI,
          getEthersProvider()
        );
        return { contract, network: "Ethereum", contractAddress: ETHEREUM_CONTRACT_ADDRESS };
      }
      case 137: {
        const contract = new ethers.Contract(
          POLYGON_CONTRACT_ADDRESS,
          ABI,
          getEthersProvider()
        );
        return { contract, network: "Polygon", contractAddress: POLYGON_CONTRACT_ADDRESS };
      }
      default:
        throw new Error(
          `Unsupported chainId (${chainId}). The bot supports Ethereum (1) and Polygon (137)`
        );
    }
  },
  createAlert(network, from) {
    return Finding.fromObject({
      name: "Whitelist Disabled",
      description: `Whitelist disabled on the ${network} blockchain`,
      alertId: "WHITELIST-DISABLED",
      protocol: "forta",
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        network,
        disabledBy: from,
      },
    });
  },
  ETHEREUM_CONTRACT_ADDRESS, // exported for unit tests
  POLYGON_CONTRACT_ADDRESS, // exported for unit tests
};
