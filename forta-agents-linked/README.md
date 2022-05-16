# Forta Bot Assigned

## Description

Detects if a FORTA Bot has not been linked over 5 minutes after being created

## Supported Chains

- Polygon

## Alerts

- FORTA-BOT-LINK
  - Fired when a transaction contains Bot Link event in a predefined threshold or if the bot is not linked at all
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - botAddress (address of the linked Bot)

## Test Data

The Bot behaviour can be verified with the provided unit tests
