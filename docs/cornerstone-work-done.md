# Cornerstone work done

Summary of what was actually built and changed for Cornerstone OnDemand in this workspace.

## Repos touched

| Repo | Role |
|---|---|
| `vam-marketplace` | Listing: skills, agent, playbook, docs, tests |
| `VAM` | Built-in connector descriptor |

---

## 1. Built-in connector (VAM) — what the UI Enable form uses

**File:** `VAM/spec/connectors/cornerstone.json`  
**Version:** `0.1.2`  
**URN:** `urn:vam:connector:hub.squrell.cloud/squrell/cornerstone`

Aligned with VAM’s real schema (same idea as Box admin-supplied client + M365 REST bindings):

| Field | Value | Effect in Squrell-App |
|---|---|---|
| `provider.client` | `"org"` | Admin enters **Client ID** at Enable |
| `provider.clientSecret` | `"org_vault"` | Admin enters **Client secret** at Enable (vaulted) |
| `provider.profile` | `"discover"` | Profile VAM accepts today |
| `provider.scopes` | 11 CSOD scopes (≤ 20) | Default scope list on the connector |
| `connection.holder` | `"user"` | Required by VAM v1 |
| `bindings` | `csod` → `vamsec_csod` → `example.csod.com` | Skills use this placeholder over egress |

**Not in the schema yet (so no UI field):** portal base URL / `{corp}.csod.com` (VAM Phase 6 company address).  
**Not implemented yet:** full CSOD `client_credentials` token exchange on the node.

**Removed earlier draft:** custom `config.fields` (baseUrl, clientId, …) — VAM frontend does **not** render that.

---

## 2. Marketplace listing (skills only — M365 pattern)

**Index:** `marketplace.json`  
**Listing id:** `cornerstone`  
**Ref (version tag name):** `cornerstone-v0.1.2`

### Artifacts shipped

| Kind | Path |
|---|---|
| Skill | `listings/cornerstone/skills/csod-learning` (25 tools, v1.0.1) |
| Skill | `listings/cornerstone/skills/csod-core-hr` (16 tools, v1.0.1) |
| Skill | `listings/cornerstone/skills/csod-performance` (5 tools, v1.0.1) |
| Skill | `listings/cornerstone/skills/csod-recruiting` (8 tools, v1.0.1) |
| Playbook | `listings/cornerstone/playbooks/assign-training` |
| Agent | `listings/cornerstone/agents/cornerstone-assistant` |

**No marketplace `connector.json`** — connector is built into VAM (like Microsoft 365).

### Auth model documented on skills / agent

- Members must be signed into VAM (**Log In** or **SSO Login**).
- They never enter CSOD client id/secret.
- Writes use member approval (`ask`).
- Tools call egress with `Authorization: vamsec_csod`.

---

## 3. Docs added / updated

| Doc | Purpose |
|---|---|
| `docs/cornerstone-api-catalog.md` | API → tool matrix |
| `docs/cornerstone-connector-contract.md` | URN, Enable fields, runtime placeholder |
| `docs/cornerstone-connector-plan.md` | Platform plan / remaining work |
| `docs/cornerstone-member-auth-plan.md` | Member VAM login vs admin CSOD secrets |
| `docs/cornerstone-work-done.md` | This summary |
| `README.md` | Listing row updated |

---

## 4. Tests

| Test | What it checks |
|---|---|
| `tests/cornerstone-connector/connector.test.ts` | Built-in shape: `client: org`, `org_vault`, `csod` / `vamsec_csod`; no marketplace connector file |
| `tests/csod-learning/tools.test.ts` | Skill tools hit mock egress with placeholder auth |

Local result when last run: **10 pass**.

Live CSOD smoke (manual, credentials not stored in repo): token OK; `employee:read` and `globalsearch:read` returned 200 against `vithiit.csod.com`.

---

## 5. Versions at a glance

| Item | Version |
|---|---|
| Built-in connector | `0.1.2` |
| Skills | `1.0.1` |
| Marketplace listing `ref` | `cornerstone-v0.1.2` |

Note: nodes install only after git tag `cornerstone-v0.1.2` exists on the marketplace repo.

---

## 6. Still not done (platform)

1. Wire Enable → CSOD `POST …/oauth2/token` with `grantType=client_credentials`.
2. Corp host / company address so binding is real `{corp}.csod.com`, not only `example.csod.com`.
3. Egress swap `vamsec_csod` → Bearer access token end-to-end in a running node.
4. Create/push marketplace tag `cornerstone-v0.1.2` and ship VAM with the new built-in file.

---

## 7. How admin + member use it (intended)

1. Admin signs into VAM → Org → Connectors → **Cornerstone** → **Enable** → enters **Client ID** + **Client secret**.
2. Admin enables/installs marketplace listing `cornerstone` at ref `cornerstone-v0.1.2`.
3. Member signs into VAM (Log In or SSO) → opens **Cornerstone assistant** → uses tools; writes ask for approval.
