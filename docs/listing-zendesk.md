# Zendesk listing

**Status: built on the branch `zendesk-connector`, not released, do not tag from this branch.** It
needs VAM connectors Phase 6 (company address, `profile: oauth`, REST bindings). The tag
`zendesk-v1.0.0-rc.1` does not exist yet.

The listing installs: the Zendesk connector (`listings/zendesk/connectors/zendesk`), the
`zendesk-tickets` skill (search tickets, show a ticket, create a ticket) and the Zendesk assistant
agent. The member's connection is theirs; the skill never holds a token. Tickets are created only
after the member approves. This version cannot update, comment on or delete a ticket: that waits for
one `{id}` segment in exact egress paths (workstream Phase 6, open question 8).

## What the skill may reach

Host `{subdomain}.zendesk.com` (filled by the node at Enable), bearer token of the member:

| Tool | Method and path | Shape | Effect |
|---|---|---|---|
| `ticket_search` | `GET /api/v2/search.json` | prefix | read only |
| `ticket_show` | `GET /api/v2/tickets/{id}.json` | prefix `/api/v2/tickets/` | read only |
| `ticket_create` | `POST /api/v2/tickets.json` | exact path | mutable external, approval required |

The connector asks for the scopes `read` and `tickets:write` (see the facts below: unconfirmed).

## For the Zendesk admin: create the OAuth client

1. In Zendesk, open Admin Center, then Apps and integrations, APIs, OAuth clients (Zendesk may also
   label it "Zendesk API"), and choose Add OAuth client.
2. Name it (for example "Squrell VAM"), and give a unique identifier (it becomes the client id).
3. Client kind: choose the **public** (non-confidential) kind, the one that is used with PKCE and has
   no secret. A confidential client has a secret, which this connector never holds.
4. Redirect URL: `squrell://oauth`.
5. Save. Copy the client id (the "unique identifier"). If Zendesk shows a secret, do not use it.
6. If the client lists allowed scopes, allow `read` and `tickets:write`.

### Enable, connect, use

1. VAM, Org settings, Marketplace: enable the Zendesk listing (an org admin).
2. Org settings, Connectors, Zendesk: enter the **Zendesk subdomain** (`acme` for
   `acme.zendesk.com`; one word, no dots) and the **client id**, then Enable. The card shows the hosts
   Squrell will reach.
3. A member opens Connectors, Zendesk, Connect, and signs in to Zendesk in the browser.
4. The member asks the Zendesk assistant a question about a ticket. Creating a ticket asks first.

## Zendesk facts, with sources

I could not read developer.zendesk.com or support.zendesk.com from the session that built this
(the hosts were blocked), so nothing below was read on the primary page. Search snippets from
Zendesk's own pages are listed where they support a fact. **Everything is "to verify by the team
before the tag."**

| Fact | State | Source |
|---|---|---|
| Public clients use PKCE and have no client secret | Search snippet agrees; page not read. To verify by the team before the tag, including the exact Admin Center label and the S256 method | https://support.zendesk.com/hc/en-us/articles/4408845965210-Using-OAuth-authentication-with-your-application, https://developer.zendesk.com/documentation/authentication/oauth-migration/ |
| Refresh returns a new access token and a new refresh token, and the old pair stops working (rotation) | Search snippet agrees. To verify by the team before the tag | https://developer.zendesk.com/api-reference/ticketing/oauth/grant_type_tokens/ |
| Refresh tokens expire (`refresh_token_expires_in`); lifetimes of access and refresh tokens | Not confirmed (a third party said 7 to 90 days: not primary). To verify by the team before the tag | https://developer.zendesk.com/documentation/authentication/creating-and-using-oauth-tokens-with-the-api/ |
| Older clients without `expires_in` get non-expiring access tokens and no refresh | Snippet only. To verify; a client must be one that issues refresh tokens or the refresh check fails | same page |
| Authorize `https://{subdomain}.zendesk.com/oauth/authorizations/new`, token `https://{subdomain}.zendesk.com/oauth/tokens` | From the workstream plan, not re-read. To verify | https://developer.zendesk.com/api-reference/ticketing/oauth/grant_type_tokens/ |
| Scope names `read` and `tickets:write`; that `read` allows `GET /api/v2/search.json` and `GET /api/v2/tickets/{id}.json`; that `tickets:write` allows `POST /api/v2/tickets.json`; whether `tickets:read` alone would do for search | Not confirmed. If wrong, change `scopes` in `connector.json` (a change resets Enable on nodes) before the tag | https://developer.zendesk.com/api-reference/ticketing/introduction/ |
| `GET /api/v2/search.json?query=...` returns `results` and `count`; `GET /api/v2/tickets/{id}.json` returns `ticket`; `POST /api/v2/tickets.json` takes `{"ticket":{"subject","comment":{"body"},"priority"}}` and returns `ticket` | Not confirmed; the tool code and tests assume these. To verify | https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/, https://developer.zendesk.com/api-reference/ticketing/tickets/tickets/ |
| Redirect `squrell://oauth` accepted by a Zendesk OAuth client (custom scheme) | Not confirmed. To verify | https://support.zendesk.com/hc/en-us/articles/4408845965210 |
| No RFC 7009 revoke: disconnect deletes the node's rows and the grant expires at Zendesk | From the workstream plan (open question 10). To verify | https://developer.zendesk.com/api-reference/ticketing/oauth/oauth_tokens/ |

Other choices made here: `connection.label` is `none` (the tile says "Connected"; workstream open
question 9); `publisher` is `Zendesk (company REST API)` because the node refuses a marketplace
connector whose publisher passes for Squrell; the search tool prefixes `type:ticket` unless the
query names a `type:`.

## For the team: release

1. `requiresNode` in `marketplace.json` is `>=0.3.0`, a placeholder: set it to the first node
   version that ships Phase 6 (the workspace is at 0.1.0 and Box named `>=0.2.0` for Phase 5, so
   0.3.0 is a guess, to confirm).
2. After the VAM Phase 6 release, the owner pushes the tag `zendesk-v1.0.0-rc.1` on the head of
   `zendesk-connector`. The index at that commit already names it as `ref`.
3. Staging import: start the staging node with
   `VAMD_SQURELL_MARKETPLACE_INDEX_REF=zendesk-connector` so it reads the index from this branch, and
   enable the listing.
4. CI pins `vam` at `c09c9d74e056` (VAM `feat/connectors`, all of Phase 6). After the Phase 6 merge
   on VAM `main`, move `VAM_COMMIT` in `.github/workflows/validate.yml` to that merge.
5. For the final release: set `ref` to `zendesk-v1.0.0`, merge into `main`, and use the release workflow.

## Real-instance checklist

Use a Zendesk test instance (examples use `acme`). Tick each, with the date and who.

- [ ] Clear every "to verify" fact above; fix `connector.json` if a scope or endpoint differs.
- [ ] Enable: the org admin enters the subdomain and client id. Note the time it started.
- [ ] A member connects and reaches Connected. **Record the minutes from Enable to Connected (the P6 number):** ____
- [ ] The assistant answers from a real ticket (search, then show).
- [ ] Creating a ticket asks first; after approval the ticket exists in Zendesk; a denial creates nothing.
- [ ] Refresh after expiry: wait past the access token's lifetime, ask again, it works with no new sign-in; a second refresh also works (rotation).
- [ ] Another subdomain is refused: the tool cannot reach a host other than `acme.zendesk.com`.
- [ ] Disconnect and reconnect work; no token appears in any listing, event or receipt.
