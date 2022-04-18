# Forta Routing Updated Bot

## Description

Detects if a 'RoutingUpdated' event is emitted

## Supported Chains

- Polygon

## Alerts

- FORTA-ROUTING-UPDATED
  - Fired when a 'RoutingUpdated' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - sig - the hook signature to listen to
    - target - address of the listening contract
    - enable - true if adding to the list, false to remove
    - revertsOnFail - true if hook execution failure should bubble up, false to ignore
