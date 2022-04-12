# Forta Access Control Role Changes Bot

## Description

Detects if a 'RoleGranted', 'RoleRevoked' or 'RoleAdminChanged' event is emitted from the Access Control contract

## Supported Chains

- Polygon

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-ROLE-GRANTED
  - Fired when a 'RoleGranted' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - role - the role that was granted
    - account - the account that the role was granted to
    - sender - the account that originated the contract call

- FORTA-ROLE-REVOKED
  - Fired when a 'RoleRevoked' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - role - the role that was granted
    - account - the account that the role was granted to
    - sender - the account that originated the contract call

- FORTA-ROLE-ADMIN-CHANGED
  - Fired when a 'RoleAdminChanged' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - role - the role that was granted
    - previousAdminRole - the previous admin role
    - newAdminRole - the new admin role

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x5238cf3ebb3c79b5a5c32c0cac30f67604e9fbacc7b3c1db6342c8560d7df796 (Granted DEFAULT_ADMIN_ROLE)
- 0x98b78412631f8a5b1e0eca251c64f001f4e055c8eb05e72504c2e06738903b78 (Granted ADMIN_ROLE)
- 0xa66bb15a468cada60e3222514f0517323d81efd9cee6b1b4e83a352ca357c357 (Granted ROUTER_ADMIN_ROLE)
- 0x3be3702724fcbeba5223cdce19281cdf6c9be4b188b381a758a38e34f4f156ff (Revoked ENS_MANAGER_ROLE)
- 0x186a104969addff3a6883272a4cdabc97e3413f05c1011cad06e011755283df2 (Revoked SCANNER_VERSION_ROLE)