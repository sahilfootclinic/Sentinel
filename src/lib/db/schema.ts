import {
  pgTable,
  text,
  integer,
  bigint,
  doublePrecision,
  date,
  timestamp,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const funds = pgTable("funds", {
  cik: text("cik").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const securities = pgTable("securities", {
  ticker: text("ticker").primaryKey(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  cusip: text("cusip"),
});

/** One row per fund × quarter × security. Idempotent on the natural key. */
export const holdingSnapshots = pgTable(
  "holding_snapshots",
  {
    fundCik: text("fund_cik")
      .notNull()
      .references(() => funds.cik),
    quarter: text("quarter").notNull(), // e.g. "2026Q1"
    cusip: text("cusip").notNull(),
    ticker: text("ticker").notNull(), // "?" if unresolved
    issuerName: text("issuer_name").notNull(),
    valueUsd: bigint("value_usd", { mode: "number" }).notNull(),
    shares: bigint("shares", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.fundCik, t.quarter, t.cusip] })],
);

/** Computed quarter-over-quarter changes; rebuilt by ingestion, not user data. */
export const holdings = pgTable(
  "holdings",
  {
    fundCik: text("fund_cik")
      .notNull()
      .references(() => funds.cik),
    ticker: text("ticker").notNull(),
    issuerName: text("issuer_name").notNull(),
    changeType: text("change_type").notNull(), // new | exit | increase | decrease
    valuePriorUsd: bigint("value_prior_usd", { mode: "number" }).notNull(),
    valueLatestUsd: bigint("value_latest_usd", { mode: "number" }).notNull(),
    pctChange: doublePrecision("pct_change").notNull(),
  },
  (t) => [primaryKey({ columns: [t.fundCik, t.ticker] })],
);

export const insiderTransactions = pgTable(
  "insider_transactions",
  {
    id: text("id").primaryKey(), // accession number + tx index → idempotent
    ticker: text("ticker").notNull(),
    filerName: text("filer_name").notNull(),
    filerRole: text("filer_role").notNull(),
    txType: text("tx_type").notNull(), // buy | sell
    shares: bigint("shares", { mode: "number" }).notNull(),
    priceUsd: doublePrecision("price_usd").notNull(),
    txDate: date("tx_date").notNull(),
    filingUrl: text("filing_url").notNull(),
  },
  (t) => [uniqueIndex("insider_ticker_date_idx").on(t.ticker, t.txDate, t.id)],
);

export const shortInterest = pgTable(
  "short_interest",
  {
    ticker: text("ticker").notNull(),
    asOfDate: date("as_of_date").notNull(),
    shortVolume: bigint("short_volume", { mode: "number" }).notNull(),
    totalVolume: bigint("total_volume", { mode: "number" }).notNull(),
    shortRatio: doublePrecision("short_ratio").notNull(),
  },
  (t) => [primaryKey({ columns: [t.ticker, t.asOfDate] })],
);

export const etfFlows = pgTable(
  "etf_flows",
  {
    etf: text("etf").notNull(),
    date: date("date").notNull(),
    sharesOutstanding: bigint("shares_outstanding", { mode: "number" }).notNull(),
    sharesDelta: bigint("shares_delta", { mode: "number" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.etf, t.date] })],
);

/** Phase 3 — populated by the Polygon adapter when POLYGON_API_KEY is set. */
export const livePrices = pgTable("live_prices", {
  ticker: text("ticker").primaryKey(),
  priceUsd: doublePrecision("price_usd").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const ingestRuns = pgTable("ingest_runs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  job: text("job").notNull(),
  ranAt: timestamp("ran_at", { withTimezone: true }).notNull().defaultNow(),
  ok: integer("ok").notNull(), // 1 success / 0 failure
  detail: text("detail"),
});
