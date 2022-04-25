module.exports = class TransactionCounter {
  constructor(timeIntervalMins) {
    this.timeInterval = timeIntervalMins * 60; // Convert to seconds
    this.transactions = [];
  }

  increment(txHash, blockTimestamp) {
    // Append the transaction
    this.transactions.push({
      txHash,
      timestamp: blockTimestamp,
    });

    // Filter out any transactions that fall outside of the time interval
    this.transactions = this.transactions.filter(
      (t) => t.timestamp >= blockTimestamp - this.timeInterval,
    );

    return this.transactions.length;
  }

  getTransactions() {
    return this.transactions.map((t) => t.txHash);
  }

  reset() {
    this.transactions = [];
  }
};
