# Reference listing: monday.com (hosted MCP server with JIG UI Cards)

**Status: ready for testing and release as `monday-v1.0.0`.**

This listing installs the connector for monday.com's hosted Model Context Protocol (MCP) server, the `monday-workspace` skill with declarative **JIG UI cards** (`vam/1` catalog), the **Monday Agent** persona, and the `create-task` playbook.

---

## 1. The JIG Concept in VAM/Squrell

According to the VAM design specification (`design/jig.md`, `crates/vam-spec/src/jig.rs`, and `crates/vam-orchestrator/src/skill_cards.rs`):

* **What a JIG is:** A JIG is a declarative, sandboxed UI protocol built strictly from a closed catalog of primitives (`vam/1`: `Stack`, `Text`, `List`, `Badge`, `KeyValue`, `Input`, `TextArea`, `Button`, etc.). Agents and models never output raw HTML or unsafe scripts; they supply typed data to declarative JSON card templates.
* **The Two Card Modalities:**
  1. **Show Cards (`ui.show`)**: Rendered non-blockingly directly in chat when a query or list tool returns structured data. Data is bound using JSON pointers (`"$data": "/<field>"`, `"$item": "/<field>"`).
  2. **Ask Cards (`ui.ask`)**: Rendered when a mutation or write tool triggers human-in-the-loop (HITL) approval (`approvalRequired: true`). The card presents editable form inputs pre-filled with the agent's proposed arguments and provides **Approve** and **Deny** buttons (`action: { "event": "submit", "with": [...], "set": { "decision": "approve" } }`).

---

## 2. Tools and Implemented JIG Cards

The `monday-workspace` skill implements JIG cards for all tools where visual representation or human approval applies:

| Tool Name | Tool Type | JIG Mode | Card File | UI Component Structure |
|---|---|---|---|---|
| `workspaces_list` | Read | `ui.show` | [`jigs/workspace_list.json`](../listings/monday/skills/monday-workspace/jigs/workspace_list.json) | `List` bound to `/workspaces` showing workspace name and privacy kind |
| `boards_list` | Read | `ui.show` | [`jigs/board_list.json`](../listings/monday/skills/monday-workspace/jigs/board_list.json) | `List` bound to `/boards` displaying board name and active/archived state |
| `board_items_get` | Read | `ui.show` | [`jigs/item_list.json`](../listings/monday/skills/monday-workspace/jigs/item_list.json) | `List` bound to `/items` displaying item title and status badge |
| `updates_get` | Read | `ui.show` | [`jigs/update_list.json`](../listings/monday/skills/monday-workspace/jigs/update_list.json) | `List` bound to `/updates` showing comment author and clean body text |
| `board_insights` | Read | `ui.show` | [`jigs/insights_view.json`](../listings/monday/skills/monday-workspace/jigs/insights_view.json) | `List` bound to `/insights` showing metrics (total, active, archived) |
| `item_create` | Write | `ui.ask` | [`jigs/item_approval.json`](../listings/monday/skills/monday-workspace/jigs/item_approval.json) | `Stack` with `Input` fields for `itemName`, `boardId`, `groupId`, and **Create item** / **Deny** buttons |
| `item_change_column_values` | Write | `ui.ask` | [`jigs/column_approval.json`](../listings/monday/skills/monday-workspace/jigs/column_approval.json) | `Stack` with `Input` for `itemId`, `boardId`, `TextArea` for `columnValues`, and **Update columns** / **Deny** buttons |
| `update_create` | Write | `ui.ask` | [`jigs/update_approval.json`](../listings/monday/skills/monday-workspace/jigs/update_approval.json) | `Stack` with `Input` for `itemId`, `TextArea` for `body`, and **Post update** / **Deny** buttons |
| `board_create` | Write | `ui.ask` | [`jigs/board_approval.json`](../listings/monday/skills/monday-workspace/jigs/board_approval.json) | `Stack` with `Input` fields for `boardName`, `workspaceId`, `boardKind`, and **Create board** / **Deny** buttons |

---

## 3. Monday Agent

The agent is named **Monday Agent** ([`listings/monday/agents/monday-assistant/agent.json`](../listings/monday/agents/monday-assistant/agent.json)):
* **Role**: Monday Agent
* **System Persona**: Guides users through monday.com Work OS workspaces, boards, items, and columns. Automatically displays rich JIG cards for queries and pauses execution with JIG approval cards for every create or update action.
* **Permissions**:
  * Read tools (`skill:monday-workspace/*`, `mcp:mcp.monday.com/mcp/*` reads): `"decision": "allow"`.
  * Write tools (`skill:monday-workspace/*`, `mcp:mcp.monday.com/mcp/*` mutations): `"decision": "ask"` (guarded by JIG approval cards).

---

## 4. Authentication & VAM Backend Phases (5, 6, 7)

* **Default (Zero-Config OAuth 2.0 Discovery)**: Uses `profile: "discover"` targeting `https://mcp.monday.com/mcp`. Conforms to RFC 9728 and Dynamic Client Registration (DCR) with PKCE. Members connect directly with their monday.com credentials.
* **Phase 5 (Admin-Supplied Client & Org Vault)**: Can be configured with `"client": "org"` and `"clientSecret": "org_vault"` if an enterprise admin registers an OAuth client in monday.com and provides client credentials at Enable time.
* **Phase 7 (API Token)**: Supports `"kind": "api_key"` with personal API token fields (`provider.fields`) for tenants disabling OAuth.

---

## 5. Files in this Listing

```
listings/monday/
├── connectors/monday/connector.json            # VAM connector definition
├── skills/monday-workspace/
│   ├── manifest.json                           # Manifest with tool specs and JIG bindings
│   ├── SKILLS.md                               # Prompt guidelines and JIG usage
│   ├── lib/monday.ts                           # In-guest runner & proxy helpers
│   ├── workspaces_list.ts                      # Tool implementation
│   ├── boards_list.ts                          # Tool implementation
│   ├── board_items_get.ts                      # Tool implementation
│   ├── updates_get.ts                          # Tool implementation
│   ├── board_insights.ts                       # Tool implementation
│   ├── item_create.ts                          # Tool implementation
│   ├── item_change_column_values.ts            # Tool implementation
│   ├── update_create.ts                        # Tool implementation
│   ├── board_create.ts                         # Tool implementation
│   └── jigs/                                   # Declarative JIG cards (vam/1 catalog)
│       ├── item_list.json                      # Show card: item list
│       ├── workspace_list.json                 # Show card: workspace list
│       ├── board_list.json                     # Show card: board list
│       ├── update_list.json                    # Show card: updates/comments list
│       ├── insights_view.json                  # Show card: board insights
│       ├── item_approval.json                  # Ask card: create item approval
│       ├── column_approval.json                # Ask card: column modification approval
│       ├── update_approval.json                # Ask card: post update approval
│       └── board_approval.json                 # Ask card: create board approval
├── playbooks/create-task/playbook.json         # Guided task creation playbook
└── agents/monday-assistant/agent.json          # Monday Agent persona & permissions
```
