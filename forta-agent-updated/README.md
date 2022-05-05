# Forta Agent Updated

## Description

This bot detects transactions with Agent Updated events

## Supported Chains

- Polygon

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-AGENT-UPDATED
  - Fired when a transaction contains an Agent Updated event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - agentId (the id of the agent )
    - by (who updated the agent)
    - metadata (the metadata )

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xd4aa245702d7547f6ec31743ae39bb13b4638a76920e4a64fafb2d73ca70dcfb (Agent Updated , polygon)
