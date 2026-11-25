# SWE Code Audit Report

> This report is based on a static review of the project files available at the time of the audit. The application was not run as part of this review. The report is intended to help identify areas for further review; it is not a course grade or a guarantee of runtime correctness.

## 1. Audit information

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| Auditor          | SWE Code Auditor                   |
| Version          | 1.0.2                              |
| Project          | OrgSync                            |
| Audit date       | 2026-11-24                         |
| Scope            | Final Comprehensive Audit          |
| Main language(s) | JavaScript, Node.js                |

## 2. Summary

This final audit confirms significant improvements in the OrgSync project since the baseline report (2026-11-24_2109). The frontend has been successfully refactored to align with the designed `EventsPage` class structure, and error handling for API failures is now distinct from empty results. A supplementary implementation-level class diagram has been introduced to accurately reflect the current project scope, resolving several prior inconsistencies. The backend continues to follow a robust Repository/Service/Route architecture. The Event-to-Registration relationship is correctly implemented with appropriate database-level constraints.

## 3. Audit status

| Area                                           | Status    | Summary                                                                  |
| ---------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| Class diagram and implementation               | Compliant | Implementation matches the supplementary diagram; conceptual gaps noted. |
| Sequence diagram(s) and feature implementation | Compliant | FR-1 implementation now follows the `EventsPage` class-based design.      |
| Naming conventions                             | Compliant | Consistent use of camelCase and PascalCase per JavaScript conventions.    |
| Exception and error handling                   | Compliant | Distinct handling for API errors and successful empty states.            |
| Code organization                              | Compliant | Frontend refactored; clear separation of concerns in backend layers.      |

## 4. Project files reviewed

### Source files

- `backend/Models/Event.js`
- `backend/Models/Registration.js`
- `backend/Repositories/EventRepository.js`
- `backend/Services/EventService.js`
- `backend/Routes/eventRoutes.js`
- `backend/Routes/registrationRoutes.js`
- `JS/app.js` (Active student-facing implementation)
- `JS/admin.js` (Inactive/Partial)
- `JS/dom_ui.js` (Inactive duplicate)
- `index.html`

### Design diagrams

| File                                           | Type or feature                              | Review status | Notes                                                                 |
| ---------------------------------------------- | -------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `design/orgsync-uml-image.png`                 | Conceptual Class Diagram                     | Inspected     | High-level vision; contains unimplemented features.                   |
| `design/orgsync-implementation-class-diagram.png` | Implementation Class Diagram                 | Inspected     | Matches current implementation scope exactly.                         |
| `design/sequence-diagram-view-upcoming-events.png` | Sequence Diagram — FR-1                      | Inspected     | Updated to reflect `EventsPage` class and error states.               |

## 5. Baseline Findings Reassessment

| ID | Finding Title | Status | Evidence |
| -- | ------------- | ------ | -------- |
| **F-01** | Mismatched Event Model Attributes | **Resolved** | `backend/Models/Event.js:3-32` vs `design/orgsync-implementation-class-diagram.png`. Attributes like `date` and `organization` (String) now match the implementation-level design. |
| **F-02** | Missing Domain Models | **Partially resolved** | `backend/Models/` contains `Event.js` and `Registration.js`. While `Student` and `User` remain conceptual, the supplementary diagram confirms they are outside current implementation scope. |
| **F-03** | Frontend Lack of Class Structure | **Resolved** | `JS/app.js:307-368`. The `EventsPage` class is fully implemented with methods matching the sequence diagram. |
| **F-04** | Fragile Error Handling | **Resolved** | `JS/app.js:16-24` and `355-363`. `getEvents` now throws on non-OK responses, and `displayErrorState` handles UI feedback. |

## 6. Detailed Findings

### [F-05] Registration Multiplicity and Constraints

- **Area:** Class diagram / Exception handling
- **Status:** Compliant
- **Severity:** Low (Strength)
- **Evidence:** `backend/Models/Registration.js:5-32`, `backend/Routes/registrationRoutes.js:29-81`
- **Observation:** The implementation correctly enforces a 1:0..* relationship between Event and Registration. It uses a required `ObjectId` reference, validates event existence before creation, and implements a compound unique index on `{ event, studentId }`. 
- **Why it matters:** This ensures data integrity and prevents duplicate registrations at both the application and database levels.
- **Recommendation:** None; implementation is robust.

### [F-06] Inactive Duplicate Logic in dom_ui.js

- **Area:** Code organization
- **Status:** Needs improvement
- **Severity:** Low
- **Evidence:** `JS/dom_ui.js:46-66` vs `JS/app.js:313-368`
- **Observation:** `dom_ui.js` contains a procedural version of the event loading logic that has been superseded by the `EventsPage` class in `app.js`. `index.html` only loads `app.js`.
- **Why it matters:** Maintaining dead or duplicate code can lead to developer confusion during future maintenance.
- **Recommendation:** Remove `JS/dom_ui.js` or clearly mark it as a deprecated/reference file.

## 7. UML comparison

### 7.1 Class diagram (Implementation-Level)

| Diagram element | Expected design | Implementation evidence | Assessment |
| --- | --- | --- | --- |
| Event Class | _id, title, description, organization, date, location, status | `backend/Models/Event.js:3-32` | **Compliant**: Matches exactly. |
| Registration Class | _id, event, studentId, status | `backend/Models/Registration.js:3-26` | **Compliant**: Matches exactly. |
| Compound Index | unique(event, studentId) | `backend/Models/Registration.js:29-32` | **Compliant**: Implemented as a database constraint. |

### 7.2 Sequence diagram

#### sequence-diagram-view-upcoming-events.png — View Upcoming Events (FR-1)

| Participant or message | Expected interaction | Implementation evidence | Assessment |
| --- | --- | --- | --- |
| EventsPage.viewUpcomingEvents() | Initial call from DOMContentLoaded | `JS/app.js:313, 387` | **Compliant**: Properly encapsulated in class. |
| GET /api/events | HTTP request to Event API | `JS/app.js:14` | **Compliant**: Matches. |
| displayEvents(events) | Render calendar and details | `JS/app.js:339-343` | **Compliant**: Method exists and performs role. |
| displayEmptyState() | Show "no events" message | `JS/app.js:345-353` | **Compliant**: Handles successful 0-length response. |
| displayErrorState() | Show "unable to load" message | `JS/app.js:355-363` | **Compliant**: Handles failed API requests. |

## 8. Next Steps

1. **Cleanup Inactive Files**: Remove or archive `JS/dom_ui.js` to avoid confusion with the active `app.js` implementation.
2. **Expand Registration Model**: When moving beyond the current "thin slice," implement the `Student` and `User` models as per the conceptual UML to replace simple `studentId` strings.
3. **Admin Implementation**: Complete the `JS/admin.js` logic and integrate it with the backend to support the conceptual "Create Event" functionality.

---
*Disclaimer: This review is based on static inspection and does not establish runtime correctness.*
