---
id: "urn:vam:skill:hub.squrell.cloud/squrell/csod-core-hr"
name: "csod-core-hr"
version: "1.0.1"
description: "Read and update Cornerstone employees, OUs, approvals and jobs; member must be signed into VAM; writes ask first"
---

# csod-core-hr

Work with Cornerstone Core/HR through the **org** Cornerstone connection.

**Auth:** Member must be signed into VAM (Log In or SSO). No Cornerstone secrets in tools; host uses org token via `vamsec_csod`.

## When to use each tool

- **employee_search** / **employee_get** read employees (v2).
- **employee_create** / **employee_update** change employees (approval required).
- **ou_types** / **ou_list** / **ou_get** read org units; **ou_create** / **ou_update** write (ask).
- **global_search** searches people, training, certifications.
- **approvals_list** / **approvals_decide** Universal Profile approvals (decide asks first).
- **job_list** / **job_get** / **job_create** / **job_update** job management (writes ask).

## Rules

- Never write without approval. Do not retry a denied write.
- Prefer Employee v2 over legacy endpoints.
- Report empty or permission errors honestly.
