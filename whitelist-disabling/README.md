# Forta Whitelist Disabled Bot

## Description

Detects if the whitelist functionality of the FORT token is disabled

## Supported Chains

- Ethereum
- Polygon

## Alerts

- WHITELIST-DISABLED
  - Fired when the whitelist functionality of the FORT token is disabled
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - network - the network that the bot is monitoring (Either "Ethereum" or "Polygon")
