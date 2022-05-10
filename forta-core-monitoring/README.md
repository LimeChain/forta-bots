# Forta Core Monitoring

## Description

This bot detects multiple kinds of events for monitoring

## Supported Chains

- Polygon

## Alerts

- FORTA-STAKING-THRESHOLD-CHANGED

  - Fired when the staking threshold changes
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - min (min stake threshold)
    - max (max stake threshold)
    - activated (is the staking threshold active)

- FORTA-BOT-STATE-CHANGED

  - Fired when a bot state changes
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - agentId (The id of the agent)
    - contractName (Contract calling the event)
    - disabledBy (Permissions rank of caller)
    - currentState (The current state of the bot)

- FORTA-SCANNER-STATE-CHANGED

  - Fired when a scanner state changes
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - scannerId (The id of the scanner)
    - contractName (Contract calling the event)
    - disabledBy (Permissions rank of caller)
    - currentState (The current state of the scanner)

- FORTA-NEW-SCANNER
  - Fired when a scanner is minted
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - to (minter address)
    - tokenId (new scannerId)

## Test Data

The bot behaviour can be verified with the following transactions:

- 0xd444769b8a7bbd9d1f3cb52f50f3b6fea056b005719707f454973041d376dd74 (Forta Bot State changed, Polygon)

- 0x20444d0ae6e5c19540c2d241afe41a0970078be80b648a24a01d6e24b8662ae1 (Forta scanner state changed, Polygon)

- 0xa8076d3cda8cb8618abc66b12b4d3a14fc9142880579b5cab460fa6bbff7c5cf (Forta new scanner minted, Polygon)
