# Forta Bot Updated

## Description

This bot detects transactions with Agent Updated events

## Supported Chains

- Polygon

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-BOT-UPDATED

  - Fired when a transaction contains an Agent Updated event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - agentId (the id of the agent )
    - by (who updated the agent)
    - metadata (the metadata )

- FORTA-BOT-CREATED
  - Fired when a transaction contains an Agent Mint Transfer Event
  - Severity is always set to "low
  - Type is always set to "info
  - Metadata fields:
    - agentId (the id of the agent)

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x7d796772747fee5fac1e6b41514ebc2e981bd31b342021c310fc2e619a22ad7c (Agent Updated , polygon)
- 0x61e63130d051dc96e3d88ecaf50e627e305a9ea96daba3fc4ebb6bcb5cee2496 (Bot Created, polygon)
