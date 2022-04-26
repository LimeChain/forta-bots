# Forta Agent Assigned

## Description

Detects if a FORTA Agent has been assigned

## Supported Chains

- Polygon

## Alerts

- FORTA-AGENT-ASSIGNED
  - Fired when a transaction contains Agent Link event
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata fields:
    - agentAddress (address of the assigned agent)
    - scannerAddress (address of the assigned scanner)
    - enabled (if agent is enabled)
