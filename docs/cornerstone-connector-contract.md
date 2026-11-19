# Cornerstone connector contract

Built-in descriptor (VAM): `spec/connectors/cornerstone.json`  
URN: `urn:vam:connector:hub.squrell.cloud/squrell/cornerstone`

Same packaging pattern as **Microsoft 365**: the connector lives in the VAM node; this marketplace listing ships only skills / playbook / agent (no `connector.json`).

## What the admin enters at Enable (Squrell-App form)

VAM Phase 5 shape — **not** a custom `config.fields` block:

| UI field | Comes from |
|---|---|
| **Client ID** | `provider.client: "org"` → admin supplies at Enable |
| **Client secret** | `provider.clientSecret: "org_vault"` → vaulted, never returned |

Portal base URL / `{corp}.csod.com` as a company-address field is **Phase 6** in VAM (not in the connector schema yet). Binding host in the built-in file is `example.csod.com` for skill validation (same role as Graph’s fixed host for M365); real corp host wiring follows Phase 6.

Scopes listed on the connector are the default set (max 20 per CSOD token call). Admin’s Edge app must include the scopes the skills need.

## Member auth

| Actor | Authenticates how | Sees CSOD client secret? |
|---|---|---|
| **Every member** | VAM Log In or SSO Login | No |
| **Admin** | Same, then Org → Connectors → Cornerstone → Enable (client id + secret) | Yes (enters once) |

## Runtime for skills

- Placeholder: `vamsec_csod`
- Binding name: `csod`
- Skills never store client id/secret

## CSOD token note

Cornerstone’s public API uses **client_credentials**. VAM’s Enable form today stores org client id/secret for OAuth-style connectors (Box pattern). Full CSOD client-credentials token exchange + corp host still needs platform follow-up; the built-in file is aligned so the **admin credential form** matches what Squrell-App already renders.

See [cornerstone-member-auth-plan.md](cornerstone-member-auth-plan.md), [cornerstone-connector-plan.md](cornerstone-connector-plan.md).
