const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleBlock, provideHandleTransaction } = require("./agent");
const ADDRESS_ZERO = ethers.constants.AddressZero;
describe("Scanners capacity by chainId", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();
    const mockScannersLoaded = [
      { id: "1234", chainId: 1 },
      { id: "1234", chainId: 1 },
    ];
    const mockScannerCountByChainId = { 1: 1 };
    const mockEthCallProvider = {
      all: jest
        .fn()
        .mockReturnValueOnce([ethers.BigNumber.from(137)])
        .mockReturnValueOnce([
          ethers.BigNumber.from(1),
          ethers.BigNumber.from(1),
          ethers.BigNumber.from(1),
        ])

        .mockReturnValue([
          ethers.BigNumber.from(50),
          ethers.BigNumber.from(50),
          ethers.BigNumber.from(50),
        ]),
    };
    const handleTransaction = provideHandleTransaction(
      mockScannersLoaded,
      mockScannerCountByChainId,
      mockEthCallProvider
    );
    const handleBlock = provideHandleBlock(
      mockScannersLoaded,
      mockScannerCountByChainId,
      mockEthCallProvider
    );

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no new scanners minted", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns empty findings if there are  new scanners minted", async () => {
      const mockMintedTx = {
        args: { from: ADDRESS_ZERO, tokenId: ethers.BigNumber.from("123") },
      };
      mockTxEvent.filterLog.mockReturnValue([mockMintedTx]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if Scanners from a chainId are under capacity", async () => {
      const findings = await handleBlock();

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "FORTA Scanner under capacity threshold for chain",
          description: `FORTA Scanners are almost under capacity threshold for chainId: 1`,
          alertId: "FORTA-SCANNER-UNDER-CAPACITY-THRESHOLD",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            threshold: 20,
            capacityPercentage: 8,
            chainId: 1,
          },
        }),
      ]);
      expect(mockEthCallProvider.all).toHaveBeenCalledTimes(2);
    });
    it("returns a finding if Scanners from a chainId are over capacity", async () => {
      const findings = await handleBlock();

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "FORTA Scanner over capacity threshold",
          description: `FORTA Scanners capacity is almost full for chainId: 1`,
          alertId: "FORTA-SCANNER-OVER-CAPACITY-THRESHOLD",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            threshold: 90,
            capacityPercentage: 400,
            chainId: 1,
          },
        }),
      ]);
      expect(mockEthCallProvider.all).toHaveBeenCalledTimes(3);
    });
  });
});
