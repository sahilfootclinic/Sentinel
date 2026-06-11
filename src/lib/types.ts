/**
 * Core domain types shared by adapters, ingestion, storage and UI.
 */

export const GICS_SECTORS = [
  "Information Technology",
  "Financials",
  "Energy",
  "Health Care",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Materials",
  "Real Estate",
  "Utilities",
  "Communication Services",
] as const;

export type GicsSector = (typeof GICS_SECTORS)[number];

export type SignalType =
  | "13f_position"
  | "form4_insider"
  | "short_interest"
  | "etf_flow"
  | "live_price";

/**
 * Common output shape every DataSourceAdapter emits.
 * `lagDays` is how stale the data is relative to "now" in plain terms —
 * surfaced verbatim in the UI per the data-honesty rules.
 */
export interface Signal {
  ticker: string;
  sector: GicsSector | "Unknown";
  signalType: SignalType;
  value: number;
  delta: number;
  asOfDate: string; // ISO date the data is "as of"
  lagDays: number;
}

/** A quarter like "2026Q1"; ordered lexicographically. */
export type Quarter = `${number}Q${1 | 2 | 3 | 4}`;

export interface FundInfo {
  cik: string; // zero-padded 10-digit CIK
  name: string;
  slug: string;
  /** The public figure the fund is known by, e.g. "Warren Buffett". */
  manager: string;
  /** CC-licensed photo URL (Wikimedia Commons); falls back to monogram avatar. */
  photo?: string;
}

export interface HoldingRow {
  fundCik: string;
  quarter: Quarter;
  ticker: string; // "?" when CUSIP could not be resolved
  cusip: string;
  issuerName: string;
  valueUsd: number;
  shares: number;
}

export type HoldingChangeType = "new" | "exit" | "increase" | "decrease";

export interface HoldingDelta {
  fundCik: string;
  ticker: string;
  issuerName: string;
  changeType: HoldingChangeType;
  valuePriorUsd: number;
  valueLatestUsd: number;
  pctChange: number; // shares-based pct change; ±Infinity encoded as ±9999
}

export interface InsiderTx {
  ticker: string;
  filerName: string;
  filerRole: string;
  txType: "buy" | "sell";
  shares: number;
  priceUsd: number;
  txDate: string; // ISO date
  filingUrl: string;
}

export interface ShortInterestRow {
  ticker: string;
  asOfDate: string; // ISO date
  shortVolume: number;
  totalVolume: number;
  shortRatio: number; // shortVolume / totalVolume, 0..1
}

export interface EtfFlowRow {
  etf: string;
  sector: GicsSector;
  date: string;
  sharesOutstanding: number;
  sharesDelta: number;
}

/**
 * The full dataset the UI reads. Served either from Postgres or from the
 * committed JSON snapshot fallback when DATABASE_URL is absent.
 */
export interface Snapshot {
  meta: {
    generatedAt: string;
    /** "edgar" = real ingested data; "sample" = deterministic fixture. */
    source: "edgar" | "sample";
    latestQuarter: Quarter;
    priorQuarter: Quarter;
  };
  funds: FundInfo[];
  holdings: HoldingRow[];
  deltas: HoldingDelta[];
  insiders: InsiderTx[];
  shortInterest: ShortInterestRow[];
  etfFlows: EtfFlowRow[];
}
