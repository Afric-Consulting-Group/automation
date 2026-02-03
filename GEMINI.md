# GEMINI.md

## Project Overview

This project is a Node.js-based automation platform designed to centralize and automate diverse business logics for the Afric Consulting Group. It leverages the Total.js v5 framework and a plugin-oriented architecture to provide a flexible and scalable system for handling various automation tasks. The platform is backend-centric, with a focus on performance and modularity, using Node.js Workers to execute long-running and resource-intensive automation processes in isolation.

The core of the platform is its plugin-based architecture, where each plugin represents a self-contained automation domain. Plugins can have their own APIs, UI components, and dedicated workers for executing automation logic. The platform uses PostgreSQL as its primary database, with a global database connection managed by Total.js QueryBuilder.

## Building and Running

### Dependencies
The project uses the following main dependencies:
- `total5`: The core Total.js v5 framework.
- `querybuilderpg`: For interacting with the PostgreSQL database.

### Running the Application
To run the application, you need to have Node.js and PostgreSQL installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   The project contains a `database.sql` file in the root directory and `db.sql` files within each plugin. These files define the necessary database tables. You will need to execute these SQL files in your PostgreSQL database.

3. **Start the application:**
   ```bash
   node index.js
   ```
   The application will start on port 8080 by default.

### Testing
There is no test script explicitly defined in `package.json`.

## Development Conventions

### Plugin-Oriented Architecture
The application is organized around a plugin-based architecture. Each plugin is a self-contained unit with its own logic, data model, and UI. Plugins are located in the `plugins/` directory.

### Worker Model
For performance-intensive or long-running tasks, the platform uses Node.js Workers. These workers are responsible for tasks like API calls, browser automation, and file processing. Each plugin can have its own worker, located in a `workers/` subdirectory.

### Database
The platform uses PostgreSQL for data storage. The database schema is defined in `database.sql` for application-wide tables and in `db.sql` files within each plugin for plugin-specific tables.

### Coding Style
The codebase follows the conventions of the Total.js framework. Reusable helper functions are attached to the global `FUNC` object, and plugins are encouraged to use namespaced function definitions to avoid collisions.
