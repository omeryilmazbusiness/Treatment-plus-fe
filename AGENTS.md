<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Treatment Plus

- Hexagonal: `src/modules/<ctx>/{domain,application,adapters}`. Domain does not import Next, React, fetch, or cookies.
- Composition root is `src/app` + `src/bootstrap` only.
- Browser never calls `API_URL`. Cookies stay on this origin.
- Money is integer minor units. `clinic_id` is not taken from query or body.
- Patient routes under `/p` are PHI: no-store, no CDN/Redis cache.
- Run `pnpm arch` after changing imports.

