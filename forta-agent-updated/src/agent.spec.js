const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { handleTransaction } = require("./agent");

describe("forta agent updated", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no agent updated events", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if there is a agent updated event", async () => {
      const mockAgentUpdatedEvent = {
        args: {
          agentId: ethers.BigNumber.from(1234),
          by: "0xdef",
          metadata: "RANDOM METADATA STRING",
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockAgentUpdatedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Agent Updated",
          description: `Agent Updated with AgentId: 0x04d2`,
          alertId: "FORTA-AGENT-UPDATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentId: "0x04d2",
            by: "0xdef",
            metadata: "RANDOM METADATA STRING",
          },
        }),
      ]);
    });
  });
});
