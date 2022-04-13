const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} = require("forta-agent");

const { abi } = require("./agent.config.json");
const { getContractsByChainId } = require("./helper");

let contracts = [];
let currentChainId = 1;
const provider = getEthersProvider();

function provideInitialize() {
  return async function initialize() {
    const { chainId } = await provider.getNetwork();
    currentChainId = chainId;
    contracts = getContractsByChainId(chainId);
  };
}

function provideHandleTransaction(getContracts) {
  return async function handleTranscation(txEvent) {
    let findings = [];
    const contracts = getContracts();
    //Loop trough each contract for each tx and check if there is an upgraded event called
    contracts.forEach((ct) => {
      const txFiltered = txEvent.filterLog(abi, ct.address);

      txFiltered.forEach((tx) => {
        findings.push(
          Finding.fromObject({
            name: "FORTA Contract Upgraded",
            description: `FORTA Contract Upgraded: ${ct.name}, on ChainId: ${currentChainId}`,
            alertId: "FORTA-EMIT-UPGRADED",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              name: ct.name,
              address: ct.address,
            },
          })
        );
      });
    });
    return findings;
  };
}

const getContracts = () => {
  return contracts;
};

module.exports = {
  initialize: provideInitialize(getContractsByChainId),
  handleTransaction: provideHandleTransaction(getContracts),
  provideHandleTransaction,
};
