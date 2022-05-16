# Forta Scanner Disabled

## Description

This bot detects when a Forta scanner or bot has been disabled

## Supported Chains

- Polygon

## Alerts

- FORTA-SCANNER-DISABLED

  - Fired when a transaction contains the ScannerEnabled event with the value false
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata fields:
    - disabledBy (Who disabled the scanner)
    - scannerId (The id of the scanner)
    - contractName (The name of the contract)

- FORTA-AGENT-DISABLED
  - Fired when a transaction contains the AgentEnabled event with the value false
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata fields:
    - disabledBy (Who disabled the scanner)
    - agentId (The id of the scanner)
    - contractName (The name of the contract)

## Test Data

The bot behaviour can be verified with the following transactions:

- 0x20444d0ae6e5c19540c2d241afe41a0970078be80b648a24a01d6e24b8662ae1 (Scanner Disabled, Polygon)
- 0xd444769b8a7bbd9d1f3cb52f50f3b6fea056b005719707f454973041d376dd74 (Agent Disabled, Polygon)
