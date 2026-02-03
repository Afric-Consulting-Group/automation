# Automation platform based on Node.js workers and a powerfull Total.js ecosystem wrapper

## Application Context and Objective

The goal of this application is to build a unified **automation platform** capable of handling a wide range of use cases, including **API-based workflows, scripting, web-based automation, and potentially AI-driven agent automations**.

The application is being developed for a **consulting group** that currently relies heavily on **human operational teams** to perform repetitive and time-consuming tasks. These teams manually navigate multiple external websites to **collect, copy, and extract data**, often pasting the information into **Excel or Word files**, and then processing that data before submitting it into a **secondary platform**.

This secondary platform is connected to the company’s **partners**, which are primarily **telecom operators and service aggregators**. These partners expose services through **HTTP APIs, USSD gateways, and SMS gateways**, allowing end users to subscribe to and consume **value-added services (VAS)**.

However, the operational reality is complex:

* Some partners provide **clean, documented APIs**
* Others provide **web portals with no APIs**
* Some websites apply **scraping restrictions or anti-automation mechanisms**
* Some workflows require **manual file handling**, such as importing **PDF, Excel, or Word documents**
* Website structures differ significantly, making standard automation difficult
* Certain processes still require **human-like navigation, validation, and decision-making**

As a result, the current workflow is **painful, inefficient, and highly dependent on manpower**, leading to high operational costs, slow execution, and increased risk of human error.

To address these issues, the company is transitioning toward **automation-first operations**. The purpose of this platform is to **replace or augment human agents** by providing a flexible automation system capable of:

* Interacting with APIs when available
* Automating browser-based workflows when APIs do not exist
* Handling restricted or dynamic websites
* Processing and extracting data from files (PDFs, spreadsheets, documents)
* Normalizing and transforming collected data
* Injecting the processed data into partner-connected platforms in a reliable and scalable way

In short, this platform acts as a **central automation layer** between heterogeneous external systems and the company’s partner ecosystem, reducing manual work, increasing speed and accuracy, and enabling the consulting group to scale operations without scaling headcount.

Alright. I’ll **reformulate the stack section** cleanly, professionally, and coherently, keeping **your structure, your intent, and your terminology**, but tightening the English and making it read like a solid technical context / architecture section.


## Technology Stack and Architecture Overview

The platform is built entirely on **Node.js**, with a strong focus on performance, modularity, and scalability. It is **not a traditional full-stack application**, but rather a **backend-centric automation platform** with structured UI integration where required.

At its core, the application leverages **Node.js Workers** to execute automation tasks in isolation. This design choice ensures that long-running, resource-intensive, or blocking automation processes do not impact the main application performance. All heavy automation logic is offloaded to workers, while the core application remains responsive and stable.

The backend framework used is **Total.js (version 5)**. Total.js serves as the main application shell and provides a structured ecosystem, including routing, plugin management, database integration, API handling, and UI rendering. The application follows **Total.js standards and conventions strictly**, ensuring consistency, maintainability, and alignment with the framework’s architecture.

## Plugin-Oriented Architecture

The platform is organized around a **plugin-based architecture**, which is a central design principle of the system.

Each plugin represents a **self-contained automation domain** and includes:

* Plugin metadata and configuration
* Total.js-specific definitions
* API endpoints related to that plugin
* Optional UI components (views, pages, forms)
* A dedicated **worker file** responsible for executing automation logic

Most of the business logic lives inside these plugins. While the majority of the code adheres to Total.js conventions, the architecture allows for **plugin-specific automation logic** when required, enabling flexibility without breaking global standards.

Each plugin’s worker is responsible for executing automation tasks such as API calls, browser automation, file processing, or data transformation. The main application communicates with these workers, orchestrates execution, and collects results asynchronously.


## Worker Model and Performance Strategy

Node.js Workers are used to prevent performance degradation caused by:

* Long-running automation jobs
* External API latency
* Browser-based automation
* File parsing (PDF, Excel, Word)
* Heavy data processing

By isolating automation logic in workers, the platform ensures:

* Non-blocking core application execution
* Better resource utilization
* Improved system stability under load

The workers communicate with the main application to continuously update the **database in real time**, which in turn feeds both internal processes and the user interface.


## Database Layer

The platform uses **PostgreSQL** as its primary database.

* A **global database connection** is defined using Total.js **QueryBuilder**, fully integrated into the Total.js ecosystem.
* Application-wide database logic and helpers are located in the `definitions` folder.
* The root of the project contains a `database.sql` file, which defines **application-wide tables** shared across plugins.
* Some tables are **plugin-specific**, allowing each plugin to manage its own data model independently while still integrating with the core system.

This separation allows clear ownership of data while maintaining a unified database structure.


## Application Structure Overview

At a high level, the project structure includes:

* `index.js`
  The main entry point of the application, responsible for bootstrapping Total.js and initializing the platform.

* `definitions/`
  Contains global definitions, database connections, shared helpers, and application-wide initialization logic.

* `plugins/`
  The core of the system. Each plugin encapsulates its own automation logic, APIs, workers, and optional UI.

* `modules/`
  Reserved for future integrations with the Total.js Open Platform or additional system-level modules.

* `views/`
  Application-wide UI views.

* `public/`
  Static assets and auxiliary resources.

While the platform includes UI components, they are **secondary to the automation logic**. Each plugin may expose its own UI pages, including dashboards, forms, and configuration screens, tightly coupled with its automation capabilities.

---

## Summary

In summary, the platform is a **Node.js–only, worker-driven, plugin-oriented automation system**, built on Total.js 5, designed to:


## Company Context and Architectural Rationale

**Afric Consulting Group** operates across multiple business domains that rely heavily on operational workflows, data collection, content preparation, and service distribution. The nature of these operations is highly heterogeneous: each business line follows **distinct processes, data sources, formats, and execution rules**.

The purpose of the automation platform is to **centralize and automate these diverse business logics** within a single system. However, a key conclusion emerged early in the design phase: **there is no single, uniform business logic** that can be applied across all services.

Each automation use case differs significantly in terms of:

* Data sources (APIs, websites, files, manual inputs)
* Execution patterns (real-time, scheduled, on-demand)
* Processing complexity
* Output formats
* Operational constraints

As a result, a rigid or monolithic architecture would fail to meet the company’s needs. If the platform does not explicitly account for this variability, it would quickly become unusable, difficult to extend, or impossible to maintain.

---

## Architectural Requirement: Maximum Flexibility with Controlled Structure

To effectively serve Afric Consulting Group, the platform must adopt an architecture that:

* Supports **multiple, fundamentally different business logics**
* Allows each automation to evolve independently
* Avoids forcing uniform workflows where they do not fit
* Scales operationally without scaling complexity

This requirement directly justifies the adoption of a **plugin-based architecture**, where each plugin encapsulates its own:

* Business logic
* Automation rules
* Data model
* Execution strategy
* User interface

The platform provides only the **common infrastructure layer** (execution engine, workers, database access, UI framework, orchestration), while plugins implement the actual business logic.

---

## Platform Role Within Afric Consulting Group

The automation platform is not a single-purpose application. It is a **foundational automation layer** intended to support:

* Current operational workflows
* Future services not yet defined
* Progressive automation of manual tasks
* Gradual integration with partner and operator systems

By design, the platform prioritizes **adaptability over standardization**. Standardization is applied only where it adds value (e.g. notifications output, worker lifecycle, plugin registration, etc), while business logic remains free-form.

---

## Data-Driven Decision Making

African City Group recognizes that automation requirements will continue to evolve. For this reason, architectural decisions are guided by **real operational data and existing workflows**, not assumptions.
If necessary, supporting artifacts such as **tables, schemas, or operational examples** can be provided to further refine and validate the architecture.

Understood. I’ll **integrate and formalize this as a continuation of the Business Logic & Plugin Requirements**, making the flexibility and power of plugins *explicit*, while keeping it clean and technical.

---

## Plugin Business Logic Flexibility and Extension Model

A fundamental requirement of the platform is that **business logic inside a plugin is unrestricted**.

Each plugin is treated as an **independent automation unit**, capable of implementing **any level of complexity**, from simple data fetching to advanced workflows involving external APIs, third-party libraries, file processing, or custom algorithms. There are **no artificial limitations** imposed on plugin internals.

Plugins may introduce:

* Additional Node.js dependencies
* External libraries
* Custom parsing or transformation logic
* Domain-specific rules and workflows

This design ensures that each business case can be implemented **freely and optimally**, without being constrained by global application logic.

---

## Plugin Structure and Responsibilities

In most cases, a plugin will include the following elements:

* **Schemas** (data models specific to the plugin)
* **API endpoints** exposed by the plugin
* **Plugin metadata** (identification, configuration, service mapping)
* **Automation logic**
* **Worker processes**
* **UI views** (plugin-specific and not required to be standardized)

Business logic may be distributed across:

* Worker files (long-running or heavy automation tasks)
* Plugin definitions
* Helper functions

Shared or reusable logic within a plugin can be placed in a `definitions/func.js` file.

---

## Use of Total.js `FUNC` Object and Namespacing

Reusable helper functions are attached to the **Total.js `FUNC` object**, which acts as a global function registry across the application.

To avoid:

* Function name collisions
* Accidental overwrites
* Cross-plugin interference

Plugins are encouraged to use **namespaced function definitions** when attaching logic to `FUNC`.

Example (conceptual):

* `FUNC.football_parseMatches()`
* `FUNC.tv_formatSchedule()`

This approach preserves isolation while still leveraging Total.js global access patterns.

---

## Example Plugin: Football Service

As a concrete example, consider a plugin dedicated to **football services**.

This plugin may include:

* A worker responsible for fetching football data from one or more external APIs
* Logic to process and normalize match data
* Plugin-specific database tables such as:

  * Today’s matches
  * Fixtures
  * Results
  * Metadata tables

The UI for this plugin is **fully customizable**. There is no requirement for UI harmonization across plugins. Each plugin may expose its own dashboards, screens, and forms, tailored to its operational needs.

What *is* mandatory is that the plugin provides:

* API endpoints
* UI views
* Worker logic
* Definitions required to support its automation lifecycle

---

## Database Autonomy and Plugin-Owned Tables

Plugins are allowed to create **any number of database tables** required to support their business logic.

There is no predefined limit or restriction on:

* Table count
* Schema complexity
* Data relationships

However, each plugin **must include a `db.sql` file** defining all plugin-specific tables.

When a plugin is registered or initialized by the framework:

1. A dedicated initialization script (defined in the plugin’s definitions) is executed
2. This script checks whether the plugin’s tables already exist in PostgreSQL
3. If tables do not exist, they are created automatically
4. If tables exist, no destructive operation is performed

This ensures:

* Safe deployment
* Idempotent initialization
* Seamless plugin installation or upgrade

---

## Architectural Principle

The plugin system exists to guarantee **maximum freedom in business logic implementation**, while still enforcing a small set of **structural contracts**:

* Every plugin owns its logic
* Every plugin owns its data
* Every plugin integrates cleanly with the platform
* Every plugin can evolve independently

Beyond these contracts, the platform deliberately avoids imposing constraints, allowing the automation system to adapt to **any real-world operational scenario**.
t.


## User Interface (UI) and User Experience (UX) Requirements

As the platform is progressively deployed and used by operational agents, it is expected to **accumulate a very large volume of data over time**, particularly within the notifications queue and plugin-specific datasets. This growth is a core reason for selecting **PostgreSQL**, which provides the robustness, security, and scalability required to handle high daily data throughput.

Given this context, the **user interface must be designed to handle large datasets efficiently**, without overwhelming users or degrading performance.


## Data-Centric UI Design

The primary UI component for displaying automation results is a **data table**, provided by the **TotalCS UI library**.

The data table is used to:

* Display the centralized notifications queue
* Filter data by service / plugin
* Browse large datasets efficiently
* Enable quick copy-paste of notification content by agents

This component is considered **mandatory and reusable across plugins**, as it directly supports the core operational workflow.

---

## Plugin Dashboards and Operational Controls

In addition to data visualization, each plugin may expose a **plugin-specific dashboard**. These dashboards are used to control and monitor automation execution and may include:

* Worker status indicators (running, paused, stopped)
* Controls to:

  * Start workers
  * Pause workers
  * Resume workers
  * Restart workers
* Worker execution statistics
* Access to worker logs
* Debugging and inspection capabilities

Operational visibility is a **key requirement**. Agents and supervisors must be able to understand what is running, what is failing, and why, without relying on backend access.

## UI Components and Interaction Model

The UI relies on reusable components provided by **TotalCS**, including:

* **Data tables** for queues and datasets
* **Modal dialogs** for forms, data insertion, and configuration
* **Panels and windows** that can be:

  * Opened
  * Closed
  * Collapsed
  * Expanded
  * Repositioned

This window-based interaction model provides a **desktop-like experience (webOS-style)**, allowing agents to manage multiple views without navigating away from their current context.

---

## Reusability and Developer Guidance

The platform includes **reference plugins** that already implement these UI components. These serve as practical examples for developers, allowing them to:

* Understand how UI components are wired
* Reuse existing patterns
* Maintain consistency across plugins

This approach reduces UI fragmentation and accelerates development while keeping the learning curve low.

---

## UX Principles

The UI is intentionally **not designed to be visually complex or flashy**.

Core UX principles:

* Simplicity over aesthetics
* Consistency across plugins
* Predictable interactions
* Minimal cognitive load for agents

The goal is to provide a **harmonized and compliant interface** that agents can use for long periods without confusion or fatigue, while still exposing all necessary operational controls.

---

## Summary

In summary, the UI layer of the platform is designed to:

* Handle large and growing datasets efficiently
* Provide clear operational visibility into automation processes
* Offer direct control over worker execution
* Reuse standardized UI components across plugins
* Remain simple, functional, and non-overwhelming

