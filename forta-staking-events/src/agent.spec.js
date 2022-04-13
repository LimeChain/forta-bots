const {
  FindingType,
  FindingSeverity,
  Finding,
} = require('forta-agent');
const { handleTransaction } = require('./agent');

const name = 'TreasurySet';
const address = '0xaddress';
const args = { newTreasury: address };

const treasurySetEvent = {
  name,
  args,
};

describe('forta staking events bot', () => {
  describe('handleTransaction', () => {
    const mockTxEvent = {
      filterLog: jest.fn(),
    };

    beforeEach(() => {
      mockTxEvent.filterLog.mockReset();
    });

    it('returns empty findings if there are no events', async () => {
      mockTxEvent.filterLog.mockReturnValue([]);

      const findings = await handleTransaction(mockTxEvent);
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if there is an event', async () => {
      mockTxEvent.filterLog.mockReturnValue([treasurySetEvent]);

      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Forta Staking Event',
          description: `Event ${name} emitted from the Forta Staking contract`,
          alertId: 'FORTA-STAKING-EVENTS',
          protocol: 'forta',
          severity: FindingSeverity.Medium,
          type: FindingType.Info,
          metadata: {
            event: name,
            args,
          },
        }),
      ]);
    });
  });
});
