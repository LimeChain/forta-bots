# FORTA Access Manager/Router Updated

## Description

This bot detects AccessManagerUpdated/RouterUpdated events being emitted

## Supported Chains

- Polygon

## Alerts

- FORTA-ROUTER-UPDATED

  - Fired when a transaction contains a RouterUpdated event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - name (The name of the contract that invoked the event)
    - router (The new router address)

- FORTA-ACCESS-MANAGER-UPDATED
  - Fired when a transaction contains a AccessManagerUpdated event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - name (The name of the contract that invoked the event)
    - newAddressManager (The new address manager address)

## Test Data

The bot behaviour can be verified with the following transactions:

- 0x39dd322c91e6e4953370d0e2a2932d309dc091bc584d38c5fa4ce424835ce527 (Contains both events in a single transaction, Polygon)
