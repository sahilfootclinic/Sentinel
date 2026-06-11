# Remote build environment blocks EDGAR/FINRA — seed must run elsewhere

The Claude Code remote container's network policy returns `403 Host not in
allowlist` for `data.sec.gov`, `www.sec.gov`, `efts.sec.gov` and
`cdn.finra.org` (npm registry is allowed). Live ingestion therefore cannot
run from build sessions in this environment.

Consequences baked into the architecture:
- `data/snapshot.json` (committed, `meta.source: "sample"`) is the fallback
  read path; the UI shows a purple "sample data" banner until real data lands.
- `npm run seed` performs the full real ingestion and must run locally or
  on Vercel (or after the user adds those hosts to the environment allowlist).
- Fund CIKs in `src/lib/config.ts` could not be verified against EDGAR from
  here; `verifyCik()` checks each at ingestion time and skips mismatches
  loudly instead of ingesting the wrong entity.
