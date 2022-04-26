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

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x4d629f53108823547546829545dc31d4f99951efa47f941e705eef9a6d6a5666 (Agent assigned, polygon)
