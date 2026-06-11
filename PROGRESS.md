# Sentinel — build progress

_Last updated: 2026-06-11 (session 1)_

## Shipped

- **Full Next.js App Router MVP** (Next 16, TS strict, Tailwind v4) styled to
  the Datacore SaaS Hero spec: palette, mono data values, hero glow, card
  hover, Framer Motion entrances, mobile-first `max-w-md` column, bottom tab
  bar (Home · Funds · Search · Info), sticky top bar with last-updated.
- **All six screens**: sector heatmap (hero, 11 GICS cells, intensity-scaled
  translucent fills), sector detail (top buys/exits, insider cluster,
  short-pressure badges), fund view (new/exits/increases/decreases + QoQ
  sector-shift bar chart), ticker view (ownership line chart, fund moves,
  Form 4 feed, short ratio + trend), search (tickers + funds), methodology.
- **Data layer**: Drizzle schema (`funds`, `securities`, `holding_snapshots`,
  `holdings` deltas, `insider_transactions`, `short_interest`, `etf_flows`,
  `live_prices`, `ingest_runs`); Neon client; idempotent upsert persistence.
- **Adapters** behind `DataSourceAdapter`: EDGAR 13F (2 quarters × 25 funds,
  CIK verification, CUSIP→ticker via static map + OpenFIGI), EDGAR Form 4
  (full-text search + ownership XML parse, P/S only), FINRA Reg SHO short
  volume, ETF flow proxy (Phase 2, behind `ENABLE_ETF_FLOWS`), and Phase 3
  stubs (Polygon, Unusual Whales, WhaleWisdom) throwing `NOT_IMPLEMENTED`.
- **Cron routes** (`/api/cron/*`) with `CRON_SECRET` auth + `vercel.json`
  schedule per spec (13F quarterly, Form 4 daily, ETF daily, FINRA 1st/15th —
  AEST-aligned UTC).
- **Seed pipeline**: `npm run seed` (real EDGAR+FINRA → Postgres + JSON
  snapshot), `npm run sample` (deterministic fixture). Committed
  `data/snapshot.json` so the app never deploys empty.
- **Data honesty**: every panel has source · as-of · lag labels; sample data
  shows a banner app-wide until real data is seeded.
- Parser regression tests: `npm test`. Build, lint, typecheck all green;
  all routes smoke-tested 200 with content.
- Docs: `README-polygon.md`, `.env.example`, `/memory` lessons.

## Blocked (needs you)

1. **EDGAR/FINRA are not on this build environment's network allowlist**
   (`403 Host not in allowlist`), so the committed snapshot is **sample
   data**, clearly labelled. To load real data, either:
   - run `npm run seed` on your machine (no env vars needed for the JSON
     path), commit the refreshed `data/snapshot.json`, push — or
   - add `data.sec.gov`, `www.sec.gov`, `efts.sec.gov`, `api.openfigi.com`,
     `cdn.finra.org` to the environment allowlist and I'll seed next session.
2. **Neon `DATABASE_URL`** — create a free Neon project, then
   `npm run db:push && npm run seed`, and add the var on Vercel.
3. **Vercel deploy** — import the repo on Vercel, set `CRON_SECRET`
   (+ `DATABASE_URL` when ready). No other config needed; `vercel.json`
   carries the cron schedule.

## Next

- Seed real EDGAR data the moment network/DB access exists (the definition
  of done needs real 13F flows from ≥20 funds).
- Verify the 25 fund CIKs against EDGAR (best-effort from memory; runtime
  `verifyCik()` guards against mismatches — expect a handful to need fixing,
  e.g. Sequoia/Ruane Cunniff, Greenoaks, Glenview, Maverick).
- Lighthouse mobile run (needs Chrome — not in this container) — bundle is
  small and pages are static, ≥85 expected but unverified.
- Phase 2: enable ETF fast-signal ingestion + heatmap Slow/Fast toggle once
  Phase 1 is deployed.
