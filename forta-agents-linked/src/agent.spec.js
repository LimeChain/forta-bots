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
      addToListCreated: jest.fn(),
      addToListLinked: jest.fn(),
      checkIfPassedThreshold: jest.fn(),
      reset: jest.fn(),
    };
    const handleTransaction = provideHandleTransaction(mockTimeHandler);
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no bots linked over 5 minutes", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);
      mockTimeHandler.checkIfPassedThreshold.mockReturnValueOnce([]);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.checkIfPassedThreshold).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.addToListCreated).toHaveBeenCalledTimes(0);
      expect(mockTimeHandler.addToListLinked).toHaveBeenCalledTimes(0);
      expect(mockTimeHandler.reset).toHaveBeenCalledTimes(0);
    });

    it("returns a finding if there was a bot link event 5 minutes after Transfer event", async () => {
      mockTimeHandler.checkIfPassedThreshold.mockReturnValue([
        ethers.BigNumber.from("0xabc"),
      ]);

      const mockAgentEvent = {
        name: "Transfer",
        args: {
          agentId: ethers.BigNumber.from("0xabc"),
        },
      };

      const mockLinkEvent = {
        name: "Link",
        args: {
          agentId: ethers.BigNumber.from("0xabc"),
          scannerId: ethers.BigNumber.from("0xdef"),
          enable: true,
        },
      };

      mockTxEvent.filterLog.mockReturnValue([mockAgentEvent, mockLinkEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Bot Link over threshold ",
          description: `Forta Bot Link: botAddress: 0x0abc over the threshold: 5 minutes`,
          alertId: "FORTA-BOT-LINK",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            botAddress: "0x0abc",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.addToListCreated).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.addToListLinked).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.checkIfPassedThreshold).toHaveBeenCalledTimes(2);
      expect(mockTimeHandler.reset).toHaveBeenCalledTimes(1);
    });

    it("Returns a finding if there was no link event 5 minutes after Transfer event", async () => {
      mockTimeHandler.checkIfPassedThreshold.mockReturnValue([
        ethers.BigNumber.from("0xabc"),
      ]);

      const mockAgentEvent = {
        name: "Transfer",
        args: {
          agentId: ethers.BigNumber.from("0xabc"),
        },
      };

      mockTxEvent.filterLog.mockReturnValue([mockAgentEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Bot Link over threshold ",
          description: `Forta Bot Link: botAddress: 0x0abc over the threshold: 5 minutes`,
          alertId: "FORTA-BOT-LINK",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            botAddress: "0x0abc",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.addToListCreated).toHaveBeenCalledTimes(2);
      expect(mockTimeHandler.addToListLinked).toHaveBeenCalledTimes(1);
      expect(mockTimeHandler.checkIfPassedThreshold).toHaveBeenCalledTimes(3);
      expect(mockTimeHandler.reset).toHaveBeenCalledTimes(2);
    });
  });
});
