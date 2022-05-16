const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");
const ADDRESS_ZERO = ethers.constants.AddressZero;
describe("Forta core monitoring agent", () => {
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

    it("returns empty findings if there are no events whatsoever", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(2);
    });

    it("returns a finding if there is a Scanner mint event", async () => {
      const mockScannerMintEvent = {
        args: {
          from: ADDRESS_ZERO,
          to: "0x123",
          tokenId: ethers.BigNumber.from("123"),
        },
      };
      mockTxEvent.filterLog

        .mockReturnValueOnce([mockScannerMintEvent])
        .mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta new scanner minted",
          description: `New scanner minted with tokenId: 0x7b`,
          alertId: "FORTA-NEW-SCANNER",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            to: mockScannerMintEvent.args.to,
            tokenId: "0x7b",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(2);
    });

    it("returns a finding if there is a Bot state update event", async () => {
      const mockBotStateUpdateEvent = {
        args: {
          permission: 0,
          value: false,
          agentId: "123",
        },
        address: "0x123",
      };
      mockTxEvent.filterLog

        .mockReturnValueOnce([])
        .mockReturnValue([mockBotStateUpdateEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta bot state updated",
          description: `Forta bot state updated with agentId: 0x7b`,
          alertId: "FORTA-BOT-STATE-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            agentId: "0x7b",
            contractName: "Test contract",
            updatedBy: "ADMIN",
            currentState: "Disabled",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(2);
    });

    it("returns a finding if there is a Scanner state update event", async () => {
      const mockScannerStateUpdateEvent = {
        args: {
          permission: 0,
          value: false,
          scannerId: "123",
        },
        address: "0x123",
      };
      mockTxEvent.filterLog

        .mockReturnValueOnce([])
        .mockReturnValue([mockScannerStateUpdateEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta scanner state updated",
          description: `Forta scanner state updated with scannerId: 0x7b`,
          alertId: "FORTA-SCANNER-STATE-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            scannerId: "0x7b",
            contractName: "Test contract",
            updatedBy: "ADMIN",
            currentState: "Disabled",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(2);
    });
  });
});
