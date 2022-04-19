# FORTA Scanner SLA Under Threshold

## Description

This agent detects if a scanner gets under a predefined SLA Threshold

## Supported Chains

- Polygon

## Alerts

- FORTA-SCANNER-SLA-UNDER-THRESHOLD
  - Fired when a Scanner's SLA gets under the predefined threshold and could have his stake slashed or disqualified
  - Severity is always set to "high"
  - Type is always set to "info"
  - Metadata fields:
    - scannerId (The id of the scanner)
    - slaValue: (The SLA value of the scanner)
