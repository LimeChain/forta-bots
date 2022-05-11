const {
  FindingType,
  FindingSeverity,
  Finding,
  getEthersProvider,
} = require("forta-agent");
const {
  handleTransaction,
  initialize,
  provideInitialize,
  getContract,
  getNetwork,
  resetState,
  handleBlock,
} = require("./agent");
const {
  ETHEREUM_CONTRACT_ADDRESS,
  POLYGON_CONTRACT_ADDRESS,
} = require("./agent.config");

// Mock the getEthersProvider function of the forta-agent module
jest.mock("forta-agent", () => {
  const original = jest.requireActual("forta-agent");
  return {
    ...original,
    getEthersProvider: jest.fn(),
  };
});

// Mock the getEthersProvider impl to return
// getNetworkMock and _isSigner (needed for the Contract creation)
const mockGetNetwork = jest.fn();
getEthersProvider.mockImplementation(() => ({
  getNetwork: mockGetNetwork,
  _isSigner: true,
}));

const contract = {
  whitelistDisabled: jest.fn(),
};

const contractAndNetwork = {
  contract: {
    ...contract,
    address: "0x41545f8b9472D758bB669ed8EaEEEcD7a9C4Ec29",
    signer: {
      getAddress: jest.fn(),
    },
  },
  network: "Polygon",
};
let mockGetContractAndNetwork = () => contractAndNetwork;
let mockGetContractAndNetworkErr = () => {
  throw new Error(
    "Unsupported chainId (100). The bot supports Ethereum (1) and Polygon (137)"
  );
};
describe("whitelist disabled bot", () => {
  describe("initialize", () => {
    it("should set the contract address to the Ethereum token address if the chainId is 1", async () => {
      const initialize = provideInitialize(mockGetContractAndNetwork);
      mockGetNetwork.mockResolvedValueOnce({ chainId: 1 });
      await initialize();

      const contractAddress = getContract().address;
      expect(contractAddress).toStrictEqual(ETHEREUM_CONTRACT_ADDRESS);
    });

    it("should set the contract address to the Polygon token address if the chainId is 137", async () => {
      contractAndNetwork.contract.address = POLYGON_CONTRACT_ADDRESS;
      const initialize = provideInitialize(mockGetContractAndNetwork);
      mockGetNetwork.mockResolvedValueOnce({ chainId: 137 });
      await initialize();

      const contractAddress = getContract().address;
      expect(contractAddress).toStrictEqual(POLYGON_CONTRACT_ADDRESS);
    });

    it("should throw if the chainId is not supported", async () => {
      const initialize = provideInitialize(mockGetContractAndNetworkErr);
      mockGetNetwork.mockResolvedValueOnce({ chainId: 100 });
      const error = new Error(
        "Unsupported chainId (100). The bot supports Ethereum (1) and Polygon (137)"
      );

      // Async functions always return a Promise, either resolved or rejected
      await expect(initialize()).rejects.toStrictEqual(error);
    });
  });

  describe("handleTransaction", () => {
    // Call initialize to set the network
    let network;
    const mockTxEvent = {
      from: "0xabc",
      filterFunction: jest.fn(),
    };
    beforeAll(async () => {
      const init = provideInitialize(mockGetContractAndNetwork);
      await init();
      network = getNetwork();
    });

    // Reset wasDisabled before each test
    beforeEach(() => {
      resetState();
    });

    it("returns empty findings if the whitelist is not disabled", async () => {
      contract.whitelistDisabled.mockReturnValueOnce(false);
      mockTxEvent.filterFunction.mockReturnValue([]);
      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if the whitelist is disabled", async () => {
      contract.whitelistDisabled.mockReturnValueOnce(true);
      mockTxEvent.filterFunction.mockReturnValue([{}]);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "Whitelist Disabled",
          description: `Whitelist disabled on the ${network} blockchain`,
          alertId: "WHITELIST-DISABLED",
          protocol: "forta",
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            network,
            disabledBy: "0xabc",
          },
        }),
      ]);
    });

    it("returns a finding only if the whitelist was NOT disabled", async () => {
      contract.whitelistDisabled.mockReturnValueOnce(true);
      contract.whitelistDisabled.mockReturnValueOnce(true);
      mockTxEvent.filterFunction.mockReturnValue([{}]);
      // wasDisabled is false; disabled = true => alert
      // wasDisabled is set to true
      let findings = await handleTransaction(mockTxEvent);
      expect(findings.length).toEqual(1);

      // wasDisabled is true; disabled = true => don't alert
      findings = await handleTransaction(mockTxEvent);
      expect(findings.length).toEqual(0);
    });

    it("returns a finding when the whitelist is disabled-enabled-disabled", async () => {
      contract.whitelistDisabled.mockReturnValueOnce(true);
      contract.whitelistDisabled.mockReturnValueOnce(false);
      contract.whitelistDisabled.mockReturnValueOnce(true);
      mockTxEvent.filterFunction.mockReturnValueOnce([{}]);
      // wasDisabled is false; disabled = true => alert
      // wasDisabled is set to true
      let findings = await handleTransaction(mockTxEvent);
      expect(findings.length).toEqual(1);

      // wasDisabled is true; disabled = false => don't alert
      // wasDisabled is set to false
      findings = await handleTransaction(mockTxEvent);
      expect(findings.length).toEqual(0);
      await handleBlock();
      // wasDisabled is false; disabled = true => alert
      findings = await handleTransaction(mockTxEvent);
      expect(findings.length).toEqual(1);
    });
  });
});
