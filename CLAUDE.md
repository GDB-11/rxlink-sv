## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Add-ons**: prettier, eslint, tailwindcss, mcp

---

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available Svelte MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Backend API project

You must read rxlink-api project to understand the requets/response payloads and the intent of the APIs. The project is located in /home/Gianfranco/repos/rxlink-api/

## Datebase project

You must read rxlink-db project to understand the data structure. The project is located in /home/Gianfranco/repos/rxlink-db/

## Single Responsibility Principle

You must create components with one responsibility only always to ease maintenance and scaling.

## Reuse components

You must reuse components whenever possible. General use components are in src/lib/components/ui. If new general use components must be greated, they must go there too.

## Prescription lifecycle (PrescriptionStatusId maps to PrescriptionStatus table):

Prescription lifecycle (PrescriptionStatusId maps to PrescriptionStatus table):

Borrador — Default status when a doctor creates a prescription. Not clinically valid yet.
Activo — Set when the doctor explicitly signs the prescription via the sign button. Required before a nurse can dispense it.
Suspendido — The doctor can suspend an Activo prescription at any time before it is dispensed. This is temporary; the doctor can reactivate it back to Activo.
Cancelado — The doctor can permanently cancel a prescription that has not yet been dispensed. This action is irreversible and invalidates the prescription.
Dispensado — Set by a nurse (Enfermero) through the dispensing module, only possible when the prescription is Activo.
Finalizado — Applied when today's date exceeds ValidUntil AND the prescription was already Dispensado.
Caducado — Applied when today's date exceeds ValidUntil AND the prescription was NOT dispensed (i.e., still Activo or Suspendido).

Allowed transitions:
Borrador   → Activo      (doctor signs)
Borrador   → Cancelado   (doctor cancels)
Activo     → Suspendido  (doctor suspends)
Activo     → Cancelado   (doctor cancels — irreversible)
Activo     → Dispensado  (nurse dispenses)
Activo     → Caducado    (ValidUntil exceeded, not dispensed)
Suspendido → Activo      (doctor reactivates)
Suspendido → Cancelado   (doctor cancels — irreversible)
Suspendido → Caducado    (ValidUntil exceeded, not dispensed)
Dispensado → Finalizado  (ValidUntil exceeded, already dispensed)
