# Forta Staking Events Bot

## Description

Detects if a 'Slashed', 'TokensSwept', 'DelaySet', 'TreasurySet', 'StakeParamsManagerSet' or 'Froze' event is emitted from the Forta Staking contract

## Supported Chains

- Polygon

## Alerts

- FORTA-STAKING-EVENTS
  - Fired when a 'Slashed', 'TokensSwept', 'DelaySet', 'TreasurySet', 'StakeParamsManagerSet' or 'Froze' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - args - the event's args

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x192e69f9d1a333235b9c22e7148b9c46e925206bf6fc785e2ccfe68e482a064b (Slashed)
- 0x66166468ccf4bea9fd1e8893f2682c07943d4646d6f0a924de7dd35c4c017f2f (DelaySet)
- 0xaffd91a84b98c03fb0805b70827fa7e8f799fa00b8b26704955482f14feb38d4 (DelaySet and TreasurySet)
- 0xc0d686bbf3118d45125a0014fb3f5d2b95aa8034f3e44909463b1f7b8acfa4a8 (StakeParamsManagerSet)
- 0x70b8895b553a75b71f26ca77d0df4c803d8a0171ae3b206e7a51769ca5266354 (Froze)
