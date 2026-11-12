# Reference listing: Notion (connector, skill, playbook, agent)

Audience: engineers who have not worked on VAM. This is a worked example of how to build a listing, using the released Notion listing.

**Status: released** as `notion-v1.0.0`, after the live sign-in test in section 8, stage 2 (sign-in worked and the three pinned tools were on the live server).

**Basis:** `squrell-inc/VAM` `main`, this repository at tag `microsoft-365-v1.0.0`.

**Legend:**
- **[code]** checked in the `squrell-inc/VAM` source.
- **[ran]** checked by running the `vam` CLI.
- **[web]** from vendor or third-party pages found by search.
- **[UNVERIFIED]** not confirmed yet.

Vendor facts (Notion's server, tool names, plan limits) are re-checked in stage 2. Decisions that are settled are not marked.

## Files in this listing

| File | What it is |
|---|---|
| [`listings/notion/connectors/notion/connector.json`](../listings/notion/connectors/notion/connector.json) | The connector: how a member signs in, which server, which tools |
| [`listings/notion/skills/notion-workspace/manifest.json`](../listings/notion/skills/notion-workspace/manifest.json) | The skill manifest: id, version, required connector, no tools |
| [`listings/notion/skills/notion-workspace/SKILLS.md`](../listings/notion/skills/notion-workspace/SKILLS.md) | The skill text: how to use the Notion tools |
| [`listings/notion/playbooks/publish-meeting-notes/playbook.json`](../listings/notion/playbooks/publish-meeting-notes/playbook.json) | The playbook: find parent, draft, ask the member, create |
| [`listings/notion/agents/notion-assistant/agent.json`](../listings/notion/agents/notion-assistant/agent.json) | The agent: instructions and tool permissions |

This guide does not repeat the JSON from those files. Where this guide and a file disagree, the file is right. Fix this guide.

---

## 1. Why Notion, and what the user gets

Notion's hosted MCP server is `https://mcp.notion.com/mcp`. It signs users in with OAuth 2.0, using protected-resource metadata and dynamic client registration. So VAM's `discover` sign-in profile applies. No client id and no vendor admin step are needed [web].

The server has read tools (search, fetch) and a write tool (create pages). The use case is easy to explain:

> "Search our team docs, and turn these meeting notes into a Notion page."

The agent finds the right parent page and drafts the new page. The member approves on a card. Only then is the page created.

Other candidates we looked at:

| Candidate | MCP URL | Auth | Vendor-side setup | Verdict |
|---|---|---|---|---|
| **Notion** | `https://mcp.notion.com/mcp` | OAuth 2.0, dynamic registration | None to connect. Enterprise workspaces can allowlist MCP clients | **Chosen** |
| Sentry | `https://mcp.sentry.dev/mcp` | OAuth with dynamic registration | None found | Good second choice. Developer audience, less obvious business use |
| Atlassian | `https://mcp.atlassian.com/v1/mcp` [UNVERIFIED path] | OAuth 2.1 with dynamic registration | An org admin must allow the client's domain | Rejected: needs vendor admin enablement |
| Asana | `https://mcp.asana.com/v2/mcp` | OAuth, no dynamic registration | The app must be pre-registered | Rejected: `discover` cannot be used |

**Not verified for Notion** [UNVERIFIED]:
- Whether the Free plan can use the hosted server.
- Whether Notion's authorization server advertises scopes.
- A real sign-in from VAM.

The sign-in is the cheapest risk to kill. Do stage 2 before anything else.

---

## 2. Pieces and owners

Each artifact owns one decision, and each has one owner. Dependencies point down: agent, then playbook, then skill, then connector. A listing only bundles artifacts.

| Piece | Decision it owns | Owner | Changes | In this listing |
|---|---|---|---|---|
| Connector | How the node reaches Notion for a member: sign-in kind, the one server, the vetted tools and their risk classes | Platform side | Rarely. Each change needs a security review | `connectors/notion` |
| Skill | How to do a kind of work. For an MCP connector there is no code, only prose | Builders | Often | `skills/notion-workspace` (prose only) |
| Playbook | The procedure for one job | Domain experts | Per organization | `playbooks/publish-meeting-notes` |
| Agent | Who the user talks to: instructions, rules, and what it may use | Builders, tuned by the organization | Most often | `agents/notion-assistant` |
| Listing | What an admin installs as one unit. A view, not an artifact | Marketplace curators | Per release | One entry in `marketplace.json` |
| Connection (not shipped) | Whose Notion account | The member, gated by the admin | At run time | Created when a member clicks Connect |

Rules that follow from this:
- Auth is platform work. Nothing in these files holds a token, client id or refresh logic.
- Rules live on the agent. The connector's defaults and the admin may only tighten them [code].
- An artifact may reference only artifacts in its own listing. This is enforced at install [code].

---

## 3. Repo layout and the index entry

```
marketplace.json                      index (Notion entry not added yet)
listings/notion/
  connectors/notion/connector.json
  skills/notion-workspace/
    manifest.json
    SKILLS.md
  playbooks/publish-meeting-notes/playbook.json
  agents/notion-assistant/agent.json
```

One directory is one artifact. Its marker file sets the kind: `connector.json`, `SKILLS.md`, `playbook.json` or `agent.json`. A directory with two markers is an error [code].

The listing has no tests of its own. Skill tests exist only for the Microsoft 365 skill, which ships tools.

### The index entry

This is the entry that `marketplace.json` will get at release. It is **not** in the file yet. Add it only after stage 2 passes.

```json
{
  "id": "notion",
  "displayName": "Notion",
  "description": "Search the member's Notion workspace and publish meeting notes as pages, through their own Notion connection. Pages are created only after the member approves.",
  "connector": "urn:vam:connector:hub.squrell.cloud/squrell/notion",
  "artifacts": [
    { "kind": "connector", "path": "listings/notion/connectors/notion" },
    { "kind": "skill", "path": "listings/notion/skills/notion-workspace" },
    { "kind": "playbook", "path": "listings/notion/playbooks/publish-meeting-notes" },
    { "kind": "agent", "path": "listings/notion/agents/notion-assistant" }
  ],
  "ref": "notion-v1.0.0",
  "requiresNode": ">=0.1.0"
}
```

Field notes [code]:
- `id` is a lowercase slug, at most 64 characters. The id is also the name in the release tag.
- `connector` is optional. Here the listing ships its own connector, so the value equals the connector's URN.
- `artifacts[].kind` is one of `skill`, `agent`, `playbook`, `connector`. Up to 32 per listing.
- `ref` is a **tag**, never a branch or a commit id. Form: `<id>-v<major>.<minor>.<patch>`.
- `requiresNode` is a comparator such as `>=0.1.0`. It is checked against the node at install.
- Every artifact URN must sit under the marketplace's `publisherDomain`. Here that is `hub.squrell.cloud`.

**Domain and badge.** The URNs are under `hub.squrell.cloud/squrell/`. That gives the Squrell badge. The owner decided this. A third party that builds its own marketplace uses its own `publisherDomain` and namespace in every URN.

---

## 4. The connector

File: [`listings/notion/connectors/notion/connector.json`](../listings/notion/connectors/notion/connector.json). Format: `Connector` struct in `crates/vam-spec/src/connector.rs`, with extra limits for marketplace files in `connector_listing.rs` [code].

### Fields

| Field | Meaning and rule |
|---|---|
| `urn` | `urn:vam:connector:<domain>/<namespace>/<id>`. The **id** is the last segment: 1 to 64 characters of `a-z 0-9 - _`. It becomes the member's connection id and the prefix of guest tool names. The id `notion` is used here. Reserved ids are refused (see gotcha 1) |
| `version` | Short token. The catalog assigns releases at install: the next patch when content changes |
| `displayName`, `publisher` | At most 120 characters, one line. Refused if they contain "squrell", or equal a built-in connector's name or publisher. This stops an Unverified connector from passing for a verified one. `publisher` is shown to the admin before Enable. The publisher is `Notion (hosted MCP server)`, a neutral name the owner chose |
| `description` | At most 2000 characters |
| `icon` | A plain name (`a-z 0-9 -`, at most 40 characters), not a URL. The app must not load an address a publisher chose |
| `provider.kind` | Must be `oauth2`. `api_key` is refused: "a node has no connection flow for an API key". The same goes for `entra`, `google` and `slack` |
| `provider.profile` | Must be `discover`. The node finds the server's metadata (RFC 9728), registers a client (dynamic registration first, then CIMD if the server advertises it), and runs PKCE. There is no client id in the file [code] |
| `provider.clientSecret` | Must be `none`. Any other value is refused |
| `provider.orgConsent` | Must be `none` for `discover` |
| `provider.clientId` | Optional, only for the publisher's own public client. Omit it |
| `provider.scopes` | A list of plain tokens, at most 32. For `discover` the app does not send these. It asks for the scopes the server's metadata offers [code]. Notion documents none, so the list is empty |
| `connection` | `holder: "user"` and `multiAccount: false` are the only values allowed in version one. `label` is how the tile names the account. Its use for MCP connectors is [UNVERIFIED] |
| `mcp.url` | `https`, a full lowercase DNS name, no IP address, no query or fragment, port 443 or none, no reserved suffix such as `.internal` or `.local`. At most 512 characters [code]. The host becomes the connector's only reachable host: `mcp.notion.com` |
| `mcp.tools[].remote` | The vendor's tool name, exactly. 1 to 64 tools per connector. **Only listed tools are offered.** The node drops every other tool the server returns, and a call to an unlisted tool fails with `tool_not_offered` [code] |
| `mcp.tools[].sideEffect` | `READ_ONLY`, `MUTABLE_LOCAL` or `MUTABLE_EXTERNAL`. This is the risk class the policy engine uses. Unlisted tools default to mutable external |
| `mcp.tools[].default` | Optional: `allow`, `ask` or `block`. Writes use `ask`. Reads omit it, because they are vetted `READ_ONLY` |
| Not allowed | `bindings` (REST only), `events`, `ui`. Any other key is an error, because the file rejects unknown fields |

### The three pinned tools

| Tool (vendor name) | Side effect | Default | Use |
|---|---|---|---|
| `notion-search` | `READ_ONLY` | none, runs without asking | Find pages and databases by words |
| `notion-fetch` | `READ_ONLY` | none, runs without asking | Read one page or database |
| `notion-create-pages` | `MUTABLE_EXTERNAL` | `ask` | Create a page |

So the connector pins **three tools**: two `read_only`, and one `mutable_external` with `ask`.

The update, comment and move tools are **deliberately not pinned**. Pinning fewer tools keeps the admin's review short and the blast radius small. Adding one later is a capability change. It needs Enable again (gotcha 8).

The tool names come from Notion's tool reference as summarised by search [web]. Stage 2 checks them against the live server.

### Can connector tools show cards?

No, not today. A connector's `mcp.tools[]` entries take only `remote`, `sideEffect` and `default`. A `ui` key is rejected [ran]. MCP tool results show as plain results in the thread. The approval for a write is the standard approval card for that tool call, with its arguments. The playbook's gate question is the way to show the draft before the write (section 6).

---

## 5. The skill

Files: [`manifest.json`](../listings/notion/skills/notion-workspace/manifest.json) and [`SKILLS.md`](../listings/notion/skills/notion-workspace/SKILLS.md). The skill has no tools and no code (`tools: []`).

**What it is for.** The connector's tools reach every session as a preloaded skill. The server's own instructions come with it [code]. The marketplace skill adds what the server cannot say: how your team wants the tools used, what to check before a write, and the guardrails.

**Two spellings of a tool name.** This is the most likely mistake. Use the right one in the right place:

| Where | Spelling | Example |
|---|---|---|
| Prose, playbook steps, guards and evidence | Guest name: connection id and vendor name, with `-` changed to `_` | `notion__notion_search` |
| Agent permission rules | `mcp:<server>/<vendor name>`, with hyphens and the server id | `mcp:mcp.notion.com/mcp/notion-search` |

Guest names are built by `guest_tool_name` in the CLI's MCP registry code. Permission targets are built from the server id and the vendor name [code]. A wrong rule target is a silent deny, because the agent uses `default: deny`.

**Rules for the file pair:**
- `manifest.json` and the `SKILLS.md` frontmatter must agree on `id` (the URN) and `version`.
- The `SKILLS.md` body must not be empty [code].
- Changing the content needs a **new version** in both files. Otherwise the install is refused with "already installed with different content" [code].
- `requiresConnector` names the connector. It is metadata for the admin, and it lets a connector page list the skills that depend on it.

**No code, no tests.** Nothing here needs a `tests/` folder. Whether a zero-tool skill helps in practice, with the model loading it and following the prose, is [UNVERIFIED]. It validates, but no agent has run it yet. Stage 3 checks it.

---

## 6. The playbook

File: [`playbook.json`](../listings/notion/playbooks/publish-meeting-notes/playbook.json). Format: `vam.v1.PlaybookSpec`, wrapped as `{ "spec": ... }` [code]. Enums use the proto names.

**Procedure:**
1. Find the parent page or database. The agent searches with the input hint.
2. Draft the page. Nothing is created in this step.
3. A human gate. The question shows the draft's title and the parent.
4. Create the page, only if the member picked `approved`.

**Guard.** A guard denies the write tool until the gate says `approved`. The guard can only deny. It never grants. The agent's rules and Cedar still decide [code].

**Notes:**
- `activation.when` is required to release. It is at most 280 characters [code].
- `requires.skills` names a skill in the same listing. Install pins it to the listing's version. Leave `version` off.
- The gate needs two or more `options`, or a `responseSchema`. `timeout` is at most 30 days. The default is 72 hours.
- The gate and the tool's own `ask` are two layers on purpose. The gate shows the draft. The `ask` covers every write, in any procedure.
- Tool names in `evidence` and `guards` are guest names. Whether they match at run time is [UNVERIFIED]. Stage 3 checks it.
- Playbook text may use `{{inputs.x}}` and `{{steps.<id>.output.<field>}}`.

---

## 7. The agent

File: [`agent.json`](../listings/notion/agents/notion-assistant/agent.json). Format: `{ "spec": <AgentSpec> }` [code].

**It does not name the connector.** The connection's tools reach every session of a member who has a connected, enabled connector. The agent's rules decide what it may call.

**Rules.** The agent uses `default: deny`, then one rule per tool:
- The two read tools are `allow`.
- The write tool is `ask`.
- Everything else is denied, because a tool with no rule is denied in permissions mode.

Decisions are `allow`, `ask` and `deny`. Strictness runs `deny > ask > allow`. The connector's `ask` and the agent's `ask` agree. An admin can only make the rules stricter [code].

**Permissions are required.** An installed agent must carry `permissions`. The legacy policy fields cannot ship [code].

**Playbook access.** `allowedPlaybookRefs` lists the playbook by name. The agent may start only that one. `allowAnyPlaybook` does not widen this [code].

Whether a run finishes cleanly without an explicit allow for the completion tool is [UNVERIFIED]. Stage 3 checks it.

---

## 8. How to test before release

Four stages. Each stage must pass before the next one starts. Stage 1 needs no node. Stages 2 and 3 need a node and a Notion account.

### Stage 1: offline validate

Build the CLI from the public repository. CI builds it the same way.

```
git clone https://github.com/squrell-inc/VAM
cd VAM
cargo build --release -p vam-cli
```

The binary is `target/release/vam`. A clean build takes about 4 minutes [ran].

From the root of `vam-marketplace`, run these with that binary:

```
vam catalog validate listings/notion/connectors/notion --strict
vam catalog validate listings/notion/skills/notion-workspace --strict
vam catalog validate listings/notion/playbooks/publish-meeting-notes --strict
vam catalog validate listings/notion/agents/notion-assistant --strict
vam catalog validate . --strict
vam catalog validate . --strict --json
```

Each of the four directory runs should end with `0 error(s), 0 warning(s)`.

The root runs check the index and every indexed artifact, so they also cover a listing only once it is in `marketplace.json`. Their only finding should be the accepted warning for the Microsoft 365 `calendar_find_slots` tool. Under `--strict`, that warning exits non-zero. This is expected, and CI accepts that one finding.

Exit codes: errors exit 6. Warnings exit 6 only with `--strict`.

**CI.** The workflow builds `vam-cli` from the public `squrell-inc/VAM` over HTTPS, with no secret, at `VAM_COMMIT: main`. So CI tests against the current `main` of the CLI.

Because the root run only checks indexed listings, a listing that is still in review needs a **temporary CI step** that runs `vam catalog validate --strict` on each of its `listings/<id>/*/*` directories. Notion had one until it was indexed at release. The Bun tests stay. They cover the Microsoft 365 skill.

**Passing stage 1:** all six commands pass, and the root run has no finding except the accepted one.

### Stage 2: live server check

Goal: prove that Notion's real server accepts VAM's sign-in, and that the three pinned tool names exist. This is the one thing no file can prove.

Add the server as a test connection on a node, **in the desktop app**: Connections, add a remote MCP server, id `notion-test`, URL `https://mcp.notion.com/mcp`. The app finds Notion's sign-in, registers a client and opens the browser. (`vam mcp connect` cannot do this: it stores a token you already have and does not run the browser sign-in.) Use an id other than `notion`, so it cannot clash with the connector's id (gotcha 12).

Sign in with a Notion account, then check:
- Sign-in finishes, and the connection shows as connected.
- The live tool list includes `notion-search`, `notion-fetch` and `notion-create-pages`.
- The two read tools describe no write action [UNVERIFIED until read].
- Other tools the server returns are expected. The node drops them, because they are not pinned.

Then remove the test connection in the app, or with:

```
vam mcp disconnect notion-test
```

If sign-in fails, stop here. Write down the error. Check gotchas 5 and 20. If a tool name differs from the three pinned names, fix `connector.json` and run stage 1 again.

**Passing stage 2:** sign-in works and the three names exist on the live server.

### Stage 3: full install test

Use a side branch. Do not change `main` yet.

1. On the side branch, add the index entry from section 3, with `"ref": "notion-v0.1.0"` in place of `notion-v1.0.0`.
2. Commit it. A maintainer creates and pushes the tag `notion-v0.1.0` on that commit.
3. On a node, install from that tag:

   ```
   vam catalog import https://github.com/squrell-inc/vam-marketplace --path listings/notion --ref notion-v0.1.0
   ```

4. An admin enables the connector: `vam connectors enable notion`.
5. A member connects in the desktop app.
6. Run the manual checklist in section 11 against this test install.

Tags are never moved. If the side-branch commit changes, push a new test tag, such as `notion-v0.1.1`. Test tags stay on the side branch. Do not reuse them on `main`.

**Passing stage 3:** every item on the manual checklist passes.

### Stage 4: release

Covered in section 9. In short: on `main`, add the index entry with `notion-v1.0.0`, and remove the temporary CI step. A maintainer tags the merge commit and pushes the tag. On the node, import again at `--ref notion-v1.0.0`. This updates the test install to the release.

If the capability summary changed since the test tag, the connector needs Enable again (gotcha 8).

---

## 9. Release

A release is a **per-listing tag** named `<listing id>-v<major>.<minor>.<patch>`. Here that is `notion-v1.0.0`. The tag goes on the commit that holds exactly what the listing should install. The index **at that commit** must name the tag in the listing's `ref`. CI checks this.

Nodes install only at `ref`. A branch is never installed. A moved tag is refused by nodes that already recorded it [code].

**Steps:**
1. Open a pull request with the listing, the temporary CI step removed, and the index entry with `"ref": "notion-v1.0.0"`. The tag does not exist yet. CI shows a notice for that, not an error.
2. CI is green. A `CODEOWNERS` owner reviews. Merge.
3. A maintainer tags the merge commit and pushes the tag:

   ```
   git tag notion-v1.0.0 <merge commit>
   git push origin notion-v1.0.0
   ```

   The tag push runs CI again. This time it fails hard if the tag is missing, or if the tree at the tag does not validate.
4. **Never move or re-push a tag.** To change anything, bump the version: new content, new `ref` (for example `notion-v1.0.1`), merge, tag.

**Versions on later changes** [code]:
- A skill needs a new `version` in `manifest.json` and in the `SKILLS.md` frontmatter.
- An agent, a playbook or the connector gets the next patch automatically when its content changes.

---

## 10. Install and try it on a node

**Prerequisites:** a node (`vamd`) with the desktop app, one admin account and one member account. Each account needs a Notion workspace it can sign in to. For the Squrell marketplace nothing needs adding. For another repo, an admin adds the marketplace first.

| Step | Who | Desktop app | CLI equivalent |
|---|---|---|---|
| 1. Add the marketplace (only for a non-Squrell repo) | Admin | Organization settings, Marketplace, **Add a marketplace**: URL and **Publisher domain**. The domain must match the index, and the node refuses reserved domains | `vam marketplace add <git url> --publisher-domain <domain>` |
| 2. Refresh | Admin | Marketplace, refresh ("Refreshed.") | `vam marketplace refresh <id>`. List with `vam marketplace ls` and `vam marketplace listings <id>` |
| 3. Read the capability summary | Admin | Marketplace, the Notion row, **What it installs and can reach**: the publisher, `discover` sign-in, `mcp.notion.com`, the three tools with their classes, and the skill, playbook and agent | `vam marketplace listings <id>`. Use `--json` for the whole summary |
| 4. Install the listing (a member cannot) | Admin | **Install** on the row | `vam catalog import <marketplace url> --path listings/notion --ref notion-v1.0.0` |
| 5. Enable the connector | Admin | Organization settings, Connectors, the Notion row. The badge follows the marketplace that installed it. Read **Review before you enable**, then **Enable** | `vam connectors list`, then `vam connectors enable notion` |
| 6. Connect | Member | Connections: the Notion tile shows "Ask your admin" until step 5. Then **Connect** opens Notion's sign-in in the browser | The sign-in round trip runs in the desktop app. The CLI has `vam connectors check` and `vam connectors disconnect`. A CLI command for the sign-in itself is [UNVERIFIED] |
| 7. Run the agent | Member | Agents, **Notion assistant**. Send "Find our Q4 planning page". A read runs without asking | `vam run` against the installed agent URN [UNVERIFIED exact flags] |
| 8. Approve a write | Member | Send "Put these notes into Team meetings: ...". The playbook starts, and the gate asks "Create the page ... in Notion?". Choose **approved**. The standard approval card for the create tool then appears. Approve it | `vam approve decide <approval> --decision approved` for the tool call. `--decision submitted --response '{...}'` for the gate |

**Two approvals on purpose.** A create shows the gate, then the tool's own approval card. The gate shows the draft. The card covers the write itself. Product may later drop the tool's `ask` for this tool. That would be a connector change.

**Expected states** [web, UNVERIFIED for exact labels]: the connector is `askAdmin` until enabled, then `connect` after enable, then `connected` after sign-in. An install from a non-Squrell marketplace shows `trust: unverified`, and its origin (marketplace, listing, tag and commit).

---

## 11. Manual checklist

Run once per release, on a node, with two accounts (admin and member). Stage 3 uses this list.

1. The listing row shows the publisher `Notion (hosted MCP server)`, the host `mcp.notion.com`, and three tools: two `read_only`, and one `mutable_external` with `ask`.
2. A member cannot install. The admin can.
3. The connector badge is what the marketplace should give. A member sees "Ask your admin" before Enable.
4. The member connects. The tile reads connected.
5. "Search for X" runs with no prompt. `notion__notion_search` appears in the receipt.
6. A write is refused until approved. Both the gate and the tool's `ask` appear. Deny once. Nothing is created, and the model does not retry.
7. Approve. The page exists in Notion, under the chosen parent.
8. Ask the agent to move a page. No move tool is offered, because move tools are not pinned.
9. On a test patch that changes the capability summary, the update shows "Changes to the connector. It will need Enable again." The connector goes back to not enabled. Members must reconnect. Tools stop until an admin enables again.

---

## 12. Automated tests

The automated end-to-end scenario is deferred. It needs a Notion mock provider in VAM, because the existing Linear mock serves Linear's tool names and proves nothing about Notion's.

---

## 13. Gotchas

1. **Reserved ids.** `microsoft-365`, `linear`, and the id of every built-in connector file are refused for a marketplace connector [code]. If Squrell ships a built-in `notion` connector, this listing's id must change.
2. **Names that pass for Squrell are refused.** `displayName` and `publisher` may not contain "squrell" (letters and digits only, any case). They may not equal a built-in's name either.
3. **No secrets in files.** `clientSecret` must be `none`. Nothing in any file may be a token.
4. **Only three connector shapes work in a marketplace.** Remote MCP with `discover` (this listing). API-key providers are refused today. Existing profiles with a publisher client id are refused today. Trust the code over the design text.
5. **Narrow reach.** The only host the connector can use with a member's token is the MCP server's host, `mcp.notion.com`. There are no `bindings`, so a skill tool cannot call a vendor REST API. Whether Notion's authorization server sits on another host is an open check for stage 2 [UNVERIFIED].
6. **Tags, not commit ids.** `ref` must be a tag. A 40-character commit id is refused. The node pins the commit the tag points to, and refuses a moved tag.
7. **Installs are read-only and own their URNs.** An organization cannot edit installed artifacts. To change one, it forks into its own namespace. A URN that already exists in the organization's catalog, or belongs to another listing, blocks the install.
8. **Updates that change capabilities need Enable again.** The capability summary covers the publisher, profile, client id, scopes, MCP URL, hosts, and each tool with its class and default. It ignores `displayName` and `description`. A changed summary sets the connector back to **not enabled**, and marks members' connections as needing reauth. Adding a tool, even a read, triggers this. Reword freely. Widen rarely.
9. **A skill content change needs a version bump** in both `manifest.json` and the `SKILLS.md` frontmatter. Otherwise the update fails on the digest.
10. **References stay inside the listing.** Agent and playbook references to anything the listing does not ship are refused. Playbooks and agents are pinned to the listing's versions at install. Do not put digests in the files.
11. **Two spellings of a tool name.** See section 5. A wrong permission target is a silent deny.
12. **The connection id is the connector id.** A member who already added an MCP server by hand with id `notion` and a different URL blocks the connector from connecting. A connection with the connector's id and URL belongs to the connector. Two installed connectors cannot share an id, even from different marketplaces. For hand-made tests, use `notion-test`.
13. **Guest tool names have a length limit and are never truncated.** Two vendor names that collapse to one guest name fail the session. Notion's names are short. Re-check if you pin more.
14. **Unverified marketplaces cannot publish under reserved domains.** The URN domain must equal `publisherDomain`.
15. **A listing that names a connector must ship it**, unless it comes from the preconfigured Squrell marketplace.
16. **Connector `ui` is rejected.** MCP cards are not possible (section 4).
17. **The agent must declare `permissions`.** Legacy policy fields, `extends` and evaluators cannot ship.
18. **Playbook `activation.when` is required** to pass the release rules. It is capped at 280 characters.
19. **CI builds the CLI from `main`.** A pass in CI therefore tests against the current CLI. A node may run an older one. `requiresNode` is checked at install. Check it against the node's version.
20. **Vendor side.** Notion's enterprise plan can allowlist MCP clients. On such a workspace, VAM's registered client must be allowed, or sign-in fails [web, UNVERIFIED for how VAM's client name appears].
21. **Prompt injection.** Notion page text is untrusted input to the model. The skill says so. The real controls are the `ask` on writes and the gate.
22. **Write behaviour.** How the create tool handles the parent and body is described differently by third-party guides. Test it by creating a page under a scratch parent [UNVERIFIED].
23. **Search depends on the member's Notion plan.** Without a Notion AI plan, `notion-search` covers only the Notion workspace; connected sources (Slack, Google Drive, Jira) need the plan [web]. The playbook only searches for a parent page, so it works on any plan.
