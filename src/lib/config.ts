import type { FundInfo, GicsSector } from "@/lib/types";

/**
 * EDGAR requires a descriptive User-Agent or it returns 403.
 * Rate limit: max 10 requests/second.
 */
export const EDGAR_USER_AGENT = "Sentinel/1.0 contact@example.com";
export const EDGAR_MAX_RPS = 10;

// Wikimedia Commons Special:FilePath URLs — CC-licensed, degrade to monogram on 404.
const wiki = (filename: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=240`;

/**
 * Curated institutional fund universe (~25 funds).
 * CIKs are validated against EDGAR's company search during ingestion
 * (`resolveCik`) — a wrong CIK is corrected and logged, never silently used.
 */
export const FUNDS: FundInfo[] = [
  { cik: "0001067983", name: "Berkshire Hathaway", slug: "berkshire-hathaway", manager: "Warren Buffett", photo: wiki("Warren_Buffett_KU_Visit.jpg") },
  { cik: "0001350694", name: "Bridgewater Associates", slug: "bridgewater", manager: "Ray Dalio", photo: wiki("Ray_Dalio_at_the_World_Economic_Forum.jpg") },
  { cik: "0001037389", name: "Renaissance Technologies", slug: "renaissance", manager: "Jim Simons" },
  { cik: "0001423053", name: "Citadel Advisors", slug: "citadel", manager: "Ken Griffin", photo: wiki("Ken_Griffin_(cropped).jpg") },
  { cik: "0001273087", name: "Millennium Management", slug: "millennium", manager: "Izzy Englander" },
  { cik: "0001336528", name: "Pershing Square", slug: "pershing-square", manager: "Bill Ackman", photo: wiki("Bill_Ackman_2012_Shankbone.jpg") },
  { cik: "0001167483", name: "Tiger Global Management", slug: "tiger-global", manager: "Chase Coleman" },
  { cik: "0001135730", name: "Coatue Management", slug: "coatue", manager: "Philippe Laffont" },
  { cik: "0001103804", name: "Viking Global Investors", slug: "viking-global", manager: "Andreas Halvorsen" },
  { cik: "0001747057", name: "D1 Capital Partners", slug: "d1-capital", manager: "Dan Sundheim" },
  { cik: "0001061165", name: "Lone Pine Capital", slug: "lone-pine", manager: "Stephen Mandel" },
  { cik: "0000934639", name: "Maverick Capital", slug: "maverick", manager: "Lee Ainslie" },
  { cik: "0001061768", name: "Baupost Group", slug: "baupost", manager: "Seth Klarman", photo: wiki("Seth_Klarman.jpg") },
  { cik: "0001656456", name: "Appaloosa Management", slug: "appaloosa", manager: "David Tepper", photo: wiki("David_Tepper_Oct_2019.jpg") },
  { cik: "0001040273", name: "Third Point", slug: "third-point", manager: "Dan Loeb", photo: wiki("Dan_Loeb_2019.jpg") },
  { cik: "0001791786", name: "Elliott Investment Management", slug: "elliott", manager: "Paul Singer", photo: wiki("Paul_Singer_(financier).jpg") },
  { cik: "0001079114", name: "Greenlight Capital", slug: "greenlight", manager: "David Einhorn", photo: wiki("David_Einhorn_2.jpg") },
  { cik: "0001029160", name: "Soros Fund Management", slug: "soros", manager: "George Soros", photo: wiki("George_Soros_-_World_Economic_Forum_Annual_Meeting_Davos_2011.jpg") },
  { cik: "0001536411", name: "Duquesne Family Office", slug: "duquesne", manager: "Stanley Druckenmiller", photo: wiki("Stanley_Druckenmiller.jpg") },
  { cik: "0001602119", name: "Dragoneer Investment Group", slug: "dragoneer", manager: "Marc Stad" },
  { cik: "0000089043", name: "Sequoia Fund (Ruane Cunniff)", slug: "sequoia", manager: "Ruane Cunniff" },
  { cik: "0001576942", name: "Greenoaks Capital", slug: "greenoaks", manager: "Neil Mehta" },
  { cik: "0001541617", name: "Altimeter Capital", slug: "altimeter", manager: "Brad Gerstner" },
  { cik: "0001387322", name: "Whale Rock Capital", slug: "whale-rock", manager: "Alex Sacerdote" },
  { cik: "0001138995", name: "Glenview Capital", slug: "glenview", manager: "Larry Robbins" },
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
