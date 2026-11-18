# Box listing (waiting for VAM connectors Phase 5)

**Status: not released, do not tag.** This listing needs the admin-supplied client of VAM
connectors Phase 5 (`squrell-inc/VAM`, `design/connectors.md` §13, decisions D28 and D29). Until
a `vamd` with Phase 5 is pinned in CI, `vam catalog validate` refuses `connector.json` (the
`client` field and `clientSecret: "org_vault"` are new), so CI on this branch is expected to fail
at validation. The tag `box-v1.0.0` does not exist yet either.

## Why Box needs Phase 5

Box's hosted MCP server (`https://mcp.box.com`) uses OAuth and publishes its metadata, so the
`discover` profile finds the endpoints. But it has no dynamic client registration: a Box admin
enables the "Box MCP server" integration in the Box Admin Console and gets a **client id and
secret**. So the connector says `"client": "org"` (the VAM org admin enters them at Enable) and
`"clientSecret": "org_vault"` (the secret stays in the node's vault and `vamd` does the code
exchange; the app never holds it).

## Test it (team)

1. Box Admin Console: enable the Box MCP server integration, add integration credentials, and add
   the VAM app's redirect URI (`squrell://oauth`, check it with the app team).
2. A `vamd` and app built from the Phase 5 branch: import this listing from this branch
   (`vam catalog import https://github.com/squrell-inc/vam-marketplace --path listings/box --ref box-connector`,
   or whatever Phase 5 allows for unreleased refs).
3. Org settings, Connectors, Box: enter the client id and secret, Enable.
4. As a member: Connect, sign in to Box, then ask the Box assistant a question about a file.
5. Check: no secret in any API listing or app response; a second refresh works (Box refresh tokens
   are single-use and rotate); disconnect and reconnect work.

## Not verified yet (check on the live server before release)

- **Tool names.** The seven read tools in `connector.json` come from Box pages found by search;
  `developer.box.com` could not be read from the session that wrote this. Run `tools/list` against
  the live server and fix the names in `connector.json`, `agent.json`, `SKILLS.md` and the playbook.
  Write tools (upload, update, share) are left out on purpose for version one.
- Whether Box's authorization-server metadata advertises PKCE S256 (the app checks it).
- Whether Box needs any `scope` value (left empty).
- Box AI tools need Box AI enabled for the company; the skill tells the agent what to do if not.
- `requiresNode` is `>=0.2.0`: set it to the first node version that ships Phase 5.

Sources: [Box remote MCP server](https://github.com/box/mcp-server-box-remote/),
[Box MCP remote guide](https://developer.box.com/guides/box-mcp/remote/),
[Box refresh tokens](https://developer.box.com/guides/authentication/tokens/refresh).
