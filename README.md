# Chess — Realtime Multiplayer Chess (monorepo)

![screenshot](https://github.com/tanavposwal/chess/assets/63358333/4fc1c109-0170-4f82-bf75-d1a382dd9e75)

A small realtime multiplayer chess project implemented as a turbo repo.
It includes a Next.js frontend, a standalone WebSocket server for game logic, and a small Prisma-backed database package.

This README explains the repo layout, how to run the project locally, environment variables you may need, and useful developer notes.

## Key features

- Realtime gameplay using WebSockets
- Next.js frontend (React + TypeScript)
- Game state & persistence via Prisma (database package)
- Monorepo structure for local development

## Architecture

- apps/frontend — Next.js app (UI, auth, client socket)
- apps/ws — WebSocket server (game manager, move routing)
- packages/db — Prisma client, DB schema & migration scripts
- packages/ui, eslint-config, typescript-config — shared tooling and components

Ports (defaults used by the project):

- WebSocket server: 8080
- Frontend: 3000

## Prerequisites

- Node.js (>= 18 recommended)
- pnpm (workspace-aware package manager)
- A Postgres-compatible database for Prisma (or set DATABASE_URL to any supported provider)

## Quickstart — run locally

1. Clone the repo and install dependencies (run from repo root):

```bash
pnpm install
```

2. Prepare your database and run Prisma migrations (example using `packages/db`):

```bash
# Set DATABASE_URL in your shell or .env (example using local Postgres)
export DATABASE_URL="postgresql://user:password@localhost:5432/chess_dev"

cd packages/db
pnpm prisma migrate deploy
# or use `pnpm prisma migrate dev` when you want to create/migrate locally
```

3. Start the WebSocket server and frontend in separate terminals:

```bash
# WebSocket server
cd apps/ws
pnpm dev

# Frontend
cd ../../apps/frontend
pnpm dev
```

Open the frontend at http://localhost:3000. The frontend connects to the WS server on port 8080 by default.

If your environment uses different ports or hosts, set the appropriate environment variables in each app (see Environment section below).

## Environment variables

Common variables used by the apps (not exhaustive):

- DATABASE_URL — Prisma connection string for the database
- NEXTAUTH_URL — URL of the Next.js app (for auth flows)
- NEXTAUTH_SECRET — secret used by NextAuth (if enabled)
- WS_URL — WebSocket server URL (if the frontend needs to connect to a custom host)

Create `.env` files in apps that require them (frontend, ws, packages/db) or export variables in your shell.

## Development notes

- The project uses pnpm workspaces — prefer `pnpm` for installs and scripts.
- The `packages/db/prisma/migrations` folder contains migration SQL generated during development. Use Prisma CLI to apply or create new migrations.
- Consider running Redis for scaling the WS layer (TODO — planned in repo).

## Repo structure (top-level)

```
apps/
	frontend/   # Next.js app (UI)
	ws/         # WebSocket server (game logic)
packages/
	db/         # Prisma client + schema + migrations
	ui/         # shared UI components
eslint-config/
typescript-config/
README.md
```

## TODO / Roadmap

- Redis for scalable game WebSocket infrastructure
