/*
Idea of this class is to keep track of addresses until they reach the 5 min threshold
Logic:
1)Add address to object as key and the time when it was added
2)Call checkFunction that checks all addresses if the currentTime - their value > threshold -> if so the threshold is off and we add it to the list for the last 5 mins, then we delete it, return the list and reset it from the agent itself
 */

class TimeHandler {
  constructor(threshold) {
    this.threshold = threshold;
    this.agentCreated = {};
    this.agentLinked = {};
    this.findings = [];
  }

  addToListCreated(address) {
    this.agentCreated[address] = Math.floor(new Date().getTime() / 1000);
  }

  addToListLinked(address) {
    this.agentLinked[address] = Math.floor(new Date().getTime() / 1000);
  }

  getCurrentTime() {
    return Math.floor(new Date().getTime() / 1000);
  }

  checkIfPassedThreshold() {
    for (const address in this.agentLinked) {
      //If we have no track of when the agent was updated but we do have the link event, we must delete it and skip the rest of the code execution since (optimisation patch)
      if (!this.agentCreated[address]) {
        delete this.agentLinked[address];
        continue;
      }
      if (
        this.agentLinked[address] - this.agentCreated[address] >
        this.threshold
      ) {
        this.findings.push(address);
        delete this.agentCreated[address];
        delete this.agentLinked[address];
      } else if (
        this.agentLinked[address] - this.agentCreated[address] <
        this.threshold
      ) {
        delete this.agentCreated[address];
        delete this.agentLinked[address];
      }
    }

    for (const address in this.agentCreated) {
      if (
        !this.agentLinked[address] &&
        this.getCurrentTime() - this.agentCreated[address] > this.threshold
      ) {
        this.findings.push(address);
        delete this.agentCreated[address];
      }
    }

    return this.findings;
  }

  reset() {
    this.findings = [];
  }
}

module.exports = TimeHandler;
