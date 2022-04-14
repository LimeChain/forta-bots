const {
  FindingType,
  FindingSeverity,
  Finding,
} = require('forta-agent');
const { handleTransaction } = require('./agent');
const { contracts } = require('./agent.config');

const address = Object.keys(contracts)[0];
const newstakeController = '0xstake';

const event = {
  address,
  args: { newstakeController },
};

describe('stake controller changed bot', () => {
  describe('handleTransaction', () => {
    const mockTxEvent = {
      filterLog: jest.fn(),
    };

    it('returns empty findings if there are no role changes', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([]);

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if there is a RoleGranted event', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([event]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Stake Controller Changed',
          description: `stakeController changed for ${contracts[address]}`,
          alertId: 'FORTA-STAKE-CONTROLLER-CHANGED',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            address,
            newstakeController,
          },
        }),
      ]);
    });
  });
});
