# UE Workbench Server

Standalone Express + TypeScript backend for the UE Underwriter Workbench. Hosts the AI Companion chat endpoint that proxies OpenAI calls server-side, so the API key never reaches the browser.

## Setup

```bash
cd server
npm install
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
npm run dev
```

The server listens on `PORT` (default `8787`).

## Endpoints

- `GET /api/healthz` — liveness check, returns `{ status: "ok" }`.
- `POST /api/companion/chat` — Companion chat completion.

### POST /api/companion/chat

Request body:

```json
{
  "page":     { "title": "Submissions", "subtitle": "Active queue", "routeKey": "submissions" },
  "facts":    "Optional page facts (string) used to ground the model.",
  "messages": [{ "role": "user", "content": "Summarize this account." }]
}
```

Response (200): `{ "text": "..." }`
Response (502): `{ "error": "model unavailable" }`

Model: `gpt-4.1`, `max_tokens: 400`, last 8 messages sent.

## Scripts

- `npm run dev` — tsx watch mode
- `npm run start` — non-watch run
- `npm run typecheck` — `tsc --noEmit`

## Notes

- ESM throughout. Relative imports use `.js` extensions per Node ESM rules; `tsx` resolves them to `.ts` source.
- The OpenAI key is loaded via `dotenv` and read on startup — the process exits with a clear error if it's missing.
- CORS origins come from `CORS_ORIGIN` (comma-separated). Defaults to allow-all if empty.
