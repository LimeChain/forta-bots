const {
  Finding,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} = require("forta-agent");
const { generateInternalScannerBotDatabase } = require("./agent.config");

const provider = getEthersProvider();

const handleTransaction = async (txEvent) => {
  const findings = [];
  generateInternalScannerBotDatabase(provider);
  // if (normalizedValue.gt(10000)) {
  //   findings.push(
  //     Finding.fromObject({
  //       name: "High Tether Transfer",
  //       description: `High amount of USDT transferred: ${normalizedValue}`,
  //       alertId: "FORTA-1",
  //       severity: FindingSeverity.Low,
  //       type: FindingType.Info,
  //       metadata: {
  //         to,
  //         from,
  //       },
  //     })
  //   );
  // }

  return findings;
};

module.exports = {
  handleTransaction,
};
