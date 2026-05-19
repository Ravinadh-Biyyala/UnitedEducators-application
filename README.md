# React Enterprise Template

Production-ready React + TypeScript scaffold with strict architectural boundaries enforced by ESLint.

## Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** for dev/build
- **Tailwind CSS** for styling
- **Redux Toolkit + RTK Query** for state and data fetching
- **React Router v6** for routing
- **ESLint** with `eslint-plugin-boundaries` enforcing layer rules

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint (boundary checks included) |
| `npm run lint:fix` | Auto-fix where possible |
| `npm run format` | Run Prettier on all source files |
| `npm run type-check` | Run TypeScript without emitting |

## AI Companion (two-process setup)

The Companion chat panel talks to a standalone Express server in `/server` that proxies OpenAI server-side (the API key never reaches the browser). If the server is down the UI gracefully falls back to a local heuristic responder.

1. **Start the backend** (one-time install, then dev watch):
   ```bash
   cd server
   npm install
   cp .env.example .env
   # edit server/.env and set OPENAI_API_KEY=sk-...
   npm run dev
   ```
   Server listens on `http://localhost:8787` and exposes `POST /api/companion/chat`.

2. **Start the frontend** in another terminal at the workbench root:
   ```bash
   npm run dev       # or: npm run dev:design
   ```

3. Open the workbench, open the Companion panel, type a question. Replies now come from OpenAI via `gpt-4.1`. Override the endpoint with `VITE_COMPANION_API_URL` in the root `.env` if needed.

## Architecture

The full architecture spec lives in **[CLAUDE.md](./CLAUDE.md)** and **[.cursorrules](./.cursorrules)**. Read these before adding code.

### Layered structure

```
src/
├── app/              Composition root (App, providers, routes, store)
├── components/
│   ├── common/       Pure UI primitives — Button, Input, Card…
│   ├── domain/       Business-aware presentational — StatusBadge, KpiCard…
│   └── layout/       App shell — AppShell, Sidebar, TopBar
├── containers/       Smart components — connect data + state to presentational
├── features/         Pages + feature-only components
├── hooks/            Custom React hooks
├── services/         RTK Query APIs, axios client
├── store/            Redux slices for non-server state
├── shared/           Pure TS utilities, types, constants
├── theme/            Design tokens
├── styles/           global.css
└── config/           Type-safe env access
```

### Three-layer data flow

```
Page → Container → Presentational
         ↓
  services/  (defines API)
  store/     (UI state)
```

- **services/** *defines* API calls (no React)
- **containers/** *invokes* API calls + Redux (pass plain props down)
- **components/** *render* (props in, events out)

### Boundary rules

ESLint enforces strict import rules. See the full table in `CLAUDE.md`. Highlights:

- Features cannot import from other features (use barrel only)
- Presentational components cannot fetch data or use Redux
- `shared/` cannot import any app-specific code

If `npm run lint` fails on import rules, **don't bypass it** — that's a sign the code is in the wrong layer.

## Working with AI assistants

This project includes pre-configured rules for AI tools:

- **Cursor:** Auto-reads `.cursorrules`
- **Claude Code:** Auto-reads `CLAUDE.md`
- **Other tools:** Paste `CLAUDE.md` as context

When asking AI to add code, prefix with: *"Identify the correct layer first per the project rules, then generate."*

## Folder reference

See `CLAUDE.md` §"Where does X go?" for the placement decision rule.
