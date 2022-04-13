const {
  FindingType,
  FindingSeverity,
  Finding,
} = require('forta-agent');
const { handleTransaction, provideInitialize, getContractAddress } = require('./agent');
const { getRoleName, ETHEREUM_CONTRACT_ADDRESS, POLYGON_CONTRACT_ADDRESS } = require('./agent.config');

// ADMIN_ROLE
const role = '0xdc72ed553f2544c34465af23b847953efeb813428162d767f9ba5f4013be6760';
const account = '0xaccount';
const sender = '0xsender';

// ROUTER_ADMIN_ROLE and AGENT_ADMIN_ROLE
const previousAdminRole = '0x0000000000000000000000000000000000000000000000000000000000000000';
const newAdminRole = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';

const unknownRole = '0xunknown';

const roleGrantedEvent = {
  name: 'RoleGranted',
  args: { role, account, sender },
};

const roleRevokedEvent = {
  name: 'RoleRevoked',
  args: { role, account, sender },
};

const roleAdminChanged = {
  name: 'RoleAdminChanged',
  args: { role, previousAdminRole, newAdminRole },
};

const roleGrantedWithUnknownRoleEvent = {
  name: 'RoleGranted',
  args: { role: unknownRole, account, sender },
};

describe('access control role changes bot', () => {
  describe('initialize', () => {
    const mockProvider = { getNetwork: jest.fn() };
    const mockGetEthersProvider = () => mockProvider;

    beforeEach(() => {
      mockProvider.getNetwork.mockReset();
    });

    it('should set the contract address to the Ethereum token address if the chainId is 1', async () => {
      mockProvider.getNetwork.mockResolvedValueOnce({ chainId: 1 });

      const initialize = provideInitialize(mockGetEthersProvider);
      await initialize();

      const contractAddress = getContractAddress();
      expect(contractAddress).toStrictEqual(ETHEREUM_CONTRACT_ADDRESS);
    });

    it('should set the contract address to the Polygon token address if the chainId is 137', async () => {
      mockProvider.getNetwork.mockResolvedValueOnce({ chainId: 137 });

      const initialize = provideInitialize(mockGetEthersProvider);
      await initialize();

      const contractAddress = getContractAddress();
      expect(contractAddress).toStrictEqual(POLYGON_CONTRACT_ADDRESS);
    });

    it('should throw if the chainId is not supported', async () => {
      mockProvider.getNetwork.mockResolvedValueOnce({ chainId: 100 });
      const error = new Error('Unsupported chainId (100). The bot supports Ethereum (1) and Polygon (137)');

      const initialize = provideInitialize(mockGetEthersProvider);

      // Async functions always return a Promise, either resolved or rejected
      await expect(initialize()).rejects.toStrictEqual(error);
    });
  });

  describe('handleTransaction', () => {
    const mockTxEvent = {
      filterLog: jest.fn(),
    };

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it('returns empty findings if there are no role changes', async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if there is a RoleGranted event', async () => {
      mockTxEvent.filterLog.mockReturnValue([roleGrantedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Role Granted',
          description: `Role ${getRoleName(role)} granted for ${account}`,
          alertId: 'FORTA-TOKEN-ROLE-GRANTED',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            role,
            account,
            sender,
          },
        }),
      ]);
    });

    it('returns a finding if there is a RoleRevoked event', async () => {
      mockTxEvent.filterLog.mockReturnValue([roleRevokedEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Role Revoked',
          description: `Role ${getRoleName(role)} revoked for ${account}`,
          alertId: 'FORTA-TOKEN-ROLE-REVOKED',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            role,
            account,
            sender,
          },
        }),
      ]);
    });

    it('returns a finding if there is a RoleAdminChanged event', async () => {
      mockTxEvent.filterLog.mockReturnValue([roleAdminChanged]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Role Admin Changed',
          description: `${getRoleName(role)}'s admin role changed from ${getRoleName(previousAdminRole)} to ${getRoleName(newAdminRole)}`,
          alertId: 'FORTA-TOKEN-ROLE-ADMIN-CHANGED',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            role,
            previousAdminRole,
            newAdminRole,
          },
        }),
      ]);
    });

    it('returns a finding with UNKNOWN_ROLE if there is a RoleGranted event with unknown role', async () => {
      mockTxEvent.filterLog.mockReturnValue([roleGrantedWithUnknownRoleEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Role Granted',
          description: `Role UNKNOWN_ROLE granted for ${account}`,
          alertId: 'FORTA-TOKEN-ROLE-GRANTED',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            role: unknownRole,
            account,
            sender,
          },
        }),
      ]);
    });
  });
});
