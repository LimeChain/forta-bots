/*
Idea of this class is to keep track of addresses until they reach the 5 min threshold
Logic:
1)Add address to object as key and the time when it was added
2)Call checkFunction that checks all addresses if the currentTime - their value > threshold -> if so the threshold is off and we add it to the list for the last 5 mins, then we delete it, return the list and reset it from the agent itself
 */

class TimeHandler {
  constructor(threshold) {
    this.threshold = threshold;
    this.agentUpdated = {};
    this.agentLinked = {};
    this.findings = [];
  }

  addToListUpdated(address) {
    this.agentUpdated[address] = Math.floor(new Date().getTime() / 1000);
  }

  addToListLinked(address) {
    this.agentLinked[address] = Math.floor(new Date().getTime() / 1000);
  }

  checkIfPassedThreshold() {
    for (const address in this.agentLinked) {
      //If we have no track of when the agent was updated but we do have the link event, we must delete it and skip the rest of the code execution since (optimisation patch)
      if (!this.agentUpdated[address]) {
        delete this.agentLinked[address];
        continue;
      }
      if (
        this.agentLinked[address] - this.agentUpdated[address] >
        this.threshold
      ) {
        this.findings.push(address);
        delete this.agentUpdated[address];
        delete this.agentLinked[address];
      } else if (
        this.agentLinked[address] - this.agentUpdated[address] <
        this.threshold
      ) {
        delete this.agentUpdated[address];
        delete this.agentLinked[address];
      }
    }
    return this.findings;
  }

  reset() {
    this.agentLinked = {};
    this.agentUpdated = {};
    this.findings = [];
  }
}

module.exports = TimeHandler;
