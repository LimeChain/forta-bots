const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { handleTransaction } = require("./agent");

describe("Agents assigned", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no agent assignments", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there was an agent assignment", async () => {
      const mockAgentEvent = {
        args: {
          agentId: ethers.BigNumber.from("0xabc"),
          scannerId: ethers.BigNumber.from("0xdef"),
          enable: true,
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockAgentEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Agent Assigned ",
          description: `Forta Agent Assigned: agentAddress: 0x0abc`,
          alertId: "FORTA-1",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentAddress: "0x0abc",
            scannerAddress: "0x0def",
            enable: true,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
