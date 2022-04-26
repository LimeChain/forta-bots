# Forta Agent Assigned

## Description

Detects if a FORTA Agent has been assigned in a predefined time threshold

## Supported Chains

- Polygon

## Alerts

- FORTA-AGENT-ASSIGNED
  - Fired when a transaction contains Agent Link event in a predefined time threshold
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - agentAddress (address of the assigned agent)
