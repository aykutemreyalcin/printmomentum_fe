# PrintMomentum frontend

React SPA for **printmomentum.com** — printable Etsy t-shirts ranked by climb speed.

## Stack

- React 19
- Vite 8
- TypeScript
- Vitest

## Run

```bash
npm install
npm test
npm run dev
```

Dev server proxies `/api` to `http://localhost:8080`.

Protected listing endpoints expect `X-Api-Key`. Copy `.env.example` to `.env.local` and set
`VITE_API_KEY` to the backend local key (`PRINTMOMENTUM_API_KEY`, default
`dev-local-printmomentum`). Restart `npm run dev` after changing it. Do not commit `.env.local`
or a real production key.

If the API is unreachable, `npm run dev` falls back to sample listings so the feed is
not blank, and the UI marks them as sample data. Production builds never do this.

## Cursor

Skills: `.cursor/skills/`. See `AGENTS.md`.
