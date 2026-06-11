import type { FundInfo, GicsSector } from "@/lib/types";

/**
 * EDGAR requires a descriptive User-Agent or it returns 403.
 * Rate limit: max 10 requests/second.
 */
export const EDGAR_USER_AGENT = "Sentinel/1.0 contact@example.com";
export const EDGAR_MAX_RPS = 10;

/**
 * Curated institutional fund universe (~25 funds).
 * CIKs are validated against EDGAR's company search during ingestion
 * (`resolveCik`) — a wrong CIK is corrected and logged, never silently used.
 */
export const FUNDS: FundInfo[] = [
  { cik: "0001067983", name: "Berkshire Hathaway", slug: "berkshire-hathaway" },
  { cik: "0001350694", name: "Bridgewater Associates", slug: "bridgewater" },
  { cik: "0001037389", name: "Renaissance Technologies", slug: "renaissance" },
  { cik: "0001423053", name: "Citadel Advisors", slug: "citadel" },
  { cik: "0001273087", name: "Millennium Management", slug: "millennium" },
  { cik: "0001336528", name: "Pershing Square", slug: "pershing-square" },
  { cik: "0001167483", name: "Tiger Global Management", slug: "tiger-global" },
  { cik: "0001135730", name: "Coatue Management", slug: "coatue" },
  { cik: "0001103804", name: "Viking Global Investors", slug: "viking-global" },
  { cik: "0001747057", name: "D1 Capital Partners", slug: "d1-capital" },
  { cik: "0001061165", name: "Lone Pine Capital", slug: "lone-pine" },
  { cik: "0000934639", name: "Maverick Capital", slug: "maverick" },
  { cik: "0001061768", name: "Baupost Group", slug: "baupost" },
  { cik: "0001656456", name: "Appaloosa Management", slug: "appaloosa" },
  { cik: "0001040273", name: "Third Point", slug: "third-point" },
  { cik: "0001791786", name: "Elliott Investment Management", slug: "elliott" },
  { cik: "0001079114", name: "Greenlight Capital", slug: "greenlight" },
  { cik: "0001029160", name: "Soros Fund Management", slug: "soros" },
  { cik: "0001536411", name: "Duquesne Family Office", slug: "duquesne" },
  { cik: "0001602119", name: "Dragoneer Investment Group", slug: "dragoneer" },
  { cik: "0000089043", name: "Sequoia Fund (Ruane Cunniff)", slug: "sequoia" },
  { cik: "0001576942", name: "Greenoaks Capital", slug: "greenoaks" },
  { cik: "0001541617", name: "Altimeter Capital", slug: "altimeter" },
  { cik: "0001387322", name: "Whale Rock Capital", slug: "whale-rock" },
  { cik: "0001138995", name: "Glenview Capital", slug: "glenview" },
];

export const fundByCik = new Map(FUNDS.map((f) => [f.cik, f]));
export const fundBySlug = new Map(FUNDS.map((f) => [f.slug, f]));

/** SPDR sector ETFs — Phase 2 fast-signal proxy. */
export const SECTOR_ETFS: { etf: string; sector: GicsSector }[] = [
  { etf: "XLK", sector: "Information Technology" },
  { etf: "XLF", sector: "Financials" },
  { etf: "XLE", sector: "Energy" },
  { etf: "XLV", sector: "Health Care" },
  { etf: "XLY", sector: "Consumer Discretionary" },
  { etf: "XLP", sector: "Consumer Staples" },
  { etf: "XLI", sector: "Industrials" },
  { etf: "XLB", sector: "Materials" },
  { etf: "XLRE", sector: "Real Estate" },
  { etf: "XLU", sector: "Utilities" },
  { etf: "XLC", sector: "Communication Services" },
];

/** Holdings position-size change beyond ±20% counts as a delta signal. */
export const DELTA_THRESHOLD = 0.2;

/** ≥3 insider buys within 30 days = cluster signal. */
export const INSIDER_CLUSTER_MIN_BUYS = 3;
export const INSIDER_CLUSTER_WINDOW_DAYS = 30;
