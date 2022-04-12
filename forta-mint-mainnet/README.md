# FORTA Mint Mainnet

## Description

This agent detects mints for the FORTA token on Ethereum Mainnet

## Supported Chains

- Ethereum

## Alerts

- FORTA-MINT-MAINNET
  - Fired when a MINT transaction happens
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - "to"
    - "value"

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xed10c4a6b41f3ae7f51e08d4d5b690a7df8c177b333602850876d773849649ea (100,000 FORT)
