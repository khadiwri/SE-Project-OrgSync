# SWE Code Audit Report

> This report is based on a static review of the project files available at the time of the audit. The application was not run as part of this review. The report is intended to help identify areas for further review; it is not a course grade or a guarantee of runtime correctness.

## 1. Audit information

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| Auditor          | SWE Code Auditor                   |
| Version          | 1.0.2                              |
| Project          | OrgSync                            |
| Audit date       | 2026-11-24                         |
| Scope            | Full project                       |
| Main language(s) | JavaScript, Node.js                |

## 2. Summary

This audit reviewed the OrgSync project, a student organization event platform implemented using a Node.js/Express backend and a vanilla JavaScript frontend. The audit focused on FR-1 (viewing upcoming events) and additional implemented features like event registration. The core backend architecture follows a clean Repository/Service/Route pattern, which is a strength. However, significant inconsistencies exist between the UML class diagram and the actual implementation, specifically regarding missing classes and mismatched attributes in the `Event` model. The frontend implementation of the sequence diagram is functional but combines responsibilities within `app.js` rather than using distinct classes as suggested by the design.

## 3. Audit status

| Area                                           | Status             | Summary                                                                  |
| ---------------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| Class diagram and implementation               | Issue identified   | Major mismatches in attributes and several missing domain classes.       |
| Sequence diagram(s) and feature implementation | Needs improvement  | Implementation follows the flow but lacks the class-based structure shown. |
| Naming conventions                             | Compliant          | Consistent use of camelCase and PascalCase per JavaScript conventions.     |
| Exception and error handling                   | Needs improvement  | Basic try-catch usage, but error recovery and user feedback are limited.   |
| Code organization                              | Needs improvement  | Backend is well-structured; frontend app.js has high coupling.           |

## 4. Project files reviewed

### Source files

- `backend/Models/Event.js`
- `backend/Models/Registration.js`
- `backend/Repositories/EventRepository.js`
- `backend/Services/EventService.js`
- `backend/Routes/eventRoutes.js`
- `backend/Routes/registrationRoutes.js`
- `backend/server.js`
- `JS/app.js`
- `index.html`
- `CSS/styles.css`

### Design diagrams

| File                                           | Type or feature                              | Review status | Notes                                                                 |
| ---------------------------------------------- | -------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `design/orgsync-uml-image.png`                 | Class diagram                                | Inspected     | High-level conceptual diagram.                                        |
| `design/sequence-diagram-view-upcoming-events.png` | Sequence diagram — View Upcoming Events (FR-1) | Inspected     | Shows interaction between EventsPage, EventService, and EventRepository. |

## 5. Findings

### [F-01] Mismatched Event Model Attributes

- **Area:** Class diagram
- **Status:** Issue identified
- **Severity:** High
- **Evidence:** `backend/Models/Event.js:3-32` vs `design/orgsync-uml-image.png` (Event class)
- **Observation:** The implemented `Event` model uses a `String` for `organization` and is missing `tags`, `participants`, and `comments` arrays. It also uses `date` (Date type) instead of `dateTime` (int type).
- **Why it matters:** The implementation does not support the complex relationships (Aggregation/Composition) defined in the UML, limiting the system's ability to manage organizations, event tags, and user interactions.
- **Recommendation:** Update the `Event` model to include the missing fields and replace the `organization` String with an `ObjectId` reference to an `Organization` model when implemented.

### [F-02] Missing Domain Models

- **Area:** Class diagram
- **Status:** Issue identified
- **Severity:** High
- **Evidence:** `backend/Models/` directory vs `design/orgsync-uml-image.png`
- **Observation:** The `Organization`, `Student`, `User`, `Participant`, `Comment`, and `EventTag` classes shown in the UML have no corresponding implementation in the backend models.
- **Why it matters:** Core domain entities are missing, meaning the thin slice is extremely narrow and lacks the foundational structure for planned future functionality.
- **Recommendation:** Implement the missing Mongoose models to align the implementation with the conceptual design.

### [F-03] Frontend Sequence Diagram Implementation Lack of Class Structure

- **Area:** Sequence diagram
- **Status:** Needs improvement
- **Severity:** Medium
- **Evidence:** `JS/app.js:300-388` vs `design/sequence-diagram-view-upcoming-events.png`
- **Observation:** The `EventsPage` participant in the sequence diagram is implemented as a set of procedural functions and event listeners in `app.js` rather than a class or module with the methods `displayEvents` and `displayEmptyState`.
- **Why it matters:** This deviates from the object-oriented design and leads to a cluttered frontend script where state management and DOM manipulation are tightly coupled.
- **Recommendation:** Refactor `app.js` to use an `EventsPage` class or module to better encapsulate frontend behavior as designed.

### [F-04] Fragile Error Handling in API Fetching

- **Area:** Exception handling
- **Status:** Needs improvement
- **Severity:** Medium
- **Evidence:** `JS/app.js:25-28`
- **Observation:** In `getEvents`, the catch block logs the error and returns an empty array, but the caller (`loadEvents`) does not distinguish between "no events found" and "network/server error."
- **Why it matters:** The user may see a "No upcoming events found" message even if the server is down, which is misleading.
- **Recommendation:** Update `getEvents` to throw or return an error object so the UI can display a specific "Error loading events" message.

## 6. UML comparison

### 6.1 Class diagram

| Diagram element | Expected design | Implementation evidence | Assessment |
| --- | --- | --- | --- |
| Event Class | Attributes: eventId, title, description, dateTime, location, tags, participants, comments | `backend/Models/Event.js:3-32` | **Issue identified**: Missing tags, participants, comments; dateTime is 'date'. |
| Organization Class | Full domain entity | None | **Issue identified**: Implemented only as a String in Event model. |
| Student Class | Attributes: studentId, interests, following, membership | `backend/Models/Registration.js:11` | **Issue identified**: Implemented only as a String field in Registration. |
| Participant Class | Links User and Event | `backend/Models/Registration.js` | **Needs improvement**: Registration model partially serves this role but lacks attributes like `dateAdded`. |
| Aggregation: Org to Event | 1 to 0..* | `backend/Models/Event.js:14` | **Issue identified**: Implemented as String, not a reference relationship. |

### 6.2 Sequence diagram

#### sequence-diagram-view-upcoming-events.png — View Upcoming Events (FR-1)

| Participant or message | Expected interaction | Implementation evidence | Assessment |
| --- | --- | --- | --- |
| EventsPage | Calls getUpcomingEvents() | `JS/app.js:320` | **Needs improvement**: Part of loadEvents function, not a class. |
| EventService.getUpcomingEvents() | Calls findUpcomingEvents() | `backend/Services/EventService.js:5-7` | **Compliant**: Matches perfectly. |
| EventRepository.findUpcomingEvents()| Queries DB and returns Event[] | `backend/Repositories/EventRepository.js:5-20` | **Compliant**: Matches perfectly. |
| displayEvents(events) | Internal call on EventsPage | `JS/app.js:329` | **Needs improvement**: Implemented as displayEventDetails/renderCalendar. |
| displayEmptyState() | Internal call on EventsPage | `JS/app.js:331-337` | **Needs improvement**: Inline DOM manipulation in loadEvents. |

## 7. Next Steps

1. **Implement Missing Models**: Create Mongoose models for `Organization`, `User`, and `Student` to move away from using simple Strings for these entities.
2. **Refactor Event Model**: Align `backend/Models/Event.js` with the UML diagram by adding support for tags and participants.
3. **Frontend Refactoring**: Structure `JS/app.js` into classes or modules that reflect the participants in the sequence diagrams (e.g., `EventsPage`, `CalendarComponent`).
4. **Improve Error Messaging**: Enhance the frontend to provide distinct feedback for network errors versus empty search results.

---
*Disclaimer: This review is based on static inspection and does not establish runtime correctness.*
