const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { handleTransaction } = require("./agent");

describe("FORTA Scanner Node Version Updated", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no Scanner Node Version Updated events", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if Scanner Node Version has been Updated", async () => {
      const mockEventData = { oldVersion: "QwEsD", newVersion: "QdEsQ" };
      const mockUpdatedEvent = {
        from: "0xAbC",
        args: {
          oldVersion: mockEventData.oldVersion,
          newVersion: mockEventData.newVersion,
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockUpdatedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Scanner Node Version Updated",
          description: `Scanner Node Version has been updated on Polygon Mainnet`,
          alertId: "FORTA-SCANNER-NODE-UPDATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            oldVersion: mockEventData.oldVersion,
            newVersion: mockEventData.newVersion,
            updatedBy: "0xabc",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
