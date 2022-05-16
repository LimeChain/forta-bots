const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const { abi, contracts } = require("./agent.config.json");

let contractNames;
let contractAddresses;

function initialize() {
  contractNames = Object.values(contracts);
  contractAddresses = Object.keys(contracts);
}

function provideHandleTransaction(getContractNames, getContractAddresses) {
  return async function handleTransaction(txEvent) {
    const findings = [];
    const contractAddresses = getContractAddresses();
    const contractNames = getContractNames();
    const txFiltered = txEvent.filterLog(abi, contractAddresses);
    txFiltered.forEach((tx, i) => {
      const { address: contractAddress } = tx;
      const { router, newAddressManager } = tx.args;
      const contractAddressesFlattened = contractAddresses.map((ca) =>
        ca.toLowerCase()
      );
      const indexOfContractAddress =
        contractAddressesFlattened.indexOf(contractAddress);

      if (router) {
        findings.push(
          Finding.fromObject({
            name: "Forta Router Updated emitted",
            description: `Forta ${tx.name} event emitted `,
            alertId: "FORTA-ROUTER-UPDATED",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            protocol: "forta",
            metadata: {
              name: contractNames[indexOfContractAddress],
              router,
            },
          })
        );
      } else if (newAddressManager) {
        findings.push(
          Finding.fromObject({
            name: "Forta Access Manager Updated emitted",
            description: `Forta ${tx.name} event emitted `,
            alertId: "FORTA-ACCESS-MANAGER-UPDATED",
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            protocol: "forta",
            metadata: {
              name: contractNames[indexOfContractAddress],
              newAddressManager,
            },
          })
        );
      }
    });

    return findings;
  };
}

const getContractNames = () => {
  return contractNames;
};

const getContractAddresses = () => {
  return contractAddresses;
};

module.exports = {
  initialize,
  handleTransaction: provideHandleTransaction(
    getContractNames,
    getContractAddresses
  ),
  provideHandleTransaction,
};
