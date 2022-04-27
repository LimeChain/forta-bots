const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");

describe("Bots assigned", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();
    const mockTimeHandler = {
      addToList: jest.fn(),
      checkIfPassedThreshold: jest.fn(),
      reset: jest.fn(),
    };
    const handleTransaction = provideHandleTransaction(mockTimeHandler);
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no bot assignments", async () => {
      mockTimeHandler.checkIfPassedThreshold.mockReturnValueOnce([]);
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.checkIfPassedThreshold).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.addToList).toHaveBeenCalledTimes(0);
      expect(mockTimeHandler.reset).toHaveBeenCalledTimes(0);
    });

    it("returns a finding if there was a bot assignment", async () => {
      const mockAgentEvent = {
        args: {
          agentId: ethers.BigNumber.from("0xabc"),
          scannerId: ethers.BigNumber.from("0xdef"),
          enable: true,
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockAgentEvent]);
      mockTimeHandler.checkIfPassedThreshold.mockReturnValueOnce(["0x0abc"]);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Bot Assigned ",
          description: `Forta Bot Assigned: botAddress: 0x0abc in the past 5 minutes`,
          alertId: "FORTA-BOT-ASSIGNED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            botAddress: "0x0abc",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.addToList).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.checkIfPassedThreshold).toHaveBeenCalledTimes(2);
      expect(mockTimeHandler.reset).toHaveBeenCalledTimes(1);
    });
  });
});
