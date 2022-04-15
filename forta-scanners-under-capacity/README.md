# Forta scanners capacity check

## Description

This agent detects if scanners of a specific chainId are under or over capacity

## Supported Chains

- Polygon

## Alerts

- FORTA-SCANNER-MINTED

  - Fired when a transaction contains a Scanner mint event
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata fields:
    - scannerId (The minted scanenrId)
    - chainId (The minted scanner chainId)

- FORTA-SCANNER-OVER-CAPACITY-THRESHOLD

  - Fired when scanners from a chain are over their capacity threshold
  - Severity is always set to "Medium"
  - Type is always set to "info"
  - Metadata fields:
    - threshold (The predefined threshold %)
    - capacityPercentage (The current threshold %)
    - chainId (The chainId where the scanners are over the threshold)

- FORTA-SCANNER-UNDER-CAPACITY-THRESHOLD
  - Fired when scanners from a chain are under their capacity threshold
  - Severity is always set to "Medium"
  - Type is always set to "info"
  - Metadata fields:
    - threshold (The predefined threshold %)
    - capacityPercentage (The current threshold %)
    - chainId (The chainId where the scanners are under the threshold)

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x90026c1d8e3b556efee1cac72c7ff14a629238dd6202efe5a91b4096ba51df71 (Scanner is minted, Polygon)
