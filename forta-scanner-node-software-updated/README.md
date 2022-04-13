# FORTA Scanner Node Version Updated

## Description

This agent detects when the FORTA Scanner node verion has been updated

## Supported Chains

- Polygon

## Alerts

- FORTA-SCANNER-NODE-UPDATED
  - Fired when a transaction contains a ScannerNodeVersionUpdated event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - oldVersion
    - newVersion

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xccc0b5fbd3a45dee52ca0f27504bc2c9d0f96844bdff204d237f57388fcd72d5 (ScannerNodeVersionUpdated, Polygon)
