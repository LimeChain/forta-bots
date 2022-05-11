const { FindingType, FindingSeverity, Finding } = require("forta-agent");
const { handleTransaction } = require("./agent");

const sig = "0x00000000";
const target = "0xtarget";
const enable = true;
const revertsOnFail = true;

const event = {
  args: {
    sig,
    target,
    enable,
    revertsOnFail,
  },
};

describe("routing updated bot", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = {
      from: "0xAbC",
      filterLog: jest.fn(),
    };

    it("returns empty findings if there are no RoutingUpdated events", async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([]);

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if there is a RoutingUpdated event", async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([event]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Routing Updated",
          description: 'The router emitted "RoutingUpdated" event',
          alertId: "FORTA-ROUTING-UPDATED",
          protocol: "forta",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            sig,
            target,
            enable,
            revertsOnFail,
            updatedBy: "0xabc",
          },
        }),
      ]);
    });
  });
});
