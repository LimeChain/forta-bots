const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");

describe("FORTA Contracts Upgraded", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.transaction = { from: "0xAbC" };
    mockTxEvent.filterLog = jest.fn();
    const mockContractObject = { address: "0x123", name: "FORTA" };
    const mockGetContracts = jest.fn().mockReturnValue([mockContractObject]);
    const handleTransaction = provideHandleTransaction(mockGetContracts);
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no Upgraded events called", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockGetContracts).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is a Upgraded event called", async () => {
      const mockUpgradedEvent = {
        from: "0xAbC",
        address: "0x123",
        args: {
          implementation: "0x0",
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockUpgradedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "FORTA Contract Upgraded",
          description: `FORTA Contract Upgraded: ${mockContractObject.name}, on ChainId: 1`,
          alertId: "FORTA-EMIT-UPGRADED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            name: mockContractObject.name,
            address: mockContractObject.address,
            upgradedBy: "0xabc",
            implementation: "0x0",
            currentChainId: 1,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
