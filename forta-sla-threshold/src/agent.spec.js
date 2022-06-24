const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleBlock, provideHandleTransaction } = require("./agent");
const axios = require("axios");
jest.mock("axios");

describe("SLA Threshold agent", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();
    const mockScannersLoaded = [{ id: ethers.BigNumber.from("1234") }];
    const handleTransaction = provideHandleTransaction(mockScannersLoaded);
    axios.default.get
      .mockResolvedValueOnce({
        data: { statistics: { avg: 0.89 } },
      })
      .mockResolvedValue({ data: { statistics: { avg: 0.91 } } });
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no Mint events", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is a Scanner with under sla threshold", async () => {
      const handleBlock = provideHandleBlock(mockScannersLoaded);
      await handleBlock();
      await new Promise((resolve) => setTimeout(resolve, 500));

      const findings = await handleBlock();

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Scanner SLA under threshold",
          description: `Scanner SLA is under the threshold and might get disqualifed, scannerId: ${mockScannersLoaded[0].id}`,
          alertId: "FORTA-SCANNER-SLA-UNDER-THRESHOLD",
          severity: FindingSeverity.High,
          type: FindingType.Info,
          metadata: {
            scannerId: mockScannersLoaded[0],
            slaValue: 0.89,
          },
        }),
      ]);
      expect(axios.default.get).toHaveBeenCalledTimes(1);
    });

    it("Does not return a finding if there is a Scanner  thats above sla threshold", async () => {
      const handleBlock = provideHandleBlock(mockScannersLoaded);
      await handleBlock();

      await new Promise((resolve) => setTimeout(resolve, 200));
      const findings = await handleBlock();

      expect(findings).toStrictEqual([]);
      expect(axios.default.get).toHaveBeenCalledTimes(1);
    });
  });
});
