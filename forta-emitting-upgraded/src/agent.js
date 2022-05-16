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

    const txFiltered = txEvent.filterLog(
      abi,
      contracts.map((ct) => ct.address)
    );
    const from = txEvent.from;
    txFiltered.forEach((tx) => {
      const { implementation } = tx.args;
      const fromLowerCase = from.toLowerCase();
      const contact = contracts.filter(
        (ct) => ct.address.toLowerCase() == tx.address.toLowerCase()
      )[0];
      findings.push(
        Finding.fromObject({
          name: "FORTA Contract Upgraded",
          description: `FORTA Contract Upgraded: ${contact.name}, on ChainId: ${currentChainId}`,
          alertId: "FORTA-EMIT-UPGRADED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            name: contact.name,
            address: contact.address,
            upgradedBy: fromLowerCase,
            implementation,
            currentChainId,
          },
        })
      );
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
