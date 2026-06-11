# Stack decisions and why

- **Neon not yet provisioned** — only the user can create the database and
  provide `DATABASE_URL`. Everything is built DB-first with a JSON snapshot
  fallback (`src/lib/data/store.ts`), so no Vercel KV fallback was needed:
  the tradeoff (stale-until-redeploy JSON vs live DB) is strictly better
  than KV because the same `Snapshot` shape serves both paths.
- Tailwind v4 (`@theme` tokens in `globals.css`) — design tokens are CSS
  variables generating utilities like `bg-bg`, `text-pos`, `border-edge`.
- Pages use ISR (`revalidate = 3600`); with JSON fallback they're
  effectively static, with a DB they refresh hourly — traffic is tiny.
- `data/snapshot.json` is read with `fs` at runtime, so
  `outputFileTracingIncludes` in `next.config.ts` is required or serverless
  functions won't bundle it.
- Parser regression tests: `npm test` (scripts/test-parsers.ts) — no test
  framework, plain node asserts via tsx.
