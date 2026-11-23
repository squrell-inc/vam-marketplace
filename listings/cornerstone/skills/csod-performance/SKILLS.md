---
id: "urn:vam:skill:hub.squrell.cloud/squrell/csod-performance"
name: "csod-performance"
version: "1.0.3"
description: "Read performance reviews and manage goals in Cornerstone; member must be signed into VAM; writes ask first"
---

# csod-performance

Work with Cornerstone Performance through the **org** Cornerstone connection.

**Auth:** Member must be signed into VAM (Log In or SSO). Tools use the org Cornerstone token; never Cornerstone passwords. Portal host comes from Enable (`.vam/connector.json` → `hosts.csod`), never hardcoded.

## When to use each tool

- **review_get** reads performance review details.
- **goal_get** reads a goal; **goal_create**, **goal_update**, **goal_update_progress** change goals (approval required).

## Rules

- Never write without the approval card.
- Read a goal before updating it when you have an id.
