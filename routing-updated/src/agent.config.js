const { Finding, FindingSeverity, FindingType } = require('forta-agent');

module.exports = {
  ROUTER_ADDRESS: '0xbb12476ab9f27d3b441964B0aFC03D14a82e1D64',
  EVENT_SIGNATURE: 'event RoutingUpdated(bytes4 indexed sig, address indexed target, bool enable, bool revertsOnFail)',
  createAlert(args) {
    const {
      sig,
      target,
      enable,
      revertsOnFail,
    } = args;

    return Finding.fromObject({
      name: 'Routing Updated',
      description: 'The router emitted "RoutingUpdated" event',
      alertId: 'FORTA-ROUTING-UPDATED',
      protocol: 'forta',
      severity: FindingSeverity.Medium,
      type: FindingType.Info,
      metadata: {
        sig,
        target,
        enable,
        revertsOnFail,
      },
    });
  },
};
