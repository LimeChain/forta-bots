const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const { abi, contracts } = require("./agent.config.json");
const { mintAgent } = require("./agent-bot-minted");
const { stakingChange } = require("./agent-bot-stake-threshold-changed");
const { mintScanner } = require("./agent-scanner-minted");
const { stateAgent } = require("./agent-bot-state-updated");
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

    //Here we listen for the transfer event only on the Agent registry to determine if a new agent(bot) is minted
    const mintFindings = mintAgent(
      txEvent,
      abi[0],
      contractAddresses[0],
      contractNames
    );

    //This handles the staking change findings on any of the contracts available
    const stakingChangeFindings = stakingChange(
      txEvent,
      abi[1],
      contractAddresses,
      contractNames
    );

    //We do the same as for the Bot minting agent, but this time we track the scanner registry
    const mintScannerFindings = mintScanner(
      txEvent,
      abi[0],
      contractAddresses[1],
      contractNames
    );

    const botStateUpdatedFindings = stateAgent(
      txEvent,
      abi,
      contractAddresses,
      contractNames
    );

    findings = [
      ...mintFindings,
      ...stakingChangeFindings,
      ...mintScannerFindings,
      ...botStateUpdatedFindings,
    ];

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
  provideHandleTransaction,
};
