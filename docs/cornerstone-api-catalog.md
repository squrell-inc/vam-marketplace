# Cornerstone OnDemand — API → VAM skill tool matrix

Source: [CSOD scopes and permissions](https://csod.dev/guides/supplements/scopes-security-permissions.html) and suite guides on [csod.dev](https://csod.dev/).

Skills live under `listings/cornerstone/skills/`. All require connector `urn:vam:connector:hub.squrell.cloud/squrell/cornerstone`.

## csod-learning

| Tool | Method | Path | Scope (typical) | Side effect |
|---|---|---|---|---|
| catalog_search | GET | `/services/api/Catalog/GlobalSearch` | training:read | read |
| lo_get_details | GET | `/services/api/LO/GetDetails` | training:read | read |
| lo_create | POST | `/services/api/LO/Create` | training:create | ask |
| lo_update | POST | `/services/api/LO/Update` | training:updatefull | ask |
| transcript_search | GET | `/services/api/LOTranscript/TranscriptSearch` | transcript:read | read |
| transcript_overview | GET | `/services/api/v1/transcripts/overview` | transcript:read | read |
| transcript_details | GET | `/services/api/v1/transcripts/details` | transcript:read | read |
| transcript_assign | POST | `/services/api/v1/transcripts/assign` | transcript:create | ask |
| transcript_request | POST | `/services/api/v1/transcripts/request` | transcript:create | ask |
| user_inbox | GET | `/services/api/TranscriptAndTask/Inbox` | inbox:read | read |
| user_assigned | GET | `/services/api/TranscriptAndTask/Assigned` | transcript:read | read |
| user_sessions | GET | `/services/api/TranscriptAndTask/Session` | transcript:read | read |
| user_transcript | GET | `/services/api/TranscriptAndTask/Transcript` | transcript:read | read |
| suggested_training | GET | `/services/api/TranscriptAndTask/SuggestedTraining` | transcript:read | read |
| pending_approvals | GET | `/services/api/TranscriptAndTask/Approval` | approval:read | read |
| user_tasks | GET | `/services/api/TranscriptAndTask/Task` | task:read | read |
| assignment_search | GET | `/services/x/lms-learning-assignment/v1/learning-assignment/search` | learningassignment:read | read |
| assignment_get | GET | `/services/x/lms-learning-assignment/v1/learning-assignment/{id}` | learningassignment:read | read |
| assignment_create | POST | `/services/x/lms-learning-assignment/v1/learning-assignment/standard` | learningassignment:create | ask |
| roster_get | GET | `/services/api/SessionRoster/GetSessionRoster` | sessionroster:read | read |
| roster_update | POST | `/services/api/SessionRoster/` | sessionroster:create | ask |
| cert_get | GET | `/services/api/CertificationDetails/GetCertificationDetails` | certification:read | read |
| cert_transcript | GET | `/services/api/CertificationTranscript/CertificationTranscriptDetails` | certification:read | read |
| cert_remove | POST | `/services/api/Certification/Remove` | certification:delete | ask |
| express_class_create | POST | `/services/x/lms-express-class/v1/ExpressClass` | expressclass:create | ask |

## csod-core-hr

| Tool | Method | Path | Scope | Side effect |
|---|---|---|---|---|
| employee_search | GET | `/services/api/x/users/v2/employees` | employee:read | read |
| employee_get | GET | `/services/api/x/users/v2/employees/{id}` | employee:read | read |
| employee_create | POST | `/services/api/x/users/v2/employees` | employee:create | ask |
| employee_update | PATCH | `/services/api/x/users/v2/employees/{id}` | employee:updatepartial | ask |
| ou_types | GET | `/services/api/x/organizations/v1/types` | outype:read | read |
| ou_list | GET | `/services/api/x/organizations/v1/ous` | ou:read | read |
| ou_get | GET | `/services/api/x/organizations/v1/ous/{id}` | ou:read | read |
| ou_create | POST | `/services/api/x/organizations/v1/ous` | ou:write | ask |
| ou_update | PUT | `/services/api/x/organizations/v1/ous/{id}` | ou:updatefull | ask |
| global_search | GET | `/services/api/Core/GlobalSearch` | globalsearch:read | read |
| approvals_list | GET | `/services/api/Employee/{userName}/approvals` | approval:read | read |
| approvals_decide | POST | `/services/api/Employee/{userName}/approvals` | approval:create | ask |
| job_list | GET | `/services/api/x/chr-jobmgmt-app/v1/jobs` | job:read | read |
| job_get | GET | `/services/api/x/chr-jobmgmt-app/v1/jobs/{jobId}` | job:read | read |
| job_create | POST | `/services/api/x/chr-jobmgmt-app/v1/jobs` | job:create | ask |
| job_update | PATCH | `/services/api/x/chr-jobmgmt-app/v1/jobs/{jobId}` | job:update | ask |

## csod-performance

| Tool | Method | Path | Scope | Side effect |
|---|---|---|---|---|
| review_get | GET | `/services/api/Review/PerformanceReview` | performancereview:read | read |
| goal_get | GET | `/services/api/Goals/GetDetails` | goal:read | read |
| goal_create | POST | `/services/api/Goals/Create` | goal:create | ask |
| goal_update | PUT | `/services/api/Goals/Update` | goal:updatefull | ask |
| goal_update_progress | PUT | `/services/api/Goals/UpdateProgress` | goalprogress:updatefull | ask |

## csod-recruiting

| Tool | Method | Path | Scope | Side effect |
|---|---|---|---|---|
| requisition_get | GET | `/services/api/Recruiting/JobRequisitionDetails` | jobrequisition:read | read |
| requisition_ad | GET | `/services/api/Recruiting/JobRequisitionDetails/Ad` | jobrequisition:read | read |
| requisition_custom_fields | GET | `/services/api/Recruiting/JobRequisitionDetails/CustomField` | jobrequisition:read | read |
| application_workflow_get | GET | `/services/api/x/rec-job-requisition/v1/requisition/{externalId}/application-workflow` | applicationworkflow:read | read |
| applicant_search | GET | `/services/api/Recruiting/JobApplicant` | jobapplicant:read | read |
| applicant_custom_fields | GET | `/services/api/Recruiting/JobApplicant/CustomFields` | jobapplicant:read | read |
| applicant_update_status | GET | `/services/api/Recruiting/JobApplicantUpdateStatus` | jobapplicant:update | ask |
| job_application_submit | GET | `/services/api/x/external-application/v1/job-application/submit` | jobapplication:create | ask |

## Deferred (not skills)

Bulk API, Reporting API, Data Exporter, Webhooks, SOAP User/OU, vendor Edge connectors.
