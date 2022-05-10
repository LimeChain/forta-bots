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
      const caller = txEvent.from;

      const contractAddressesFlattened = contractAddresses.map((e) =>
        e.toLowerCase()
      );

      const contractIndex = contractAddressesFlattened.indexOf(address);
      const contractName = contractNames[contractIndex];

      if (scannerId) {
        if (value == false) {
          const scannerIdAddress =
            ethers.BigNumber.from(scannerId).toHexString();
          const disabledBy = PermissionsScanner[permission];
          if (disabledBy == "ADMIN")
            findings.push(
              Finding.fromObject({
                name: "Forta scanner disabled",
                description: `Forta scanner disabled, ScannerId: ${scannerIdAddress}`,
                alertId: "FORTA-SCANNER-DISABLED",
                severity: FindingSeverity.Medium,
                type: FindingType.Info,
                protocol: "forta",
                metadata: {
                  disabledBy: { role: disabledBy, by: caller },
                  scannerId: scannerIdAddress,
                  contractName,
                },
              })
            );
        }
      } else if (agentId) {
        if (value == false) {
          const agentIdAddress = ethers.BigNumber.from(agentId).toHexString();
          const disabledBy = PermissionsBot[permission];
          if (disabledBy == "ADMIN")
            findings.push(
              Finding.fromObject({
                name: "Forta Bot disabled",
                description: `Forta Bot disabled, agentId: ${agentIdAddress}`,
                alertId: "FORTA-BOT-DISABLED",
                severity: FindingSeverity.Medium,
                type: FindingType.Info,
                protocol: "forta",
                metadata: {
                  disabledBy: { role: disabledBy, by: caller },
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
