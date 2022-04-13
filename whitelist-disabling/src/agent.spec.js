const {
  FindingType,
  FindingSeverity,
  Finding,
  getEthersProvider,
} = require('forta-agent');
const {
  handleBlock,
  initialize,
  provideInitialize,
  getContract,
  getNetwork,
  resetState,
} = require('./agent');
const { ETHEREUM_CONTRACT_ADDRESS, POLYGON_CONTRACT_ADDRESS } = require('./agent.config');

// Mock the getEthersProvider function of the forta-agent module
jest.mock('forta-agent', () => {
  const original = jest.requireActual('forta-agent');
  return {
    ...original,
    getEthersProvider: jest.fn(),
  };
});

// Mock the getEthersProvider impl to return
// getNetworkMock and _isSigner (needed for the Contract creation)
const mockGetNetwork = jest.fn();
getEthersProvider.mockImplementation(() => ({ getNetwork: mockGetNetwork, _isSigner: true }));

const contract = {
  whitelistDisabled: jest.fn(),
};

const contractAndNetwork = {
  contract,
  network: 'Polygon',
};
const mockGetContractAndNetwork = () => contractAndNetwork;

describe('whitelist disabled bot', () => {
  describe('initialize', () => {
    it('should set the contract address to the Ethereum token address if the chainId is 1', async () => {
      mockGetNetwork.mockResolvedValueOnce({ chainId: 1 });
      await initialize();

      const contractAddress = getContract().address;
      expect(contractAddress).toStrictEqual(ETHEREUM_CONTRACT_ADDRESS);
    });

    it('should set the contract address to the Polygon token address if the chainId is 137', async () => {
      mockGetNetwork.mockResolvedValueOnce({ chainId: 137 });
      await initialize();

      const contractAddress = getContract().address;
      expect(contractAddress).toStrictEqual(POLYGON_CONTRACT_ADDRESS);
    });

    it('should throw if the chainId is not supported', async () => {
      mockGetNetwork.mockResolvedValueOnce({ chainId: 100 });
      const error = new Error('Unsupported chainId (100). The bot supports Ethereum (1) and Polygon (137)');

      // Async functions always return a Promise, either resolved or rejected
      await expect(initialize()).rejects.toStrictEqual(error);
    });
  });

  describe('handleBlock', () => {
    // Call initialize to set the network
    let network;
    beforeAll(async () => {
      const init = provideInitialize(mockGetContractAndNetwork);
      await init();
      network = getNetwork();
    });

    // Reset wasDisabled before each test
    beforeEach(() => {
      resetState();
    });

    it('returns empty findings if the whitelist is not disabled', async () => {
      contract.whitelistDisabled.mockReturnValueOnce(false);

      const findings = await handleBlock();
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if the whitelist is disabled', async () => {
      contract.whitelistDisabled.mockReturnValueOnce(true);

      const findings = await handleBlock();

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Whitelist Disabled',
          description: `Whitelist disabled on the ${network} blockchain`,
          alertId: 'WHITELIST-DISABLED',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            network,
          },
        }),
      ]);
    });

    it('returns a finding only if the whitelist was NOT disabled', async () => {
      contract.whitelistDisabled.mockReturnValueOnce(true);
      contract.whitelistDisabled.mockReturnValueOnce(true);

      // wasDisabled is false; disabled = true => alert
      // wasDisabled is set to true
      let findings = await handleBlock();
      expect(findings.length).toEqual(1);

      // wasDisabled is true; disabled = true => don't alert
      findings = await handleBlock();
      expect(findings.length).toEqual(0);
    });

    it('returns a finding when the whitelist is disabled-enabled-disabled', async () => {
      contract.whitelistDisabled.mockReturnValueOnce(true);
      contract.whitelistDisabled.mockReturnValueOnce(false);
      contract.whitelistDisabled.mockReturnValueOnce(true);

      // wasDisabled is false; disabled = true => alert
      // wasDisabled is set to true
      let findings = await handleBlock();
      expect(findings.length).toEqual(1);

      // wasDisabled is true; disabled = false => don't alert
      // wasDisabled is set to false
      findings = await handleBlock();
      expect(findings.length).toEqual(0);

      // wasDisabled is false; disabled = true => alert
      findings = await handleBlock();
      expect(findings.length).toEqual(1);
    });
  });
});
