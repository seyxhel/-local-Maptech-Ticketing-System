# Ticket Lifecycle Workflow Manual

## Purpose
This manual explains the complete ticket lifecycle from creation to closure in a clear step-by-step format, including the supervisor intake process (client availability checking, client calls, assignment, and reassignment).

## How to Read This Manual
- `Visual Flow`: Quick path using arrow icons.
- `Screens and Explanation`: Image first, then direct explanation under the image.
- `Detailed Steps`: Line-by-line actions users must follow.

## Arrow Legend
- `->` next action
- `=>` decision branch
- `[Yes]` positive decision output
- `[No]` negative decision output

## Roles in This Workflow
- Sales: intake and verification for sales-created tickets
- Supervisor: intake verification, call handling, assignment/reassignment, routing, closure validation
- Technical Staff: diagnosis, execution, update, and proof submission

## Stage 0: Intake Readiness
Prepare the required information before ticket creation:
1. Client identity and contact details
2. Product/equipment details (existing or new)
3. Service type and support preference
4. Initial problem statement

Visual Flow:
`Prepare client details -> Prepare product details -> Prepare service details -> Ready for ticket creation`

## Stage 1: Ticket Creation (Sales or Supervisor)

Visual Flow:
`Open Create Ticket -> Select Client Type -> Select Product Type -> Add Service + Problem -> Review -> Submit -> STF Generated (Open)`

### Screens and Explanation
![Sales New Client Intake](Sales%20Side/Sales%20Create%20ticket%20new%20client.png)
Explanation: Use this screen when encoding a first-time client profile.

![Sales Existing Client Intake](Sales%20Side/Sales%20Create%20Ticket%20existing%20client.png)
Explanation: Use this when the client already exists in the system and only ticket details are needed.

![Sales Existing Client Selector](Sales%20Side/Sales%20create%20ticket%20exist%20client%20modal.png)
Explanation: Search and select the correct existing client record to avoid duplicate profiles.

![Sales Existing Product Intake](Sales%20Side/Sales%20create%20ticket%20existing%20product.png)
Explanation: Choose this if the product/equipment already exists in the catalog.

![Sales Existing Product Selector](Sales%20Side/Sales%20create%20ticket%20exist%20product%20modal.png)
Explanation: Select the exact product model or registered item linked to the client concern.

![Sales Additional Product Details](Sales%20Side/Sales%20create%20ticket%20addtional%20product%20details.png)
Explanation: Complete serial/reference and any extra technical fields to improve troubleshooting speed.

![Sales Service Type](Sales%20Side/Sales%20create%20ticket%20types%20of%20services.png)
Explanation: Pick the service category and support preference that match the issue type.

![Sales Review Submit](Sales%20Side/Sales%20create%20ticket%20review%20submit.png)
Explanation: Final review screen before creating the ticket and generating STF number.

![Supervisor Create Ticket Existing Client](Supervisor%20Side/Supervisor%20Create%20Ticket%20existing%20client.png)
Explanation: Supervisor uses this when creating a ticket for an existing client and validating details quickly.

![Supervisor Create Ticket New Client](Supervisor%20Side/Supervisor%20Create%20ticket%20new%20client.png)
Explanation: Supervisor uses this for new client onboarding during urgent or direct intake scenarios.

![Supervisor Existing Client Modal](Supervisor%20Side/Supervisor%20create%20ticket%20exist%20client%20modal.png)
Explanation: Supervisor client lookup modal for selecting verified client records.

![Supervisor Existing Product Modal](Supervisor%20Side/Supervisor%20create%20ticket%20exist%20product%20modal.png)
Explanation: Supervisor product lookup modal for selecting existing equipment/product details.

![Supervisor Review Submit](Supervisor%20Side/Supervisor%20create%20ticket%20review%20submit.png)
Explanation: Supervisor final confirmation screen before submitting a newly encoded ticket.

### Detailed Steps
1. Open `Create Ticket` and select `New Client` or `Existing Client`.
2. If `Existing Client`, search and select the client from the modal.
3. Enter or validate contact and organization details.
4. Select `New Product` or `Existing Product`.
5. If `Existing Product`, select the product from the modal.
6. Fill additional product/reference fields.
7. Select service type and support preference.
8. Enter complete problem description.
9. Review all details and submit.
10. System generates STF number and ticket status becomes `Open`.

## Stage 2: Supervisor Progress During Ticket Creation (Client Availability and Calls)

Visual Flow:
`Ticket Created (Open) -> Open STF Details -> Check Client Availability => [Yes] Select Contact to Call -> Call and Confirm -> Set Priority -> Continue to Assign`

Decision Branch:
`Check Client Availability => [No] Log Failed Contact -> Set Callback Follow-up -> Retry Call -> Confirm -> Continue to Assign`

### Screens and Explanation
![Supervisor STF Details and Client Availability](Supervisor%20Side/Supervisor%20options%20Client%20availability.png)
Explanation: Supervisor opens the STF details modal, reviews ticket/client context, and sets client availability using the availability options.

![Supervisor Call Handling](Supervisor%20Side/Supervisor%20calls.png)
Explanation: Supervisor selects who to call, performs call validation, reviews call log preview, and records call completion status.

![Supervisor Continue to Assign](Supervisor%20Side/Supervisor%20continue%20assign.png)
Explanation: After availability and call validation, supervisor confirms priority and proceeds using Continue to Assign.

![Supervisor Call Logs](Supervisor%20Side/Supervisor%20Call%20logs.png)
Explanation: Supervisor records successful and unsuccessful call attempts, including follow-up timing and verification notes.

![Sales Tickets View](Sales%20Side/Sales%20Tickets.png)
Explanation: Sales-side verification reference for tickets created by Sales before routing to Supervisor.

### Detailed Steps
11. Open STF details for the newly created or selected ticket.
12. Review core ticket/client information before dispatch.
13. Set client availability using the availability options.
14. Select the correct contact person in the Who to call section.
15. If call connects, validate concern details and tag call as completed.
16. If call does not connect, log unsuccessful attempt and set callback follow-up.
17. Review call log preview and ensure call status is documented.
18. Set or confirm ticket priority (`Low`, `Medium`, `High`, `Critical`).
19. Click Continue to Assign when call verification and priority are complete.

## Stage 3: Supervisor Assignment and Reassignment

Visual Flow:
`Continue to Assign -> Open Assign Technical Modal -> Review Technician Workload -> Assign Ticket -> Monitor Progress => [Issue in fit/progress] Reassign -> Continue Work`

State Routing Flow:
`Open -> Assigned -> In Progress -> Pending Closure -> Closed`

### Screens and Explanation
![Supervisor Tickets](Supervisor%20Side/Supervisor%20All%20tickets.png)
Explanation: Main list for opening incoming or self-created verified tickets and starting assignment action.

![Supervisor Assigning Technical](Supervisor%20Side/Supervisor%20assigning%20technical.png)
Explanation: Assignment modal where supervisor compares technician current working tickets, progress, and active load before assigning.

![Supervisor Reassigning](Supervisor%20Side/Supervisor%20Reassigning.png)
Explanation: Reassignment view used when workload, skill mismatch, or escalation requires changing the assigned technician.

![Supervisor Pending Queue](Supervisor%20Side/Supervisor%20Pending%20tickets.png)
Explanation: Queue used to process tickets that still need assignment or immediate routing action.

![Supervisor Escalation Logs](Supervisor%20Side/Supervisor%20Escalation%20logs.png)
Explanation: Used when reassignment is required due to escalation or capability mismatch.

![Supervisor Closing Queue](Supervisor%20Side/Supervisor%20Closing%20tickets.png)
Explanation: Queue for tickets already requesting closure and waiting for supervisor validation.

![Supervisor Completed Queue](Supervisor%20Side/Supervisor%20Completed%20Tickets.png)
Explanation: Final record where supervisor confirms successful closure and quality of completion.

### Detailed Steps
20. Open verified ticket from All/Pending queues or from Continue to Assign flow.
21. Validate ticket details, priority, and client verification/call status.
22. Open Assign Technical modal.
23. Review technician load using active ticket count, current ticket list, and progress indicators.
24. Assign the best-fit technician based on availability and capability.
25. Ticket becomes visible in technical assigned queue.
26. Monitor progress, SLA, and blockers.
27. Reassign when initial assignment is not suitable, ticket is stalled, or escalation requires different expertise.
28. Route ticket actions based on state (`Open`, `In Progress`, `Escalated`, `Pending Closure`, `Closed`).

## Stage 4: Technical Execution

Visual Flow:
`Assigned -> Technician Starts Work -> Diagnose and Resolve -> Update Notes -> Upload Proof -> Request Closure`

### Screens and Explanation
![Technical Dashboard](Technical%20Side/Technical%20Dashboard.png)
Explanation: Technician dashboard for work visibility, priorities, and assignment awareness.

![Technical Assigned Tickets](Technical%20Side/Technical%20Assigned%20tickets.png)
Explanation: Assigned ticket worklist where technician opens and updates ticket progress.

### Detailed Steps
29. Technician receives assignment.
30. Technician opens ticket and starts work (`In Progress`).
31. Technician performs diagnosis and corrective action.
32. Technician updates work notes and remarks.
33. Technician uploads proof/evidence attachments.
34. Technician submits closure request.

## Stage 5: Branching During Work (Escalation, Observation, External)

Visual Flow:
`In Progress => [Cannot Resolve] Escalate -> Supervisor Reassess/Reassign -> Back to In Progress`

Observation Branch:
`In Progress => [Needs Monitoring] For Observation -> Monitor Result -> In Progress or Pending Closure`

External Branch:
`In Progress => [Third-party Needed] Escalated External -> Track Updates -> In Progress or Pending Closure`

### Screens and Explanation
![Technical Escalation History](Technical%20Side/Technical%20Escalation%20History.png)
Explanation: Technician escalation evidence trail showing why escalation was raised.

![Supervisor Escalation Logs](Supervisor%20Side/Supervisor%20Escalation%20logs.png)
Explanation: Supervisor reassessment and reassignment reference for escalated tickets.

### Detailed Steps
35. If unresolved at current level, technician escalates internally.
36. Supervisor validates escalation reason and context.
37. Supervisor reassigns or redirects based on capability fit.
38. Ticket returns to active work path.
39. If monitoring is required, route ticket to `For Observation`.
40. If third-party action is required, route as external escalation and monitor updates.

## Stage 6: Closure Request and Supervisor Review

Visual Flow:
`Pending Closure -> Review Notes and Proof -> Submit Feedback -> Close Ticket -> Verify in Completed`

### Screens and Explanation
![Supervisor Closing Tickets](Supervisor%20Side/Supervisor%20Closing%20tickets.png)
Explanation: Supervisor review queue for closure requests awaiting final validation.

![Supervisor Completed Tickets](Supervisor%20Side/Supervisor%20Completed%20Tickets.png)
Explanation: Final closure confirmation list and post-resolution history check.

### Detailed Steps
41. Ticket moves to `Pending Closure` after technician request.
42. Supervisor reviews proof and work notes for completeness and accuracy.
43. Supervisor confirms the outcome matches original issue scope.
44. Supervisor submits technical feedback/rating.
45. Supervisor closes ticket and confirms status `Closed`.
46. Supervisor verifies ticket appears in completed queue/history.

## Stage 7: Knowledge Capture (Optional but Recommended)

Visual Flow:
`Closed Ticket -> Open Attachment Repository -> Publish Reusable Proof -> Knowledge Available to Team`

### Screens and Explanation
![Supervisor Knowledge Hub Upload](Supervisor%20Side/Supervisor%20knowledge%20hub%20upload.png)
Explanation: Upload area where supervisor selects resolved-ticket evidence for publication.

![Supervisor Knowledge Hub Publish](Supervisor%20Side/Supervisor%20knowledge%20hub%20publish.png)
Explanation: Publication page for adding title, summary, and tags to reusable solutions.

### Detailed Steps
47. Open attachment repository from resolved tickets.
48. Select reusable and valid proof file.
49. Publish as knowledge content with clear tags and description.
50. Confirm published item is searchable by technical staff.

## Supervisor Resolution Gate (Mandatory)
1. Ticket is in `Pending Closure` before final close.
2. Technical action notes and remarks are complete.
3. Proof attachments are valid and relevant.
4. Feedback/rating is submitted.
5. Closure is verified in completed history.

## Ticket Lifecycle Control Matrix
1. Creation control: Sales/Supervisor
2. Verification and call control: Sales/Supervisor (based on ticket creator)
3. Assignment and reassignment control: Supervisor
4. Execution control: Technical Staff
5. Escalation control: Technical Staff + Supervisor
6. Closure control: Supervisor
7. Governance visibility: Superadmin

## Mandatory Validation Checklist per Ticket
1. Client and service details are complete.
2. Client availability and verification call status are recorded for supervisor-created tickets.
3. Priority is set before assignment routing.
4. Assignment or reassignment is performed by supervisor when required.
5. Work notes are updated before closure request.
6. Evidence files are attached before closure request.
7. Supervisor feedback/rating is submitted before final close.

## Quick State Path
`Open -> In Progress -> Pending Closure -> Closed`

Alternate Paths:
- `In Progress -> Escalated -> In Progress`
- `In Progress -> Escalated External -> In Progress/Pending Closure`
- `In Progress -> For Observation -> In Progress/Pending Closure`
