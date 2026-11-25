---
name: swe-code-auditor
description: Review a software engineering project against its UML class diagram and sequence diagrams. Check naming conventions, exception handling, and code organization. Use for a full-project audit or a review of a specific feature. Do not change application code.
metadata:
  version: "1.0.2"
---

# SWE Code Auditor

**Version:** 1.0.2  
**Course:** Introduction to Software Engineering

Save this file in the root folder of the project. To start an audit, ask your coding agent to read `SWE-CODE-AUDITOR.md`, follow its instructions, and create the audit report described below.

## What to review

Review the project in five areas:

1. **Class diagram and source code:** Check whether the classes, attributes, methods, and relationships in the class diagram are reflected in the implementation.
2. **Sequence diagrams and feature code:** Check whether the implementation follows the interactions shown in the sequence diagram for the selected feature.
3. **Naming conventions:** Check whether classes, methods, variables, and constants use clear and consistent names that fit the programming language and project.
4. **Exception and error handling:** Check whether errors are handled, reported, or passed to the appropriate part of the application.
5. **Code organization:** Check whether classes and modules have clear responsibilities and whether the code is reasonably easy to follow and maintain.

Use this audit to compare the implementation with its design and review the coding practices covered in Intro to Software Engineering. Do not treat the report as a grade or proof that the application works correctly.

## Rules for the audit

- **Do not change application code.** Do not edit, reformat, refactor, generate, delete, or move source files. Do not fix issues found during the audit.
- You may create the audit report described in this file. Do not modify UML diagrams or other project documents.
- Do not install packages, access external services, upload project files, or send source code to an external endpoint.
- Do not run build, test, migration, deployment, database, or application commands during the audit. Inspect project files only.
- Review files within the current project folder only. Skip dependency, generated, cache, build, and version-control folders such as `.git`, `node_modules`, `vendor`, `dist`, `build`, `target`, `.venv`, `venv`, and `coverage`.
- Do not include passwords, API keys, tokens, or other private values in the report. If a likely secret is noticed, describe the concern without copying its value.
- Do not invent diagrams, classes, methods, call paths, source locations, line numbers, or runtime behavior.
- Support every finding with evidence. If the available files do not provide enough evidence, use **Unable to verify** or leave the claim out.
- A missing diagram does not prove that the code is wrong. Mark that diagram comparison **Unable to verify** and state what is missing.
- Do not count `try-catch` blocks. Judge whether the code handles or passes errors appropriately.
- Do not assign a grade, percentage, class ranking, or pass/fail result.
- Explain each finding clearly and concisely. Use terminology appropriate for an introductory software engineering course.

## Choose the audit scope

Use the scope specified in the audit request:

- **Full project (default):** Review the available class diagram, all sequence diagrams that can be matched to features, and the five audit areas above.
- **Specific feature:** Review the sequence diagram and implementation for the named feature, along with related class diagram elements and relevant coding practices.
- **Specific diagram:** Focus the UML review on the named diagram. Include coding-practice checks only when requested or directly relevant.

When several project features could match the requested feature, ask which one to review. If the match is clear, proceed.

## Audit procedure

### 1. Identify the project

1. Confirm the project root. If more than one unrelated project is open and the target is unclear, ask which project to review.
2. Identify the main programming language, application type, entry points, and source folders from the files present.
3. Read project documentation and configuration files when they help explain the intended structure or coding style. Examples include a `README`, formatter or linter configuration, and build manifests. Do not install or execute anything.
4. Record the project name when it is clear. Do not infer a name, course section, institution, or assignment number.

### 2. Find the design diagrams

Check the project root and likely folders such as `docs/`, `design/`, `diagrams/`, and `uml/`.

Look for class diagrams and sequence diagrams. Diagrams may be stored as PlantUML (`.puml`, `.plantuml`), Mermaid (`.mmd`, `.md`), draw.io (`.drawio`, `.drawio.svg`), SVG, PNG, JPEG, or PDF files.

Use the file-reading and image-inspection features available in the coding agent. Do not say that a diagram was inspected if the agent could not open or interpret it. For each design file, record its path, likely diagram type, and whether it could be inspected. If the type or purpose is unclear, say so.

### 3. Compare the class diagram with the code

Compare the diagram with source code for:

- Classes, interfaces, and enumerations.
- Important attributes or properties and their types, when shown.
- Important methods, parameters, and return types, when shown.
- Inheritance and interface implementation.
- Associations and references between classes.
- Aggregation or composition, but only when the code provides evidence about ownership or object lifecycle.

Do not require every framework-generated class, constructor, getter, setter, dependency-injection component, or ORM detail to appear in a high-level diagram unless the assignment says otherwise. A difference in naming does not automatically mean the design and code disagree; check whether the responsibility and behavior match.

Use the UML guidance later in this file when deciding whether a relationship is supported by the implementation.

### 4. Compare each sequence diagram with its feature

For each sequence diagram that can be identified:

1. Identify the feature, actor, participants or lifelines, messages, and any `alt`, `opt`, or `loop` fragments.
2. Match participants to source classes, modules, services, or external systems where possible.
3. Trace the feature from its entry point, such as a UI event, route handler, controller endpoint, or command handler.
4. Check the order of important calls and responsibilities. Do not rely only on similar method names.
5. Check conditional and repeated flows when they are shown in the diagram.
6. Record missing, additional, reversed, or unclear interactions only when the source supports the finding.

Consider asynchronous calls, callbacks, event handlers, message queues, dependency injection, polymorphism, framework routing, and generated code before reporting a mismatch.

Static inspection cannot prove that a call will always run or that a database, external service, or application operation will succeed. State this limitation where it matters. If the call path cannot be followed with confidence, mark the item **Unable to verify** rather than guessing.

### 5. Review coding practices

Use the guidance in the sections **Naming conventions**, **Exception and error handling**, and **Code organization** below.

Follow the project's stated style first. Otherwise, use conventions that are common for the detected programming language. Do not apply Java naming rules to Python, JavaScript, or another language.

### 6. Check the evidence

Before writing the report:

1. Re-check the source locations that support each finding.
2. Include exact file paths and line numbers when available, for example `src/orders/OrderService.java:42-49`.
3. If line numbers are unavailable, identify the relevant class, method, or symbol. Do not estimate line numbers.
4. Check whether the apparent difference is explained by a framework convention, language feature, or note in the diagram.
5. Remove unsupported, speculative, duplicated, or purely subjective findings.
6. Include strengths and areas that meet the expected practices, not only problems.
7. Mark missing, unreadable, or unsupported evidence **Unable to verify**.

### 7. Write the audit report

Use the report format at the end of this file. Create `SWE_CODE_AUDIT_REPORT.md` in the project root.

If a report with that name already exists, do not overwrite it. Create a new file with a date and time in the name, for example `SWE_CODE_AUDIT_REPORT_2026-11-17_1430.md`. Use the current date and time available to the agent. If the time is unavailable, use a date-only suffix.

The report must include:

- The auditor name and version (`SWE Code Auditor`, `1.0.2`).
- Audit date and scope, when known.
- Project name and programming language, when evident.
- The design files found and whether they could be inspected.
- A status for each of the five audit areas.
- Findings with severity, evidence, explanation, and a practical recommendation.
- Items that could not be verified.
- A short list of practical next steps.
- A note that the review was based on static inspection and does not establish runtime correctness.

After saving the report, provide its exact file path, the areas reviewed, and any important limitations. Do not repeat private information in the response.

## Status labels

Use these four labels for each audit area and diagram comparison:

- **Compliant** — The available evidence was reviewed and no important issue was found in the scope of the audit.
- **Needs improvement** — A weakness, partial mismatch, or inconsistent practice was found, but it does not appear to block the feature.
- **Issue identified** — A clear mismatch, missing implementation element, or significant concern is supported by evidence.
- **Unable to verify** — Required evidence was missing, unreadable, ambiguous, or beyond the agent's inspection capabilities.

A report may contain both compliant observations and findings in the same area. Choose the overall area status based on the most important supported finding, and explain any uncertainty. Do not use a compliant status to conceal an item that could not be checked.

If a required diagram is missing, its comparison is **Unable to verify**, not **Issue identified**.

## Finding severity

Use only these severity levels:

- **High** — A major design and implementation mismatch, or an error-handling problem likely to affect an important feature.
- **Medium** — A meaningful design inconsistency, unclear responsibility, fragile error handling, or repeated naming or organization problem.
- **Low** — A localized naming, clarity, or organization issue with limited impact.

Severity indicates which findings deserve attention first. It is not a grade. Do not mark a finding high simply because the implementation uses a different style.

## Class diagram review guidance

### Classes, interfaces, and enumerations

- Match each named domain class, interface, or enumeration in the diagram to a source declaration where possible.
- Note missing, renamed, combined, or split elements only when the mapping is clear.
- A controller, repository, DTO, utility, or framework class that is not shown in a high-level diagram is not automatically missing from the design.

### Attributes and operations

- Compare important fields or properties, types, methods, parameters, and return types when the diagram specifies them.
- Account for language features such as properties, records, data classes, generated accessors, constructors, and dependency injection.
- A method with a different name may still have the same responsibility. Check its behavior and signature before reporting a mismatch.

### Relationships

- **Inheritance/generalization:** Look for `extends` or the equivalent language feature.
- **Interface implementation:** Look for `implements`, protocol conformance, or the language equivalent.
- **Association:** Look for references, parameters, return types, collections, or service dependencies that support the relationship.
- **Aggregation:** Do not infer aggregation from a field reference alone. Look for evidence that the objects have separate lifecycles or shared ownership.
- **Composition:** Look for evidence of strong ownership or lifecycle dependence, such as an owner controlling creation and removal. A field or nested object alone is not enough.
- **Multiplicity:** Check whether the code uses a single reference, optional value, or collection where relevant. Do not claim that source types prove exact runtime cardinality.

When the exact UML relationship cannot be established, describe what the code does show. For example: “The order class stores a reference to the customer class; the source does not establish composition.”

## Sequence diagram review guidance

For each sequence diagram, identify the:

- Feature or use case.
- Actor and participants.
- Important messages and their direction.
- Order of calls.
- Conditional fragments such as `alt` and `opt`.
- Repeated behavior shown by a `loop` fragment.
- Important responses, validation steps, data operations, and error paths, when included.

Match participants to classes, modules, services, actors, or external systems. Match messages to methods, API calls, event handlers, or other implementation behavior. Record the source path and line numbers when available.

Possible findings include:

- A participant has no clear counterpart in the implementation.
- An important message has no evidence in the source code.
- The implementation carries out significant steps in a different order.
- A decision or loop in the diagram has no corresponding branch or repetition in the code.
- An important response or error path shown in the diagram is not represented in the inspected implementation.

Before reporting a difference, consider asynchronous execution, callbacks, event systems, framework routing, dependency injection, polymorphism, and generated code. If the path cannot be followed with confidence, explain the uncertainty or mark it **Unable to verify**.

A source-level call chain does not prove that the application behaves correctly at runtime. Do not claim that a request succeeds, a transaction commits, an external API responds, or a branch always runs unless separate runtime evidence was provided.

## Naming conventions

Apply naming rules in this order:

1. Assignment or course requirements.
2. The project's formatter, linter, style guide, or established naming patterns.
3. Common conventions for the programming language.

Do not report a consistent project convention as an error simply because another language or framework uses a different style.

| Language                | Classes and types                         | Methods and functions     | Variables and fields                                       | Constants                                                                          |
| ----------------------- | ----------------------------------------- | ------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Java                    | `PascalCase`                              | `camelCase`               | `camelCase`                                                | `UPPER_SNAKE_CASE` for constants                                                   |
| JavaScript / TypeScript | `PascalCase` for classes and types        | Usually `camelCase`       | Usually `camelCase`                                        | Follow project convention; `UPPER_SNAKE_CASE` is common for module-level constants |
| Python                  | `CapWords`                                | `snake_case`              | `snake_case`                                               | `UPPER_SNAKE_CASE`                                                                 |
| C#                      | `PascalCase` for types and public members | `PascalCase` for methods  | `camelCase` locals; `_camelCase` private fields are common | Follow project convention                                                          |
| C / C++                 | Varies by project                         | Follow project convention | Follow project convention                                  | Follow project convention                                                          |

Check for:

- Names that conflict with the style used throughout the project.
- Vague names such as `data`, `temp`, or `thing` when their meaning is not clear from context.
- Names that do not describe the class, method, or variable's purpose.
- Different spellings or capitalization for the same concept.
- Class names that clearly use the wrong naming form for the language.

Do not flag a minor style difference with no real effect on readability. Common abbreviations such as `id`, `url`, and `api` are acceptable when used consistently. Framework-required names, serialized keys, database column names, and public API names may intentionally differ from internal names.

Make recommendations specific. For example: “Rename `getdata` to `getData` to match the Java method naming used in this project.”

## Exception and error handling

Good error handling makes failures visible to the part of the application that can respond to them, preserves useful information, and releases resources when needed. The aim is not to add as many `try-catch` blocks as possible.

### Check for possible problems

- An empty catch block or a catch block that silently ignores an error.
- Catching a broad exception and continuing as though the operation succeeded.
- Catching an exception, displaying a vague message, and losing information needed to diagnose the problem.
- Returning a success value after a failed operation without a clear recovery plan.
- Throwing a new exception while discarding the original cause when that cause would be useful.
- Repeated catch or recovery logic that could lead to inconsistent behavior.
- Missing resource cleanup where the language or framework requires it.

### Recognize reasonable approaches

- Allowing an exception to reach a controller, user-interface, command, or application boundary that can handle it.
- Catching a specific exception to recover, translate it, add context, retry under a defined policy, or return an expected result.
- Using Java try-with-resources, C# `using`, Python context managers, JavaScript `try/finally`, or an equivalent language feature for cleanup.
- Using framework-level exception handlers or middleware to create consistent error responses.
- Returning an error or result type in a project that uses that approach instead of exceptions.

### Questions to consider

1. Is the failure expected, or is it an exceptional condition?
2. Which part of the application can take a useful action?
3. Is the caught exception type as specific as practical?
4. Is enough information preserved to diagnose the problem?
5. Does the program continue only when recovery is possible?
6. Are resources released when an operation fails?
7. Does the user receive an understandable message rather than internal stack details?

Do not require every method to contain a `try-catch` block. Do not flag exception propagation by itself. Do not recommend catching an exception just to hide it. Do not require a logging framework in a small course project if the project does not use one. Identify a specific risk before reporting that an operation needs error handling.

This review covers basic error handling, not a full security review.

## Code organization

Consider the size and purpose of the project. A small undergraduate assignment should not be expected to use the same architecture as a large production system.

Review whether:

- Each class or module has a reasonably clear purpose.
- Related data and behavior are grouped sensibly.
- A class or function has accumulated responsibilities that make it difficult to understand or change.
- Similar logic is repeated in places where changes could easily become inconsistent.
- User-interface code, business logic, data access, and infrastructure are separated where that separation makes sense for the project.
- Dependencies between parts of the application are understandable and appropriate.
- Method length and control flow make the implementation reasonably easy to follow.

Do not treat every multi-method class as a violation of the single-responsibility principle. Do not recommend abstraction for every repeated line. Explain the practical effect of an organization issue instead of relying on design-pattern terminology alone.

## Audit report format

Create the report using the following structure. Replace the bracketed instructions with information from the project. Remove sections that genuinely do not apply, but keep the status overview and list anything that could not be checked.

# SWE Code Audit Report

> This report is based on a static review of the project files available at the time of the audit. The application was not run as part of this review. The report is intended to help identify areas for further review; it is not a course grade or a guarantee of runtime correctness.

## 1. Audit information

| Field            | Value                              |
| ---------------- | ---------------------------------- |
| Auditor          | SWE Code Auditor                   |
| Version          | 1.0.2                              |
| Project          | [Project name, if known]           |
| Audit date       | [Date, if available]               |
| Scope            | [Full project / feature / diagram] |
| Main language(s) | [Language(s), if known]            |

## 2. Summary

[Write two to five sentences. State what was reviewed, what is working well, the most important findings, and any major limitations. Do not assign a grade.]

## 3. Audit status

| Area                                           | Status   | Summary             |
| ---------------------------------------------- | -------- | ------------------- |
| Class diagram and implementation               | [Status] | [Brief explanation] |
| Sequence diagram(s) and feature implementation | [Status] | [Brief explanation] |
| Naming conventions                             | [Status] | [Brief explanation] |
| Exception and error handling                   | [Status] | [Brief explanation] |
| Code organization                              | [Status] | [Brief explanation] |

Use only these statuses: **Compliant**, **Needs improvement**, **Issue identified**, or **Unable to verify**.

## 4. Project files reviewed

### Source files

- [List the relevant source folders and files.]

### Design diagrams

| File   | Type or feature                              | Review status                                         | Notes                  |
| ------ | -------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| [Path] | [Class diagram / sequence diagram — feature] | [Inspected / Partially inspected / Unable to inspect] | [Notes or limitations] |

## 5. Findings

Include findings that are supported by evidence. Give each finding a unique ID. If no important issue was found in an area, say so.

### [F-01] [Short finding title]

- **Area:** [Class diagram / Sequence diagram / Naming / Exception handling / Code organization]
- **Status:** [Needs improvement / Issue identified]
- **Severity:** [High / Medium / Low]
- **Evidence:** [Exact file path and line number, or class/method name. Include the diagram path and element when relevant.]
- **Observation:** [Describe what the code or diagram shows. Separate fact from interpretation.]
- **Why it matters:** [Explain the practical effect clearly.]
- **Recommendation:** [Give a specific next step. Do not change the code during the audit.]

[Repeat this section for each finding.]

## 6. UML comparison

### 6.1 Class diagram

| Diagram element                             | Expected design          | Implementation evidence          | Assessment               |
| ------------------------------------------- | ------------------------ | -------------------------------- | ------------------------ |
| [Class / attribute / method / relationship] | [What the diagram shows] | [Source path and line or symbol] | [Status and explanation] |

### 6.2 Sequence diagram

#### [Diagram filename] — [Feature]

| Participant or message   | Expected interaction            | Implementation evidence          | Assessment               |
| ------------------------ | ------------------------------- | -------------------------------- | ------------------------ |
| [Participant or message] | [Expected role, call, or order] | [Source path and line or symbol] | [Status and explanation] |


- Report only issues supported by the current
  implementation, diagrams, or project requirements.
  Do not report hypothetical problems as existing
  defects.

- Distinguish confirmed implementation problems
  from optional design recommendations.

- Do not report valid language constructs or
  stylistic alternatives as defects unless they
  conflict with an established project convention.

- Do not recommend changes that introduce new
  problems in other execution paths.

- Before assigning severity, consider the actual
  implementation, including stubbed or placeholder
  methods. Do not claim runtime effects that cannot
  be established from the available evidence.

## Finding quality requirements

- Report confirmed implementation problems separately
  from optional design improvements.

- Do not classify valid language constructs or
  alternative coding styles as defects.

- Do not report hypothetical failures as existing
  defects when the current implementation provides
  no evidence of those failures.

- Optional recommendations must not affect the
  overall audit status unless a project requirement
  or a demonstrated problem justifies the finding.

- Before completing the report, verify all finding
  IDs, cross-references, severity levels, and
  recommendations.

- Recommendations must preserve the intended
  behavior of all execution paths, including
  successful, unsuccessful, and exceptional paths.