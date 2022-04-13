const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");

describe("Forta scanner/bot disabled", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();
    const mockGetContractNames = jest.fn().mockReturnValue(["Test contract"]);
    const mockGetContractAddresses = jest.fn().mockReturnValue(["0x123"]);
    const handleTransaction = provideHandleTransaction(
      mockGetContractNames,
      mockGetContractAddresses
    );
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no Disabled events", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is a scanner disabled event", async () => {
      const mockScannerDisabledEvent = {
        args: {
          permission: 0,
          value: false,
          scannerId: "123456",
        },
        address: "0x123",
      };
      mockTxEvent.filterLog.mockReturnValue([mockScannerDisabledEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta scanner disabled",
          description: `Forta scanner disabled, ScannerId: 123456`,
          alertId: "FORTA-SCANNER-DISABLED",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            disabledBy: "ADMIN",
            scannerId: "123456",
            contractName: "Test contract",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is an agent disabled event", async () => {
      const mockAgentDisabledEvent = {
        args: {
          permission: 0,
          value: false,
          agentId: "123456",
        },
        address: "0x123",
      };
      mockTxEvent.filterLog.mockReturnValue([mockAgentDisabledEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Agent disabled",
          description: `Forta Agent disabled, agentId: 123456`,
          alertId: "FORTA-AGENT-DISABLED",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            disabledBy: "ADMIN",
            agentId: "123456",
            contractName: "Test contract",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
