# Forta Agent Assigned

## Description

Detects if a FORTA Agent has been assigned in a predefined threshold

## Supported Chains

- Polygon

## Alerts

- FORTA-AGENT-ASSIGNED
  - Fired when a transaction contains Agent Link event in a predefined threshold
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - agentAddress (address of the assigned agent)

## Test Data

The agent behaviour can be verified with the following block range, but first you need to set the threshold to -1:

- 27574226..27574230 (Agent assigned, polygon)
