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

- 0x88eac72a63923cafda017b1c6d5e21c5cccde2f53181d59214b40cba09186ae7 (stakeController changed for Forta Scanners)
- 0xbc215fbdae97afddfe537230cb35d0cad14c5b0e971249c76da138072626ce01 (stakeController changed for Forta Agents)