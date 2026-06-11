# EDGAR ingestion gotchas encoded in the adapters

- EDGAR returns **403 without a descriptive User-Agent** header; all
  requests go through `edgarFetch()` which sets it and throttles to 10 req/s.
- 13F information tables identify securities by **CUSIP, not ticker**.
  Resolution order: static map in `src/lib/sectors.ts` → OpenFIGI batch
  lookup → ticker "?" (kept, excluded from sector aggregation).
- 13F `value` is in **whole dollars for periods ≥ 2023**, in thousands
  before that (`parseInfoTable` handles both).
- Infotable XML namespace prefixes vary by filer (`ns1:`, none) — parse
  with prefix-agnostic regex, and skip `putCall` rows.
- Form 4: only transaction codes **P (buy) and S (sell)** are meaningful
  smart-money signals; grants (A), exercises (M) etc. are noise. EDGAR
  full-text search matches any mention of a ticker, so filter parsed
  filings by `issuerTradingSymbol`.
