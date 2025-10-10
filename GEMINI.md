# GEMINI Project Context: Collaborative To-Do & Item Management Platform

## Project Overview

This project is a serverless, multi-user collaborative platform for managing to-do lists and tracking the handover of physical items. The entire application—backend, routing, API, and frontend rendering—is encapsulated within a single Cloudflare Worker script (`index.js`). It uses Cloudflare R2 for persistent data storage.

The application features three main access modes:
1.  **Admin Console (`/`):** A global dashboard to view all tasks, manage users, and see recently deleted items.
2.  **User-Specific View (`/<token>`):** A private view for individual users to manage their assigned tasks.
3.  **Collaborative View:** Users can be assigned to the same tasks, enabling collaboration.

### Key Features
*   **To-Do & Item Management:** Standard CRUD operations for tasks and trackable items.
*   **User Management:** Simple system for creating user-specific access links.
*   **Activity Log:** Each task has a complete, chronological history of all actions (creation, status changes, deletion), providing full process traceability.

### Core Technologies
*   **Runtime:** Cloudflare Workers
*   **Storage:** Cloudflare R2
*   **Language:** JavaScript (ES Modules)
*   **Frontend:** Server-side rendered HTML with vanilla JavaScript and Tailwind CSS (via CDN).

## Building and Running

The project is managed using the `wrangler` CLI.

### 1. Installation
Install the necessary dependencies:
```bash
npm install
```

### 2. Local Development
To run the application locally for development, use the `wrangler dev` command. This will start a local server that simulates the Cloudflare environment.
```bash
npm start
```
Or directly:
```bash
wrangler dev
```

### 3. Deployment
Deploy the worker to your Cloudflare account using:
```bash
wrangler deploy
```
**Note:** Before deploying, ensure you have a Cloudflare R2 bucket created and correctly bound in the `wrangler.toml` or `wrangler.jsonc` file with the binding name `R2_BUCKET`.

## Development Conventions

### Architecture
The project follows a "zero-dependency" serverless model, where the `index.js` file is a self-contained monolith. It handles:
*   **Routing:** Differentiates between API calls, static asset requests, and page views based on the URL path.
*   **API Logic:** Implements RESTful endpoints for CRUD operations on to-dos, users, and items.
*   **Data Persistence:** Functions for interacting with the R2 bucket are clearly defined (`loadTodos`, `saveTodos`, etc.). Backend handlers for creating, updating, and deleting tasks are responsible for appending new entries to the `activityLog`.
*   **Server-Side Rendering (SSR):** The `renderMasterViewHtml` function dynamically generates the complete HTML for the frontend, including a collapsible "Activity History" section for each task.

### Data Model
Data is stored in a single R2 bucket, with object keys prefixed to create a logical separation:
*   `todos:<userId>`: Stores the to-do list for a specific user. Each to-do object now contains an `activityLog` array.
    *   `activityLog`: An array of objects, where each object represents a historical event (e.g., `{timestamp, actorId, action, details}`).
*   `admin:share_links`: Manages user tokens and names.
*   `system:kept_items`: Tracks physical items being handed over.
*   `system:deleted_todos`: A log of recently deleted tasks.

### Frontend
*   The UI is built with Tailwind CSS for styling.
*   Client-side interactivity is handled by vanilla JavaScript (`script.js` and inline scripts).
*   Asynchronous `fetch` calls are used to communicate with the backend API to update or delete data.
*   Each task card now includes a collapsible "操作历史" (Activity History) section that displays the formatted log of all actions related to that task.