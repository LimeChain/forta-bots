const { Finding, FindingSeverity, FindingType } = require('forta-agent');

const COUNT_THRESHOLD = 3;
const TIME_INTERVAL_MINS = 300;

module.exports = {
  AGENT_REGISTRY: '0x61447385B019187daa48e91c55c02AF1F1f3F863',
  EVENT_SIGNATURE: 'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  COUNT_THRESHOLD,
  TIME_INTERVAL_MINS,
  createAlert(transactions) {
    return Finding.fromObject({
      name: 'High Number of Bot Deployments',
      description: `There were ${COUNT_THRESHOLD} new bots deployed in the last ${TIME_INTERVAL_MINS} minutes`,
      alertId: 'FORTA-HIGH-NUMBER-OF-BOT-DEPLOYMENTS',
      protocol: 'forta',
      severity: FindingSeverity.High,
      type: FindingType.Suspicious,
      metadata: {
        transactions,
      },
    });
  },
};
