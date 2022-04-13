const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const { abi, contracts } = require("./agent.config.json");
const { mintAgent } = require("./agent-bot-minted");
let contractNames;
let contractAddresses;

function initialize() {
  contractNames = Object.values(contracts);
  contractAddresses = Object.keys(contracts);
}

function provideHandleTransaction(getContractNames, getContractAddresses) {
  return async function handleTransaction(txEvent) {
    let findings = [];
    const contractAddresses = getContractAddresses();
    const contractNames = getContractNames();

    const mintFindings = mintAgent(
      txEvent,
      abi[0],
      contractAddresses,
      contractNames
    );

    findings = [...mintFindings];

    return findings;
  };
}

const getContractNames = () => contractNames;
const getContractAddresses = () => contractAddresses;

module.exports = {
  initialize,
  handleTransaction: provideHandleTransaction(
    getContractNames,
    getContractAddresses
  ),
};
