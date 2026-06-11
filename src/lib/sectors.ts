import type { GicsSector } from "@/lib/types";
import { GICS_SECTORS } from "@/lib/types";

export interface SecurityRef {
  ticker: string;
  name: string;
  sector: GicsSector;
  /** 9-char CUSIP where known; 13Fs identify securities by CUSIP. */
  cusip?: string;
}

/**
 * Static ticker → GICS sector reference table (11 sectors).
 * Seeded into the `securities` table; ingestion adds rows it resolves via
 * OpenFIGI / issuer-name matching for CUSIPs not listed here.
 */
export const SECURITIES: SecurityRef[] = [
  // Information Technology
  { ticker: "AAPL", name: "Apple", sector: "Information Technology", cusip: "037833100" },
  { ticker: "MSFT", name: "Microsoft", sector: "Information Technology", cusip: "594918104" },
  { ticker: "NVDA", name: "NVIDIA", sector: "Information Technology", cusip: "67066G104" },
  { ticker: "AVGO", name: "Broadcom", sector: "Information Technology", cusip: "11135F101" },
  { ticker: "CRM", name: "Salesforce", sector: "Information Technology", cusip: "79466L302" },
  { ticker: "ORCL", name: "Oracle", sector: "Information Technology", cusip: "68389X105" },
  { ticker: "ADBE", name: "Adobe", sector: "Information Technology", cusip: "00724F101" },
  { ticker: "AMD", name: "Advanced Micro Devices", sector: "Information Technology", cusip: "007903107" },
  { ticker: "INTC", name: "Intel", sector: "Information Technology", cusip: "458140100" },
  { ticker: "QCOM", name: "Qualcomm", sector: "Information Technology", cusip: "747525103" },
  { ticker: "TXN", name: "Texas Instruments", sector: "Information Technology", cusip: "882508104" },
  { ticker: "CSCO", name: "Cisco Systems", sector: "Information Technology", cusip: "17275R102" },
  { ticker: "IBM", name: "IBM", sector: "Information Technology", cusip: "459200101" },
  { ticker: "NOW", name: "ServiceNow", sector: "Information Technology", cusip: "81762P102" },
  { ticker: "SNOW", name: "Snowflake", sector: "Information Technology", cusip: "833445109" },
  { ticker: "PLTR", name: "Palantir", sector: "Information Technology", cusip: "69608A108" },
  { ticker: "MU", name: "Micron Technology", sector: "Information Technology", cusip: "595112103" },
  { ticker: "ANET", name: "Arista Networks", sector: "Information Technology" },
  { ticker: "PANW", name: "Palo Alto Networks", sector: "Information Technology" },
  { ticker: "SHOP", name: "Shopify", sector: "Information Technology" },

  // Financials
  { ticker: "BRK.B", name: "Berkshire Hathaway B", sector: "Financials", cusip: "084670702" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", cusip: "46625H100" },
  { ticker: "V", name: "Visa", sector: "Financials", cusip: "92826C839" },
  { ticker: "MA", name: "Mastercard", sector: "Financials", cusip: "57636Q104" },
  { ticker: "BAC", name: "Bank of America", sector: "Financials", cusip: "060505104" },
  { ticker: "WFC", name: "Wells Fargo", sector: "Financials", cusip: "949746101" },
  { ticker: "C", name: "Citigroup", sector: "Financials", cusip: "172967424" },
  { ticker: "GS", name: "Goldman Sachs", sector: "Financials", cusip: "38141G104" },
  { ticker: "MS", name: "Morgan Stanley", sector: "Financials", cusip: "617446448" },
  { ticker: "AXP", name: "American Express", sector: "Financials", cusip: "025816109" },
  { ticker: "BLK", name: "BlackRock", sector: "Financials" },
  { ticker: "SCHW", name: "Charles Schwab", sector: "Financials", cusip: "808513105" },
  { ticker: "PYPL", name: "PayPal", sector: "Financials", cusip: "70450Y103" },
  { ticker: "COF", name: "Capital One", sector: "Financials", cusip: "14040H105" },
  { ticker: "PGR", name: "Progressive", sector: "Financials", cusip: "743315103" },

  // Energy
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", cusip: "30231G102" },
  { ticker: "CVX", name: "Chevron", sector: "Energy", cusip: "166764100" },
  { ticker: "COP", name: "ConocoPhillips", sector: "Energy", cusip: "20825C104" },
  { ticker: "SLB", name: "Schlumberger", sector: "Energy", cusip: "806857108" },
  { ticker: "OXY", name: "Occidental Petroleum", sector: "Energy", cusip: "674599105" },
  { ticker: "EOG", name: "EOG Resources", sector: "Energy", cusip: "26875P101" },
  { ticker: "PSX", name: "Phillips 66", sector: "Energy", cusip: "718546104" },
  { ticker: "MPC", name: "Marathon Petroleum", sector: "Energy", cusip: "56585A102" },
  { ticker: "VLO", name: "Valero Energy", sector: "Energy", cusip: "91913Y100" },

  // Health Care
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Health Care", cusip: "91324P102" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Health Care", cusip: "478160104" },
  { ticker: "LLY", name: "Eli Lilly", sector: "Health Care", cusip: "532457108" },
  { ticker: "MRK", name: "Merck", sector: "Health Care", cusip: "58933Y105" },
  { ticker: "PFE", name: "Pfizer", sector: "Health Care", cusip: "717081103" },
  { ticker: "ABBV", name: "AbbVie", sector: "Health Care", cusip: "00287Y109" },
  { ticker: "TMO", name: "Thermo Fisher", sector: "Health Care", cusip: "883556102" },
  { ticker: "ABT", name: "Abbott Laboratories", sector: "Health Care", cusip: "002824100" },
  { ticker: "BMY", name: "Bristol-Myers Squibb", sector: "Health Care", cusip: "110122108" },
  { ticker: "AMGN", name: "Amgen", sector: "Health Care", cusip: "031162100" },
  { ticker: "GILD", name: "Gilead Sciences", sector: "Health Care", cusip: "375558103" },
  { ticker: "CVS", name: "CVS Health", sector: "Health Care", cusip: "126650100" },
  { ticker: "HCA", name: "HCA Healthcare", sector: "Health Care" },
  { ticker: "ISRG", name: "Intuitive Surgical", sector: "Health Care" },

  // Consumer Discretionary
  { ticker: "AMZN", name: "Amazon", sector: "Consumer Discretionary", cusip: "023135106" },
  { ticker: "TSLA", name: "Tesla", sector: "Consumer Discretionary", cusip: "88160R101" },
  { ticker: "HD", name: "Home Depot", sector: "Consumer Discretionary", cusip: "437076102" },
  { ticker: "MCD", name: "McDonald's", sector: "Consumer Discretionary", cusip: "580135101" },
  { ticker: "NKE", name: "Nike", sector: "Consumer Discretionary", cusip: "654106103" },
  { ticker: "SBUX", name: "Starbucks", sector: "Consumer Discretionary", cusip: "855244109" },
  { ticker: "LOW", name: "Lowe's", sector: "Consumer Discretionary", cusip: "548661107" },
  { ticker: "BKNG", name: "Booking Holdings", sector: "Consumer Discretionary", cusip: "09857L108" },
  { ticker: "TJX", name: "TJX Companies", sector: "Consumer Discretionary", cusip: "872540109" },
  { ticker: "GM", name: "General Motors", sector: "Consumer Discretionary", cusip: "37045V100" },
  { ticker: "ABNB", name: "Airbnb", sector: "Consumer Discretionary", cusip: "009066101" },
  { ticker: "LULU", name: "Lululemon", sector: "Consumer Discretionary", cusip: "550021109" },
  { ticker: "MAR", name: "Marriott", sector: "Consumer Discretionary", cusip: "571903202" },

  // Consumer Staples
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer Staples", cusip: "742718109" },
  { ticker: "KO", name: "Coca-Cola", sector: "Consumer Staples", cusip: "191216100" },
  { ticker: "PEP", name: "PepsiCo", sector: "Consumer Staples", cusip: "713448108" },
  { ticker: "COST", name: "Costco", sector: "Consumer Staples", cusip: "22160K105" },
  { ticker: "WMT", name: "Walmart", sector: "Consumer Staples", cusip: "931142103" },
  { ticker: "TGT", name: "Target", sector: "Consumer Staples", cusip: "87612E106" },
  { ticker: "MO", name: "Altria", sector: "Consumer Staples", cusip: "02209S103" },
  { ticker: "PM", name: "Philip Morris", sector: "Consumer Staples", cusip: "718172109" },
  { ticker: "CL", name: "Colgate-Palmolive", sector: "Consumer Staples", cusip: "194162103" },
  { ticker: "MDLZ", name: "Mondelez", sector: "Consumer Staples", cusip: "609207105" },
  { ticker: "KHC", name: "Kraft Heinz", sector: "Consumer Staples", cusip: "500754106" },
  { ticker: "EL", name: "Estee Lauder", sector: "Consumer Staples", cusip: "518439104" },

  // Industrials
  { ticker: "CAT", name: "Caterpillar", sector: "Industrials", cusip: "149123101" },
  { ticker: "DE", name: "Deere & Co", sector: "Industrials", cusip: "244199105" },
  { ticker: "BA", name: "Boeing", sector: "Industrials", cusip: "097023105" },
  { ticker: "HON", name: "Honeywell", sector: "Industrials", cusip: "438516106" },
  { ticker: "UPS", name: "United Parcel Service", sector: "Industrials", cusip: "911312106" },
  { ticker: "UNP", name: "Union Pacific", sector: "Industrials", cusip: "907818108" },
  { ticker: "GE", name: "GE Aerospace", sector: "Industrials", cusip: "369604301" },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Industrials", cusip: "539830109" },
  { ticker: "RTX", name: "RTX Corp", sector: "Industrials", cusip: "75513E101" },
  { ticker: "MMM", name: "3M", sector: "Industrials", cusip: "88579Y101" },
  { ticker: "UBER", name: "Uber Technologies", sector: "Industrials", cusip: "90353T100" },
  { ticker: "ETN", name: "Eaton", sector: "Industrials" },

  // Materials
  { ticker: "LIN", name: "Linde", sector: "Materials" },
  { ticker: "FCX", name: "Freeport-McMoRan", sector: "Materials", cusip: "35671D857" },
  { ticker: "NEM", name: "Newmont", sector: "Materials", cusip: "651639106" },
  { ticker: "DOW", name: "Dow", sector: "Materials", cusip: "260557103" },
  { ticker: "SHW", name: "Sherwin-Williams", sector: "Materials", cusip: "824348106" },
  { ticker: "APD", name: "Air Products", sector: "Materials", cusip: "009158106" },
  { ticker: "NUE", name: "Nucor", sector: "Materials", cusip: "670346105" },

  // Real Estate
  { ticker: "AMT", name: "American Tower", sector: "Real Estate", cusip: "03027X100" },
  { ticker: "PLD", name: "Prologis", sector: "Real Estate", cusip: "74340W103" },
  { ticker: "CCI", name: "Crown Castle", sector: "Real Estate", cusip: "22822V101" },
  { ticker: "EQIX", name: "Equinix", sector: "Real Estate", cusip: "29444U700" },
  { ticker: "SPG", name: "Simon Property", sector: "Real Estate", cusip: "828806109" },
  { ticker: "O", name: "Realty Income", sector: "Real Estate", cusip: "756109104" },

  // Utilities
  { ticker: "NEE", name: "NextEra Energy", sector: "Utilities", cusip: "65339F101" },
  { ticker: "DUK", name: "Duke Energy", sector: "Utilities", cusip: "26441C204" },
  { ticker: "SO", name: "Southern Company", sector: "Utilities", cusip: "842587107" },
  { ticker: "D", name: "Dominion Energy", sector: "Utilities", cusip: "25746U109" },
  { ticker: "AEP", name: "American Electric Power", sector: "Utilities", cusip: "025537101" },
  { ticker: "VST", name: "Vistra", sector: "Utilities" },
  { ticker: "CEG", name: "Constellation Energy", sector: "Utilities" },

  // Communication Services
  { ticker: "GOOGL", name: "Alphabet A", sector: "Communication Services", cusip: "02079K305" },
  { ticker: "GOOG", name: "Alphabet C", sector: "Communication Services", cusip: "02079K107" },
  { ticker: "META", name: "Meta Platforms", sector: "Communication Services", cusip: "30303M102" },
  { ticker: "NFLX", name: "Netflix", sector: "Communication Services", cusip: "64110L106" },
  { ticker: "DIS", name: "Walt Disney", sector: "Communication Services", cusip: "254687106" },
  { ticker: "T", name: "AT&T", sector: "Communication Services", cusip: "00206R102" },
  { ticker: "VZ", name: "Verizon", sector: "Communication Services", cusip: "92343V104" },
  { ticker: "TMUS", name: "T-Mobile US", sector: "Communication Services", cusip: "872590104" },
  { ticker: "CMCSA", name: "Comcast", sector: "Communication Services", cusip: "20030N101" },
  { ticker: "CHTR", name: "Charter Communications", sector: "Communication Services", cusip: "16119P108" },
  { ticker: "EA", name: "Electronic Arts", sector: "Communication Services", cusip: "285512109" },
  { ticker: "TTWO", name: "Take-Two Interactive", sector: "Communication Services", cusip: "874054109" },
];

export const securityByTicker = new Map(SECURITIES.map((s) => [s.ticker, s]));
export const securityByCusip = new Map(
  SECURITIES.filter((s) => s.cusip).map((s) => [s.cusip as string, s]),
);

export function sectorOf(ticker: string): GicsSector | "Unknown" {
  return securityByTicker.get(ticker)?.sector ?? "Unknown";
}

export function sectorSlug(sector: GicsSector): string {
  return sector.toLowerCase().replace(/\s+/g, "-");
}

export const sectorBySlug = new Map(GICS_SECTORS.map((s) => [sectorSlug(s), s]));
