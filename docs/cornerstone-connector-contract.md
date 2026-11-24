# Cornerstone connector contract

Marketplace connector: `listings/cornerstone/connectors/cornerstone/connector.json`  
URN: `urn:vam:connector:hub.squrell.cloud/squrell/cornerstone`

This is an **HTTP / REST** connector (`profile: oauth` + `bindings`), not a remote MCP server. Skills call `*.csod.com` over egress with `vamsec_cornerstone_csod`.

## What the admin enters at Enable (Squrell-App form)

| UI field | Comes from |
|---|---|
| **Your Cornerstone portal** | `tenant` → admin types the label only (e.g. `acme` → `acme.csod.com`) |
| **Client ID** | `provider.client: "org"` → admin supplies at Enable |

Marketplace `profile: oauth` requires `clientSecret: none` (no secret field on Enable for this file). Scopes stay in the connector file. Binding host is `{subdomain}.csod.com`.

## Member auth

| Actor | Authenticates how | Sees CSOD client secret? |
|---|---|---|
| **Every member** | VAM Log In or SSO Login | No |
| **Admin** | Same, then Org → Connectors → Cornerstone → Enable (portal label + client id) | No (this marketplace file has `clientSecret: none`) |

## Runtime for skills

- Placeholder: `vamsec_cornerstone_csod`
- Binding name: `csod`
- Host template: `{subdomain}.csod.com`
- Skills call HTTP REST via egress; never store client id

## CSOD token note

Cornerstone’s public API uses **client_credentials** against `POST …/services/api/oauth2/token`. Full org-secret vault + client_credentials exchange on the node is still platform follow-up; this listing is the HTTP REST marketplace shape (oauth + bindings + tenant), not MCP.

See [cornerstone-member-auth-plan.md](cornerstone-member-auth-plan.md), [cornerstone-connector-plan.md](cornerstone-connector-plan.md).
