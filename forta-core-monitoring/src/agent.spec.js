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
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
    });

    it("returns a finding if there is a Bot Mint event", async () => {
      const mockBotMintEvent = {
        args: {
          from: ADDRESS_ZERO,
          to: "0xdef",
          tokenId: "123",
        },
      };
      mockTxEvent.filterLog
        .mockReturnValueOnce([mockBotMintEvent])
        .mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta new bot minted",
          description: `New bot minted with tokenId: 123`,
          alertId: "FORTA-NEW-BOT",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to: mockBotMintEvent.args.to,
            tokenId: mockBotMintEvent.args.tokenId,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
    });

    it("returns a finding if there is a Staking Change event", async () => {
      const mockStakingEvent = {
        args: {
          min: 1,
          max: 5,
          activated: true,
        },
      };
      mockTxEvent.filterLog
        .mockReturnValueOnce([])
        .mockReturnValueOnce([mockStakingEvent])
        .mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Staking Threshold changed",
          description: `Staking threshold changed `,
          alertId: "FORTA-STAKING-THRESHOLD-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            min: mockStakingEvent.args.min.toString(),
            max: mockStakingEvent.args.max.toString(),
            activated: mockStakingEvent.args.activated,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
    });

    it("returns a finding if there is a Scanner mint event", async () => {
      const mockScannerMintEvent = {
        args: {
          from: ADDRESS_ZERO,
          to: "0x123",
          tokenId: "123",
        },
      };
      mockTxEvent.filterLog
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([mockScannerMintEvent])
        .mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta new scanner minted",
          description: `New scanner minted with tokenId: 123`,
          alertId: "FORTA-NEW-SCANNER",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to: mockScannerMintEvent.args.to,
            tokenId: mockScannerMintEvent.args.tokenId,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
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
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValue([mockBotStateUpdateEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta bot state updated",
          description: `Forta bot state updated with agentId: ${mockBotStateUpdateEvent.args.agentId}`,
          alertId: "FORTA-BOT-STATE-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            agentId: mockBotStateUpdateEvent.args.agentId,
            contractName: "Test contract",
            disabledBy: "ADMIN",
            currentState: "Disabled",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
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
        .mockReturnValueOnce([])
        .mockReturnValueOnce([])
        .mockReturnValue([mockScannerStateUpdateEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta scanner state updated",
          description: `Forta scanner state updated with scannerId: ${mockScannerStateUpdateEvent.args.scannerId}`,
          alertId: "FORTA-SCANNER-STATE-CHANGED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            scannerId: mockScannerStateUpdateEvent.args.scannerId,
            contractName: "Test contract",
            disabledBy: "ADMIN",
            currentState: "Disabled",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(4);
    });
  });
});
