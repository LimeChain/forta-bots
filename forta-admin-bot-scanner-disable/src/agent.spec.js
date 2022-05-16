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
    mockTxEvent.transaction = { from: "0x0" };
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

    it("returns empty findings if there are no admin disabled scanner events", async () => {
      const mockScannerDisabledEvent = {
        args: {
          permission: 2,
          value: false,
          scannerId: "123456",
        },
        address: "0x123",
      };
      mockTxEvent.filterLog.mockReturnValue([mockScannerDisabledEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns empty findings if there are no admin disabled bot events", async () => {
      const mockAgentDisabledEvent = {
        args: {
          permission: 2,
          value: false,
          agentId: "123456",
        },
        address: "0x123",
      };
      mockTxEvent.filterLog.mockReturnValue([mockAgentDisabledEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is a scanner disabled event by admin", async () => {
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
          description: `Forta scanner disabled, ScannerId: 0x01e240`,
          alertId: "FORTA-SCANNER-ADMIN-DISABLED",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            disabledBy: "0x0",
            scannerId: "0x01e240",
            contractName: "Test contract",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is an bot disabled event by admin", async () => {
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
          name: "Forta Bot disabled",
          description: `Forta Bot disabled, agentId: 0x01e240`,
          alertId: "FORTA-BOT-ADMIN-DISABLED",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            disabledBy: "0x0",
            agentId: "0x01e240",
            contractName: "Test contract",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
