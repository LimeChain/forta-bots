const {
  FindingType,
  FindingSeverity,
  Finding,
} = require('forta-agent');
const { handleTransaction } = require('./agent');
const { contracts } = require('./agent.config');

const scannersAddress = Object.keys(contracts)[0];
const agentsAddress = Object.keys(contracts)[1];
const newstakeController = '0xstake';

const scannersEvent = {
  address: scannersAddress,
  args: { newstakeController },
};

const agentsEvent = {
  address: agentsAddress,
  args: { newstakeController },
};

describe('stake controller changed bot', () => {
  describe('handleTransaction', () => {
    const mockTxEvent = {
      filterLog: jest.fn(),
    };

    it('returns empty findings if there are no StakeControllerChanged events', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([]);

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if there is a StakeControllerChanged event from the Forta Scanners contract', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([scannersEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Stake Controller Changed',
          description: 'stakeController changed for Forta Scanners',
          alertId: 'FORTA-STAKE-CONTROLLER-CHANGED-FOR-FORTA-SCANNERS',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            address: scannersAddress,
            newstakeController,
          },
        }),
      ]);
    });

    it('returns a finding if there is a StakeControllerChanged event from the Forta Agents contract', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([agentsEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Stake Controller Changed',
          description: 'stakeController changed for Forta Agents',
          alertId: 'FORTA-STAKE-CONTROLLER-CHANGED-FOR-FORTA-AGENTS',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            address: agentsAddress,
            newstakeController,
          },
        }),
      ]);
    });
  });
});
