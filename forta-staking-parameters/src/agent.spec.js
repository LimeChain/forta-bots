const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { handleTransaction } = require("./agent");

describe("Forta Staking Parameters emitted", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.transaction = { from: "0xabc" };
    mockTxEvent.filterLog = jest.fn();

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no events", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there was a FortaStakingChanged event emitted", async () => {
      const mockTxEventProps = { staking: "0xaac" };
      const mockTetherTransferEvent = {
        name: "FortaStakingChanged",
        args: {
          staking: mockTxEventProps.staking,
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockTetherTransferEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Staking Parameters emitted",
          description: `Forta Staking Parameters emitted: FortaStakingChanged `,
          alertId: "FORTA-STAKING-PARAMETERS-FORTASTAKINGCHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            staking: mockTxEventProps.staking,
            changedBy: "0xabc",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there was a StakeSubjectHandlerChanged event emitted", async () => {
      const mockTxEventProps = { oldHandler: "0xaac", newHandler: "0xaab" };
      const mockTetherTransferEvent = {
        name: "StakeSubjectHandlerChanged",
        args: {
          oldHandler: mockTxEventProps.oldHandler,
          newHandler: mockTxEventProps.newHandler,
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockTetherTransferEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Staking Parameters emitted",
          description: `Forta Staking Parameters emitted: StakeSubjectHandlerChanged `,
          alertId: `FORTA-STAKING-PARAMETERS-STAKESUBJECTHANDLERCHANGED`,
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            newHandler: mockTxEventProps.newHandler,
            oldHandler: mockTxEventProps.oldHandler,
            changedBy: "0xabc",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
