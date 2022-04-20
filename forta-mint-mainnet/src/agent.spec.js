const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { handleTransaction } = require("./agent");
const { event, contractAddress } = require("./agent.config.json");
describe("FORTA MINT BOT", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no MINT transactions", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
        event,
        contractAddress
      );
    });

    it("returns a finding if there is a MINT transfer", async () => {
      const mockMintTxEvent = {
        args: {
          from: ethers.constants.AddressZero,
          to: "0xdef",
          value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockMintTxEvent]);

      const findings = await handleTransaction(mockTxEvent);

      const mintValue = ethers.utils.formatEther(mockMintTxEvent.args.value);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta MainNet Mint",
          description: `Forta tokens minted amount: ${mintValue}`,
          alertId: "FORTA-MINT-MAINNET",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            to: mockMintTxEvent.args.to,
            value: mintValue,
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
      expect(mockTxEvent.filterLog).toHaveBeenCalledWith(
        event,
        contractAddress
      );
    });
  });
});
