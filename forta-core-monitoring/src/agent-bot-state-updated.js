const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
} = require("forta-agent");

const ADDRESS_ZERO = ethers.constants.AddressZero;
const PermissionsBot = {
  0: "ADMIN",
  1: "OWNER",
  2: "length",
};
const PermissionsScanner = {
  0: "ADMIN",
  1: "SELF",
  2: "OWNER",
  3: "MANAGER",
  4: "length",
};
function handleBotStateChanges(txEvent, abi, contractAddresses, contractNames) {
  const findings = [];

  const txFiltered = txEvent.filterLog(abi, contractAddresses);

  txFiltered.forEach((tx) => {
    const { permission, value, agentId, scannerId } = tx.args;
    const { address } = tx;

    const contractAddressesFlattened = contractAddresses.map((e) =>
      e.toLowerCase()
    );

    const contractIndex = contractAddressesFlattened.indexOf(address);
    const contractName = contractNames[contractIndex];

    if (agentId) {
      const agentIdAddress = ethers.BigNumber.from(agentId).toString();
      const disabledBy = PermissionsBot[permission];
      findings.push(
        Finding.fromObject({
          name: "Forta bot state updated",
          description: `Forta bot state updated with agentId: ${agentIdAddress}`,
          alertId: "FORTA-BOT-STATE-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentId: agentIdAddress,
            contractName,
            disabledBy,
            currentState: value ? "Enabled" : "Disabled",
          },
        })
      );
    } else if (scannerId) {
      const scannerIdAddress = ethers.BigNumber.from(scannerId).toString();
      const disabledBy = PermissionsScanner[permission];
      findings.push(
        Finding.fromObject({
          name: "Forta scanner state updated",
          description: `Forta scanner state updated with scannerId: ${scannerIdAddress}`,
          alertId: "FORTA-SCANNER-STATE-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            scannerId: scannerIdAddress,
            contractName,
            disabledBy,
            currentState: value ? "Enabled" : "Disabled",
          },
        })
      );
    }
  });

  return findings;
}

module.exports = {
  stateAgent: handleBotStateChanges,
};
