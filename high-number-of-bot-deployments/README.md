# Forta High Number of Bot Deployments Bot

## Description

Detects if a high number of bots are deployed in a time interval

## Supported Chains

- Polygon

## Alerts

- FORTA-HIGH-NUMBER-OF-BOT-DEPLOYMENTS
  - Fired when a high number of bots are deployed in a time interval
  - Severity is always set to "high"
  - Type is always set to "suspicious"
  - Metadata:
    - transactions - IDs of the transactions that deployed an agent

## Test Data

Change the `COUNT_THRESHOLD` to 3 and the `TIME_INTERVAL_MINS` to 300.
Then run `npm run tx 0x25ccafa329cc085428b5d0d3d75c7692493280d11ad11e5d719fb3725e675698,0x0435ef111cfa9c174625ef1ca31bfc00391e866868a8e1f27f6c394989b0fed9,0x0f2ce96c6f739de86ba9bd553de0861a2f419b59850f8ce7dcc83e27b5bed2a0`
