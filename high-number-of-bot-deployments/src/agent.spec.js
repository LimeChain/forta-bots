const {
  FindingType,
  FindingSeverity,
  Finding,
  ethers,
} = require('forta-agent');
const { provideHandleTransaction } = require('./agent');
const { COUNT_THRESHOLD, TIME_INTERVAL_MINS } = require('./agent.config');

const hash = '0xhash';
const timestamp = 100;

const ADDRESS_ZERO = ethers.constants.AddressZero;

const mintEvent = {
  args: {
    from: ADDRESS_ZERO,
    to: '0xto',
    tokenId: '1000',
  },
};

const transferEvent = {
  args: {
    from: '0xfrom',
    to: '0xto',
    tokenId: '1000',
  },
};

describe('high number of bot deployments bot', () => {
  describe('handleTransaction', () => {
    let handleTransaction;
    const mockTxCounter = {
      increment: jest.fn(),
      getTransactions: jest.fn(),
      reset: jest.fn(),
    };

    const mockTxEvent = {
      filterLog: jest.fn(),
      hash,
      timestamp,
    };

    beforeAll(() => {
      handleTransaction = provideHandleTransaction(mockTxCounter);
    });

    beforeEach(() => {
      mockTxCounter.increment.mockReset();
      mockTxCounter.reset.mockReset();
      mockTxCounter.getTransactions.mockReset();
    });

    it('returns empty findings if there is no Mint event', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([transferEvent]);

      const findings = await handleTransaction(mockTxEvent);
      expect(mockTxCounter.increment).toHaveBeenCalledTimes(0);
      expect(findings).toStrictEqual([]);
    });

    it('returns empty findings if volume is under threshold', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([mintEvent]);
      mockTxCounter.increment.mockReturnValueOnce(1);

      const findings = await handleTransaction(mockTxEvent);
      expect(mockTxCounter.increment).toHaveBeenCalledTimes(1);
      expect(mockTxCounter.increment).toHaveBeenCalledWith(hash, timestamp);
      expect(findings).toStrictEqual([]);
    });

    it('returns a finding if volume is above threshold', async () => {
      mockTxEvent.filterLog.mockReturnValueOnce([mintEvent]);
      mockTxCounter.increment.mockReturnValueOnce(COUNT_THRESHOLD);

      const transactions = [{ txHash: '0xtx1' }];
      mockTxCounter.getTransactions.mockReturnValueOnce(transactions);

      const findings = await handleTransaction(mockTxEvent);

      expect(mockTxCounter.increment).toHaveBeenCalledTimes(1);
      expect(mockTxCounter.increment).toHaveBeenCalledWith(hash, timestamp);
      expect(mockTxCounter.getTransactions).toHaveBeenCalledTimes(1);
      expect(mockTxCounter.reset).toHaveBeenCalledTimes(1);
      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'High Number of Bot Deployments',
          description: `There were ${COUNT_THRESHOLD} new bots deployed in the last ${TIME_INTERVAL_MINS} minutes`,
          alertId: 'FORTA-HIGH-NUMBER-OF-BOT-DEPLOYMENTS',
          protocol: 'forta',
          severity: FindingSeverity.High,
          type: FindingType.Suspicious,
          metadata: {
            transactions,
          },
        }),
      ]);
    });
  });
});
