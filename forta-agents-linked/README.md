# Forta Bot Assigned

## Description

Detects if a FORTA Bot has been linked over 5 minutes after being updated

## Supported Chains

- Polygon

## Alerts

- FORTA-BOT-ASSIGNED
  - Fired when a transaction contains Bot Link event in a predefined threshold
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - botAddress (address of the assigned Bot)

## Test Data

The Bot behaviour can be verified with the provided unit tests
