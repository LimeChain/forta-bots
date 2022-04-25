# Forta Stake Threshold Changed Bot

## Description

Detects if a 'StakeThresholdChanged' event is emitted from Forta Scanners or the Forta Agents contracts

## Supported Chains

- Polygon

## Alerts

- FORTA-STAKE-THRESHOLD-CHANGED-FOR-SCANNERS
  - Fired when a 'StakeThresholdChanged' event is emitted from the Forta Scanners contract
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - chainId - the affected scanners' chainId
    - min - Minimum threshold
    - max - Maximum threshold
    - activated - 'true' if the the threshold is active and 'false' if is not

- FORTA-STAKE-THRESHOLD-CHANGED-FOR-AGENTS
  - Fired when a 'StakeThresholdChanged' event is emitted from the Forta Agents contract
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - min - Minimum threshold
    - max - Maximum threshold
    - activated - 'true' if the the threshold is active and 'false' if is not

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x26a3157862fb793da0c9f619d33973e4e5ad9435d022a31a775a2c9f22e58ea8 (stakeThreshold changed for Forta Scanners)