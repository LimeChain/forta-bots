# Forta contracts that emit upgraded

## Description

This bot detects if an upgrade event occurs on a set of contracts on either polygon mainnet or ethereum mainnet

## Supported Chains

- Ethereum
- Polygon

## Alerts

- FORTA-EMIT-UPGRADED
  - Fired when a transaction contains a Upgraded event for any of the specified contracts
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - name
    - address

## Test Data

The bot behaviour can be verified with the following transactions:

- 0x73900ada1b393c1fba0ef043ecbb87e58800fb030687d3b58b770a5de7907f1b (FORTA Contract emits Upgraded, Ethereum)
- 0x878d79c6f02ae201556719f10bd0ae6455e61c71f5e4de0e067bb4aaf5133edd (Dispatch Contract emits Upgraded, Polygon)
