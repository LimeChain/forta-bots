const { getContractAndNetwork, createAlert } = require("./agent.config");

let wasDisabled = false;

let contract;
let network;
let contractAddress;
function provideInitialize(getContractAndNetworkFn) {
  return async function initialize() {
    ({ contract, network, contractAddress } = await getContractAndNetworkFn());
    const whitelistDisabled = await contract.whitelistDisabled();
    wasDisabled = whitelistDisabled;
  };
}

const whiteListDisableFunction = "function disableWhitelist()";

const handleTransaction = async (txEvent) => {
  const findings = [];

  if (!wasDisabled) {
    const filtered = txEvent.filterFunction(
      whiteListDisableFunction,
      contractAddress
    );
    const from = txEvent.from;

    for (let tx of filtered) {
      findings.push(createAlert(network, from.toLowerCase()));
      wasDisabled = true;
    }
  }

  return findings;
};

const handleBlock = async (blockEvent) => {
  const findings = [];
  const whitelistDisabled = await contract.whitelistDisabled();
  wasDisabled = whitelistDisabled;
  return findings;
};

module.exports = {
  initialize: provideInitialize(getContractAndNetwork),
  provideInitialize,
  handleTransaction,
  handleBlock,
  getContract: () => contract, // exported for unit tests
  getNetwork: () => network, // exported for unit tests
  resetState: () => {
    wasDisabled = false;
  }, // exported for unit tests
};
