const {
  FindingType,
  FindingSeverity,
  Finding,
  ethers,
} = require("forta-agent");
const { handleTransaction } = require("./agent");
const { contracts } = require("./agent.config");

const fortaScannersAddress = Object.keys(contracts)[0];
const fortaAgentsAddress = Object.keys(contracts)[1];

const chainId = ethers.BigNumber.from(1);
const min = ethers.BigNumber.from(100);
const max = ethers.BigNumber.from(1000);
const activated = true;

const stakeThresholdChangedForScannersEvent = {
  address: fortaScannersAddress,
  args: {
    chainId,
    min,
    max,
    activated,
  },
};

const stakeThresholdChangedForAgentsEvent = {
  address: fortaAgentsAddress,
  args: {
    min,
    max,
    activated,
  },
};

describe("stake threshold changed bot", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = {
      from: "0xAbC",
      filterLog: jest.fn(),
    };

    it("returns empty findings if there are no StakeThresholdChanged events", async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([]);

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if there is a StakeThresholdChanged event from the Forta Scanners contract", async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([
        stakeThresholdChangedForScannersEvent,
      ]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Stake Threshold Changed",
          description: "stakeThreshold changed for Forta Scanners",
          alertId: "FORTA-STAKE-THRESHOLD-CHANGED-FOR-SCANNERS",
          protocol: "forta",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            chainId: chainId.toString(),
            min: min.toString(),
            max: max.toString(),
            activated,
            updatedBy: "0xabc",
          },
        }),
      ]);
    });

    it("returns a finding if there is a StakeThresholdChanged event from the Forta Agents contract", async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([
        stakeThresholdChangedForAgentsEvent,
      ]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Stake Threshold Changed",
          description: "stakeThreshold changed for Forta Agents",
          alertId: "FORTA-STAKE-THRESHOLD-CHANGED-FOR-AGENTS",
          protocol: "forta",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            min: min.toString(),
            max: max.toString(),
            activated,
            updatedBy: "0xabc",
          },
        }),
      ]);
    });
  });
});
