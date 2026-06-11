# Sentinel

Institutional money-flow tracker — see where the smart money moved before a
sector gets crowded. Mobile-first, read-only, no auth.

**Signals:** SEC 13F quarterly position deltas across ~25 curated funds
(sector heatmap), Form 4 insider buying clusters, FINRA short volume.
Every panel labels its source, as-of date and lag — lagged data is never
presented as live.

## Run

```bash
npm install
npm run dev        # uses committed data/snapshot.json
```

## Real data

```bash
npm run seed       # EDGAR 13F + Form 4 + FINRA → data/snapshot.json (+ Postgres if DATABASE_URL set)
```

With Neon: set `DATABASE_URL`, then `npm run db:push && npm run seed`.

## Deploy

Import on Vercel, set `CRON_SECRET` (and `DATABASE_URL` when ready).
`vercel.json` schedules ingestion crons. See `PROGRESS.md` for status and
`README-polygon.md` for the Phase 3 live-prices stub.
