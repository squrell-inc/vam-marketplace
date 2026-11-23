---
id: "urn:vam:skill:hub.squrell.cloud/squrell/csod-recruiting"
name: "csod-recruiting"
version: "1.0.3"
description: "Read requisitions and applicants and update applicant status in Cornerstone Recruiting; member must be signed into VAM; writes ask first"
---

# csod-recruiting

Work with Cornerstone Recruiting through the **org** Cornerstone connection.

**Auth:** Member must be signed into VAM (Log In or SSO). Tools use the org Cornerstone token via `vamsec_cornerstone_csod`; never ask for Cornerstone credentials. Portal host comes from Enable (`.vam/connector.json` → `hosts.csod`), never hardcoded.

## When to use each tool

- **requisition_get** / **requisition_ad** / **requisition_custom_fields** read requisitions.
- **application_workflow_get** reads workflow for a requisition externalId.
- **applicant_search** requires CurrentStatus; **applicant_custom_fields** for custom data.
- **applicant_update_status** and **job_application_submit** change recruiting state (approval required).

## Rules

- Never write without the approval card.
- Always pass CurrentStatus when searching applicants.
