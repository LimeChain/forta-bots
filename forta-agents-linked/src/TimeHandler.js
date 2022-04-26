/*
Idea of this class is to keep track of addresses until they reach the 5 min threshold
Logic:
1)Add address to object as key and the time when it was added
2)Call checkFunction that checks all addresses if the currentTime - their value > threshold -> if so the threshold is off and we add it to the list for the last 5 mins, then we delete it, return the list and reset it from the agent itself
 */

class TimeHandler {
  constructor(threshold) {
    this.threshold = threshold;
    this.agentAddresses = {};
    this.findings = [];
  }

  addToList(address) {
    this.agentAddresses[address] = Math.floor(new Date().getTime() / 1000);
  }

  checkIfPassedThreshold() {
    const currentTime = Math.floor(new Date().getTime() / 1000);

    for (const address in this.agentAddresses) {
      if (currentTime - this.agentAddresses[address] > this.threshold) {
        this.findings.push(address);
        delete this.agentAddresses[address];
      }
    }
    return this.findings;
  }

  reset() {
    this.findings = [];
  }
}

module.exports = TimeHandler;
