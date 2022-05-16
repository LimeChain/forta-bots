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
    const ADDRESS_ZERO = ethers.constants.AddressZero;
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
          chainIds: [ethers.BigNumber.from(1), ethers.BigNumber.from(56)],
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockAgentUpdatedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Bot Updated",
          description: `Bot Updated with AgentId: 0x04d2`,
          alertId: "FORTA-BOT-UPDATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            agentId: "0x04d2",
            by: "0xdef",
            metadata: "RANDOM METADATA STRING",
            chainIds: "Ethereum,Binance Smart Chain",
          },
        }),
      ]);
    });

    it("does return a finding if there is an agent created event", async () => {
      const mockAgentUpdatedEvent = {
        args: {
          agentId: ethers.BigNumber.from(1234),
          by: "0xdef",
          metadata: "RANDOM METADATA STRING",
          chainIds: [ethers.BigNumber.from(1), ethers.BigNumber.from(56)],
        },
      };
      const mockTransferEvent = {
        args: {
          from: ADDRESS_ZERO,
          tokenId: ethers.BigNumber.from(1234),
        },
      };
      mockTxEvent.filterLog.mockReturnValue([
        mockTransferEvent,
        mockAgentUpdatedEvent,
      ]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Bot Created And Updated",
          description: `Bot Created And Updated with AgentId: 0x04d2`,
          alertId: "FORTA-BOT-CREATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            agentId: "0x04d2",
            by: "0xdef",
            metadata: "RANDOM METADATA STRING",
            chainIds: "Ethereum,Binance Smart Chain",
          },
        }),
      ]);
    });
  });
});
