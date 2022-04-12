const {
  FindingType,
  FindingSeverity,
  Finding,
} = require('forta-agent');
const { handleTransaction } = require('./agent');
const { getRoleName } = require('./agent.config');

// ADMIN_ROLE
const role = '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775';
const account = '0xaccount';
const sender = '0xsender';

// ROUTER_ADMIN_ROLE and AGENT_ADMIN_ROLE
const previousAdminRole = '0x56623da34b1ec5cb86498f15a28504a6323a0eedfb150423fe6f418d952826ee';
const newAdminRole = '0x2a32a1662c1214ad9d5a31a0a1cb01ef357b3d1954570b75c128485ad3931dbc';

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
          alertId: 'FORTA-ROLE-GRANTED',
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
          alertId: 'FORTA-ROLE-REVOKED',
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
          description: `Role admin changed for role ${getRoleName(role)}`,
          alertId: 'FORTA-ROLE-ADMIN-CHANGED',
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
          alertId: 'FORTA-ROLE-GRANTED',
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
