class AgentTracker {
  constructor() {
    this.tracking = {};
  }
  addCreation(tokenId) {
    this.tracking[tokenId] = { created: true, updated: false };
  }

  addUpdate(tokenId) {
    if (!this.tracking[tokenId]) {
      this.tracking[tokenId] = { created: false, updated: false };
    }

    this.tracking[tokenId].updated = true;
    if (this.tracking[tokenId].created) {
      return true;
    } else {
      return false;
    }
  }

  resetForAgentId(tokenId) {
    delete this.tracking[tokenId];
  }
}

module.exports = AgentTracker;
