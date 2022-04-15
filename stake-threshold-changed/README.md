# Forta Stake Controller Changed Bot

## Description

Detects if a 'StakeControllerUpdated' event is emitted from Forta Scanners or the Forta Agents contracts

## Supported Chains

- Polygon

## Alerts

- FORTA-STAKE-CONTROLLER-CHANGED
  - Fired when a 'StakeControllerUpdated' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - address - the address of the contract that emitted the event
    - newstakeController - the new stakeController

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x26a3157862fb793da0c9f619d33973e4e5ad9435d022a31a775a2c9f22e58ea8 (stakeThreshold changed for Forta Scanners)