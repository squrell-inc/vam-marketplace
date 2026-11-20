---
id: "urn:vam:skill:hub.squrell.cloud/squrell/zendesk-tickets"
name: "zendesk-tickets"
version: "1.0.0"
description: "Search and read the company's Zendesk tickets as the member; create a ticket only with their approval"
---

# zendesk-tickets

Work with the company's Zendesk tickets through the member's own Zendesk connection. Every call is
made as the member with their access token; you never see or handle a token. The company's host
(`<subdomain>.zendesk.com`) is in `.vam/connector.json` next to this file (`hosts.api`).

## When to use each tool

- **ticket_search** finds tickets. `query` uses Zendesk's search syntax (`status:open printer`,
  `requester:ana@acme.example`); results are limited to tickets unless you write `type:`. It
  returns id, subject, status, priority, update time and a short description. The result shows as a list.
- **ticket_show** reads one ticket by the numeric `id` ticket_search returned. Read it before you answer from it.
- **ticket_create** creates a ticket from `subject` and `body` (the first comment), optionally
  `priority` (`urgent`, `high`, `normal`, `low`). It asks the member first. Never create a ticket
  without that approval, and do not repeat one the member denied.

## Rules

- This version reads and creates tickets only. It cannot update, comment on or delete one.
- The member sees what their own Zendesk role allows. A 403 means they lack access: report it.
- Make calls one at a time. On a 429, wait and try once more.
- A result you were not shown (an error) is the truth: report it, do not guess what Zendesk holds.
