---
name: react-vite-spa
description: React 19 + Vite SPA patterns for PrintMomentum. Use when adding components, data fetching, routes, or tests. Lean subset of Vercel React performance skills; ignore Next.js-only rules.
---

# React + Vite SPA (PrintMomentum)

## Structure

```
src/
  api/          # fetch wrappers, types matching backend JSON
  components/   # presentational
  pages/        # route-level
  hooks/        # data hooks
  test/         # setup
```

- Function components only. No class components.
- Colocate CSS with the feature or keep global tokens in `index.css`.
- Import from concrete files. No barrel `index.ts` re-exports (bundle cost).

## Data

- Fetch in hooks/pages, not deep in presentational cards.
- Parallel independent requests (`Promise.all`). Do not waterfall.
- Handle loading / error / empty explicitly.
- Types live next to API functions. Match backend field names (`daysToTop` vs `days_to_top` — follow backend JSON once Jackson is configured; default Jackson is camelCase).

## Performance (SPA-relevant)

- Do not define components inside components.
- Derive state in render; do not `useEffect` to copy props into state.
- Lists: `key={listingId}`. For long feeds, virtualize only after measuring.
- Images: explicit width/height, lazy load below the fold.

## Tests

- Vitest + Testing Library. Query by role/text/`data-testid` for async status.
- Mock `fetch`; never call live Etsy or localhost in unit tests.

Run: `npm test` then `npm run build`.
