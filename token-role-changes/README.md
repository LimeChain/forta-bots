# Forta Token Role Changes Bot

## Description

Detects if a 'RoleGranted', 'RoleRevoked' or 'RoleAdminChanged' event is emitted from the FORT token contract

## Supported Chains

- Ethereum
- Polygon

## Alerts

- FORTA-TOKEN-ROLE-GRANTED
  - Fired when a 'RoleGranted' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - role - the role that was granted
    - account - the account that the role was granted to
    - sender - the account that originated the contract call
    - network - the network that the bot is monitoring (Either "Ethereum" or "Polygon")

- FORTA-TOKEN-ROLE-REVOKED
  - Fired when a 'RoleRevoked' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - role - the role that was granted
    - account - the account that the role was granted to
    - sender - the account that originated the contract call
    - network - the network that the bot is monitoring (Either "Ethereum" or "Polygon")

- FORTA-TOKEN-ROLE-ADMIN-CHANGED
  - Fired when a 'RoleAdminChanged' event is emitted
  - Severity is always set to "medium"
  - Type is always set to "info"
  - Metadata:
    - role - the role that was granted
    - previousAdminRole - the previous admin role
    - newAdminRole - the new admin role
    - network - the network that the bot is monitoring (Either "Ethereum" or "Polygon")

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x8aab20f04de849a5daecbfd67a508fa447012ebb69500c83dfe479a73367a4ed (Polygon; Granted ADMIN_ROLE)
- 0x1781e16d198fdb1f8dcc388203cbe28b0fc9213dd6f1de0d4de437feb895c0fd (Ethereum; Revoked MINTER_ROLE and WHITELISTER_ROLE)
- 0xdc732ae53ba51f0d66711d253337281976615bf39f081998692a09f708ac1e28 (Ethereum; 4 RoleAdminChanged events and 2 RoleGranted events)
