# Forta scanners capacity check

## Description

This agent detects if scanners of a specific chainId are under or over capacity

## Supported Chains

- Polygon

## Alerts

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
