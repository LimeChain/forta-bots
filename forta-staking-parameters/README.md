# Forta Staking Parameters

## Description

This agent detects FortaStakingChanged and StakeSubjectHandlerChanged events

## Supported Chains

- Polygon

## Alerts

- FORTA-STAKING-PARAMETERS-FORTASTAKINGCHANGED

  - Fired when a transaction contains FortaStakingChanged event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - staking (The new FortaStaking contract address)

- FORTA-STAKING-PARAMETERS-STAKESUBJECTHANDLERCHANGED
  - Fired when a transaction contains StakeSubjectHandlerChanged event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - oldHandler
    - newHandler

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x057da57163e941b7e143c3746fda0d285a065aa03a40083935ff0a37a0fc4df7 (FortaStakingChanged, Polygon)
- 0x747bde6dc476cab9f832174a139cc064652b20762b40dab22978b18392db9ce1 (StakeSubjectHandlerChanged, Polygon)
