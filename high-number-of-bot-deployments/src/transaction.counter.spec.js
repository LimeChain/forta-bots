const TransactionCounter = require('./transaction.counter');

let txCounter;
const txHash = '0xhash';

describe('transaction counter', () => {
  beforeEach(() => {
    // Set the interval to 1 minute (60 seconds)
    txCounter = new TransactionCounter(1);
  });

  it('should return 0 if there are no transactions', async () => {
    expect(txCounter.getTransactions()).toStrictEqual([]);
  });

  it('should return 1 after increment on new address', async () => {
    const count = txCounter.increment(txHash, 100);

    expect(count).toStrictEqual(1);
    expect(txCounter.getTransactions()).toStrictEqual([txHash]);
  });

  it('should remove old entries', async () => {
    // 4 transactions: 100, 120, 140, 160
    for (let i = 100; i <= 160; i += 20) {
      txCounter.increment(txHash + i, i);
    }
    expect(txCounter.getTransactions().length).toStrictEqual(4);

    const count = txCounter.increment(txHash + 170, 170);

    // Count should be 4 because the first tx is removed (100 < 170 - 60)
    expect(count).toStrictEqual(4);

    expect(txCounter.getTransactions()).toStrictEqual(
      [txHash + 120, txHash + 140, txHash + 160, txHash + 170],
    );
  });

  it('should clear array on reset', async () => {
    const count = txCounter.increment(txHash, 100);
    expect(count).toStrictEqual(1);

    txCounter.reset();
    expect(txCounter.getTransactions()).toStrictEqual([]);
  });
});
