const {
  getContractAndNetwork,
  createAlert,
} = require('./agent.config');

let wasDisabled = false;

let contract;
let network;
function provideInitialize(getContractAndNetworkFn) {
  return async function initialize() {
    ({ contract, network } = await getContractAndNetworkFn());
  };
}

const handleBlock = async () => {
  const findings = [];

  const whitelistDisabled = await contract.whitelistDisabled();

  // Alert only if the whitelist was NOT disabled but now it is
  if (!wasDisabled && whitelistDisabled) {
    findings.push(createAlert(network));
  }

  wasDisabled = whitelistDisabled;
  return findings;
};

module.exports = {
  initialize: provideInitialize(getContractAndNetwork),
  provideInitialize,
  handleBlock,
  getContract: () => contract, // exported for unit tests
  getNetwork: () => network, // exported for unit tests
  resetState: () => { (wasDisabled = false); }, // exported for unit tests
};
