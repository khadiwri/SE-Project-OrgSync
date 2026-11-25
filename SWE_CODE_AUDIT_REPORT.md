# SWE Code Audit Report

> This report is based on a static review of the project files available at the time of the audit. The application was not run as part of this review. The report is intended to help identify areas for further review; it is not a course grade or a guarantee of runtime correctness.

## 1. Audit information

| Field | Value |
|---|---|
| Auditor | SWE Code Auditor |
| Version | 1.0.2 |
| Project | OrgSync |
| Audit date | 2026-11-20 |
| Scope | Full project |
| Main language(s) | JavaScript, HTML, CSS, Node.js |

## 2. Summary

The project is primarily a browser application with a Node.js/Express/Mongoose backend. No Java implementation or Java source files were found. The UML class diagram and sequence diagram were both inspected; the sequence’s main service/repository responsibilities can be matched to JavaScript modules, but the modeled `Student`, `EventsPage`, and direct Java-style call chain are not implemented as shown. Backend/API error handling and browser state handling have a few important inconsistencies, while naming is generally consistent and responsibilities are reasonably separated across the backend.

## 3. Audit status

| Area | Status | Summary |
|---|---|---|
| Class diagram and implementation | **Issue identified** | No Java implementation exists, and several UML classes have no clear implementation counterpart. |
| Sequence diagram(s) and feature implementation | **Needs improvement** | Backend retrieval follows similar responsibilities, but the HTTP/browser architecture and some sequence participants differ. |
| Naming conventions | **Compliant** | JavaScript and Node.js classes, methods, variables, and constants generally follow clear, consistent camelCase/PascalCase conventions. |
| Exception and error handling | **Needs improvement** | API failures and successful empty responses can merge into the same UI state, and some status-check failures are not shown to users. |
| Code organization | **Needs improvement** | Backend roles are separated, but `JS/app.js` combines retrieval, calendar, details, registration, and navigation responsibilities. |

## 4. Project files reviewed

### Source files

- `index.html`: Browser entry point and UI structure.
- `JS/app.js`: Event retrieval, calendar, details, registration, and UI initialization.
- `CSS/styles.css`: Presentation styles.
- `backend/server.js`: Express startup and route registration.
- `backend/Routes/eventRoutes.js`: Event HTTP routes.
- `backend/Routes/registrationRoutes.js`: Registration HTTP routes.
- `backend/Services/EventService.js`: Event service operations.
- `backend/Repositories/EventRepository.js`: Event database queries.
- `backend/Models/Event.js`: Event Mongoose model.
- `backend/Models/Registration.js`: Registration Mongoose model.
- `backend/config/db.js`: Database connection handling.
- `backend/seedEvents.js`: Demo event seeding.
- `backend/package.json`: Node.js dependencies and scripts.
- `README.md`: Project description.

### Design diagrams

| File | Type or feature | Review status | Notes |
|---|---|---|---|
| `design/orgsync-uml-image.png` | Class diagram | Inspected | Shows User, Student, Organization, Event, EventTag, Comment, and Participant; relationships and operations are visible. |
| `design/orgsync-uml.pdf` | Class diagram PDF | Inspected as PDF source; image available | The editable image variant was used to verify diagram elements because the PDF’s text could not be extracted reliably. |
| `design/sequence-diagram-view-upcoming-events.png` | Sequence diagram — view upcoming events | Inspected | Shows Student, EventsPage, EventService, and EventRepository, plus available-events and no-upcoming-events branches. |

## 5. Findings

### [F-01] No Java implementation is present

- **Area:** Class diagram / implementation
- **Status:** Issue identified
- **Severity:** High
- **Evidence:** `backend/package.json:1-16` declares Node.js dependencies including Express and Mongoose. `backend/server.js:1-36` uses JavaScript `require()` and Express setup. `JS/app.js:1-365` contains browser JavaScript; no `.java` files were found under the project root.
- **Observation:** The actual implementation is JavaScript and Node.js rather than Java.
- **Why it matters:** A Java class, field, method, inheritance, and exception-handling comparison cannot be completed.
- **Recommendation:** Provide the Java source implementation or explicitly change the audit scope to the JavaScript implementation.

### [F-02] UML domain classes are largely absent from the implementation

- **Area:** Class diagram / implementation
- **Status:** Issue identified
- **Severity:** Medium
- **Evidence:** `design/orgsync-uml-image.png` shows `Organization`, `Comment`, `Participant`, `User`, `Student`, `Event`, and `EventTag`. `backend/Models/Event.js:3-32` and `backend/Models/Registration.js:3-31` are the only clearly implemented domain models. No `User`, `Organization`, `Comment`, `Participant`, or `EventTag` JavaScript declarations were found.
- **Observation:** The implementation provides Event and Registration persistence, but does not implement the UML classes and many UML operations shown for Organization, Student, Comment, Participant, and EventTag.
- **Why it matters:** The implemented feature is smaller than the domain represented in the class diagram.
- **Recommendation:** Add implementation classes if these domain requirements are in scope, or update/document the class diagram to mark them as future or out-of-scope elements.

### [F-03] Event and Registration model fields do not cover the full UML Event responsibilities

- **Area:** Class diagram / implementation
- **Status:** Needs improvement
- **Severity:** Medium
- **Evidence:** `design/orgsync-uml-image.png` shows Event attributes including `eventId`, `title`, `description`, `dateTime`, `location`, `tags`, `participants`, and `comments`. `backend/Models/Event.js:3-32` stores title, description, organization, date, location, and status. `backend/Models/Registration.js:3-31` represents event, student ID, and status, but no tags or comments are modeled.
- **Observation:** The implemented Event model is a persistence-oriented subset of the UML class. Registration replaces the UML Participant relationship in part.
- **Why it matters:** Diagram operations involving tags, comments, and participant messages have no direct implementation counterparts.
- **Recommendation:** Decide whether comments, tags, and participant messaging remain required for this implementation and align the model or diagram accordingly.

### [F-04] The `EventsPage` sequence participant is not represented as a page class

- **Area:** Sequence diagram / implementation
- **Status:** Issue identified
- **Severity:** Medium
- **Evidence:** `design/sequence-diagram-view-upcoming-events.png` shows `EventsPage.viewUpcomingEvents()`, `getUpcomingEvents()`, and `displayEvents(events)`. `JS/app.js:307-343` implements `loadEvents()` and calls `getEvents()` and `displayEventDetails()`, but there is no `EventsPage` class or `viewUpcomingEvents()` method.
- **Observation:** The page behavior is embedded in browser DOM initialization and rendering functions rather than a separate EventsPage participant.
- **Why it matters:** The sequence and implementation responsibilities do not use the same participant boundaries.
- **Recommendation:** Update the sequence diagram to reflect browser initialization/load/display functions or introduce an EventsPage module/class if the modeled architecture is required.

### [F-05] Event retrieval crosses an HTTP boundary rather than direct repository calls

- **Area:** Sequence diagram / implementation
- **Status:** Needs improvement
- **Severity:** Low
- **Evidence:** `JS/app.js:3-28` sends `fetch(url)` to `/api/events`; `backend/Routes/eventRoutes.js:10-27` calls `EventService.getUpcomingEvents()`; `backend/Services/EventService.js:4-8` calls `EventRepository.findUpcomingEvents()`; `backend/Repositories/EventRepository.js:4-23` performs the Mongoose query.
- **Observation:** The implementation preserves the conceptual UI-to-service-to-repository responsibility order, but it adds an HTTP route and JSON response between the frontend and service.
- **Why it matters:** This is an architecture difference from a direct lifeline call, not necessarily a defect, but it must be shown clearly in the design.
- **Recommendation:** Add the browser and HTTP boundary to the sequence diagram or state that the sequence is a conceptual backend call chain.

### [F-06] Event API failures are converted into an empty list

- **Area:** Exception and error handling
- **Status:** Issue identified
- **Severity:** Medium
- **Evidence:** `JS/app.js:17-19` throws for a non-success HTTP response, and `JS/app.js:25-27` catches the error and returns `[]`. `JS/app.js:318-343` treats `events.length === 0` as “No upcoming events found.”
- **Observation:** A failed request and a successful request with no events produce the same array value and UI message.
- **Why it matters:** Users cannot distinguish unavailable data from a legitimate empty result.
- **Recommendation:** Preserve an error state or return a result object, and show a distinct loading-failure message while keeping the valid empty-state message separate.

### [F-07] Registration status-check failures are not reported visibly

- **Area:** Exception and error handling
- **Status:** Needs improvement
- **Severity:** Low
- **Evidence:** `JS/app.js:88-103` catches a registration status-check failure and only writes to `console.error`. Submission feedback is visible at `JS/app.js:105-143`, and server duplicate protection exists at `backend/Routes/registrationRoutes.js:42-81`.
- **Observation:** The status check failure is not presented in the UI, whereas submission errors are written to the feedback element.
- **Why it matters:** A user may see the registration control despite not knowing that existing-registration status could not be checked.
- **Recommendation:** Show a concise feedback message for status-check failures while retaining server-side duplicate protection.

### [F-08] Frontend module combines several UI responsibilities

- **Area:** Code organization
- **Status:** Needs improvement
- **Severity:** Low
- **Evidence:** `JS/app.js:3-28` retrieves events, `JS/app.js:42-145` renders event details and registration, `JS/app.js:148-211` loads saved events, `JS/app.js:215-303` renders the calendar, and `JS/app.js:307-365` initializes navigation and search.
- **Observation:** A single JavaScript module owns API access, registration, calendar rendering, saved-event rendering, and application initialization.
- **Why it matters:** Related behavior is understandable, but changes can require navigation across a large module and may increase accidental coupling.
- **Recommendation:** If maintainability becomes a concern, divide the module into event API, calendar, and registration UI modules without changing behavior.

## 6. UML comparison

### 6.1 Class diagram

| Diagram element | Expected design | Implementation evidence | Assessment |
|---|---|---|---|
| `User` | Base user class with ID, date joined, display name, password hash, email, login, and updateProfile | No corresponding JavaScript or Java class found | **Missing** |
| `Student extends User` | Student fields and organization/interest/calendar operations | No Student class found; demo student ID is only a string in `JS/app.js:1-3` | **Missing** |
| `Organization` | Organization fields and event/member operations | No Organization class found; organization is only a string field in `backend/Models/Event.js:15-19` | **Partial** |
| `Event` | Event fields including tags, participants, comments, and operations | `backend/Models/Event.js:3-32` implements title, description, organization, date, location, and status; no tags/comments/participant collections | **Partial** |
| `EventTag` | Tag ID, name, category, and matching events operation | No `EventTag` implementation found | **Missing** |
| `Comment` | Comment ID, author, body, timestamp, and edit/delete operations | No Comment implementation found | **Missing** |
| `Participant` | Participant user reference and messaging operations | No Participant implementation found; Registration is the closest model at `backend/Models/Registration.js:3-31` | **Missing as UML element** |
| `EventRepository` | Repository service for upcoming events | `backend/Repositories/EventRepository.js:4-23` implements `findUpcomingEvents` | **Compliant** |
| `EventService` | Service delegating upcoming-event retrieval | `backend/Services/EventService.js:4-8` implements `getUpcomingEvents` | **Compliant** |

### 6.2 Sequence diagram

#### `sequence-diagram-view-upcoming-events.png` — View Upcoming Events

| Participant or message | Expected interaction | Implementation evidence | Assessment |
|---|---|---|---|
| Student -> EventsPage | `viewUpcomingEvents()` | The diagram has this call; `JS/app.js:307-343` starts with `loadEvents()` from DOM initialization, with no Student or `viewUpcomingEvents()` method | **Missing/changed** |
| EventsPage -> EventService | `getUpcomingEvents()` | Browser fetch at `JS/app.js:3-28`; route calls service at `backend/Routes/eventRoutes.js:13-20` | **Equivalent through HTTP** |
| EventService -> EventRepository | `findUpcomingEvents()` | `backend/Services/EventService.js:4-8` calls `EventRepository.findUpcomingEvents()` | **Compliant** |
| EventRepository -> EventService | Returns `events: Event[]` | `backend/Repositories/EventRepository.js:4-23` returns an Event query result; service returns it at `backend/Services/EventService.js:4-8` | **Compliant** |
| EventService -> EventsPage | Returns `events: Event[]` | Route serializes service results at `backend/Routes/eventRoutes.js:20-26`; browser reads JSON at `JS/app.js:21-28` | **Equivalent through HTTP** |
| `alt [Events available]` | `displayEvents(events)` | `JS/app.js:318-343` displays the first event with `displayEventDetails(events[0])`; no `displayEvents(events)` method exists | **Different implementation** |
| `else [No upcoming events]` | `displayEmptyState()` | `JS/app.js:336-343` replaces details with “No upcoming events found.”; no `displayEmptyState()` method exists | **Equivalent UI behavior** |

## 7. Unable to verify items

- Exact Java source types and signatures because no `.java` files are in the project folder.
- Whether omitted UML domain classes are intentionally outside the implemented feature scope.
- Runtime behavior of HTTP requests, database queries, registration duplicate handling, and browser rendering; no application execution was performed.
- The PDF-only extractable text, but the separate class and sequence image files were readable and used for comparison.

## 8. Practical next steps

1. Provide the Java implementation or formally change the implementation scope to JavaScript/Node.js.
2. Decide whether the Organization, Comment, Participant, EventTag, and full User/Student features remain in scope and align the class diagram or source.
3. Align the sequence diagram with browser/HTTP architecture or introduce explicit page/service/repository JavaScript classes.
4. Represent event API failure separately from a successful empty result.
5. Show registration status-check failures in the UI while retaining server-side duplicate protection.
6. Consider splitting `JS/app.js` into smaller modules as the project grows.

> Static inspection limitation: this review did not run the application or execute tests, so it does not establish runtime correctness or that every branch behaves as shown in the diagrams.
