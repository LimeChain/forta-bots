const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const {
  abi,
  contracts,
  PermissionsScanner,
  PermissionsBot,
} = require("./agent.config");

let contractNames = [];
let contractAddresses = [];

function initialize() {
  contractNames = Object.values(contracts);
  contractAddresses = Object.keys(contracts);
}

function provideHandleTransaction(getContractNames, getContractAddresses) {
  return async function handleTransaction(txEvent) {
    const findings = [];

    const contractNames = getContractNames();
    const contractAddresses = getContractAddresses();

    const txFiltered = txEvent.filterLog(abi, contractAddresses);

    txFiltered.forEach((tx) => {
      const { permission, value, scannerId, agentId } = tx.args;
      const { address } = tx;
      console.log(value);
      const contractAddressesFlattened = contractAddresses.map((e) =>
        e.toLowerCase()
      );

      const contractIndex = contractAddressesFlattened.indexOf(address);
      const contractName = contractNames[contractIndex];

      if (scannerId) {
        if (value == false) {
          const scannerIdAddress = ethers.BigNumber.from(scannerId).toString();
          const disabledBy = PermissionsScanner[permission];
          findings.push(
            Finding.fromObject({
              name: "Forta scanner disabled",
              description: `Forta scanner disabled, ScannerId: ${scannerIdAddress}`,
              alertId: "FORTA-SCANNER-DISABLED",
              severity: FindingSeverity.Medium,
              type: FindingType.Info,
              metadata: {
                disabledBy,
                scannerId: scannerIdAddress,
                contractName,
              },
            })
          );
        }
      } else if (agentId) {
        if (value == false) {
          const agentIdAddress = ethers.BigNumber.from(agentId).toString();
          const disabledBy = PermissionsBot[permission];
          findings.push(
            Finding.fromObject({
              name: "Forta Agent disabled",
              description: `Forta Agent disabled, agentId: ${agentIdAddress}`,
              alertId: "FORTA-AGENT-DISABLED",
              severity: FindingSeverity.Medium,
              type: FindingType.Info,
              metadata: {
                disabledBy,
                agentId: agentIdAddress,
                contractName,
              },
            })
          );
        }
      }
    });
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
