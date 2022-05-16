const {
  FindingType,
  FindingSeverity,
  Finding,
  createTransactionEvent,
  ethers,
} = require("forta-agent");
const { provideHandleTransaction } = require("./agent");

describe("Forta AccessManagerUpdated and Forta Router updated ", () => {
  describe("handleTransaction", () => {
    const mockTxEvent = createTransactionEvent({});
    mockTxEvent.filterLog = jest.fn();
    const mockGetContractNames = jest.fn().mockReturnValue(["Agent Registry"]);
    const mockGetContractAddresses = jest.fn().mockReturnValue(["0x123"]);
    const handleTransaction = provideHandleTransaction(
      mockGetContractNames,
      mockGetContractAddresses
    );
    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it("returns empty findings if there are no events called", async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is a Router Updated event emitted", async () => {
      const mockRouterUpdatedEvent = {
        name: "Forta Router Updated",
        address: "0x123",
        args: {
          router: "0x0",
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockRouterUpdatedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Router Updated emitted",
          description: `Forta Forta Router Updated event emitted `,
          alertId: "FORTA-ROUTER-UPDATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            name: "Agent Registry",
            router: "0x0",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });

    it("returns a finding if there is a Access Manager Updated event emitted", async () => {
      const mockAccessManagerUpdatedEvent = {
        name: "Forta Access Manager Updated",
        address: "0x123",
        args: {
          newAddressManager: "0x0",
        },
      };
      mockTxEvent.filterLog.mockReturnValue([mockAccessManagerUpdatedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Forta Access Manager Updated emitted",
          description: `Forta Forta Access Manager Updated event emitted `,
          alertId: "FORTA-ACCESS-MANAGER-UPDATED",
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          protocol: "forta",
          metadata: {
            name: "Agent Registry",
            newAddressManager: "0x0",
          },
        }),
      ]);
      expect(mockTxEvent.filterLog).toHaveBeenCalledTimes(1);
    });
  });
});
