import type { InsiderTx, Signal } from "@/lib/types";
import { sectorOf } from "@/lib/sectors";
import { edgarJson, edgarText } from "./edgarClient";
import type { DataSourceAdapter } from "./types";

interface FtsHit {
  _id: string; // "0001234567-26-000123:form4.xml"
  _source: { adsh: string; file_date: string; cik?: string; display_names?: string[] };
}

interface FtsResponse {
  hits: { hits: FtsHit[] };
}

function tagValue(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}>\\s*(?:<value>)?([^<]*)`, "i"));
  return m?.[1]?.trim() ?? "";
}

/**
 * Parse a Form 4 ownershipDocument XML into individual transactions.
 * Only open-market buys (code P) and sells (code S) are kept — grants,
 * exercises and gifts are noise for a "smart money" signal.
 */
export function parseForm4(xml: string, filingUrl: string): InsiderTx[] {
  const ticker = tagValue(xml, "issuerTradingSymbol").toUpperCase();
  if (!ticker) return [];
  const ownerName = tagValue(xml, "rptOwnerName");
  const officerTitle = tagValue(xml, "officerTitle");
  const isDirector = tagValue(xml, "isDirector") === "1" || /true/i.test(tagValue(xml, "isDirector"));
  const role = officerTitle || (isDirector ? "Director" : "Insider");

  const txs: InsiderTx[] = [];
  const blocks = xml.match(/<nonDerivativeTransaction>[\s\S]*?<\/nonDerivativeTransaction>/gi) ?? [];
  for (const block of blocks) {
    const code = tagValue(block, "transactionCode").toUpperCase();
    if (code !== "P" && code !== "S") continue;
    txs.push({
      ticker,
      filerName: ownerName,
      filerRole: role,
      txType: code === "P" ? "buy" : "sell",
      shares: Number(tagValue(block, "transactionShares")) || 0,
      priceUsd: Number(tagValue(block, "transactionPricePerShare")) || 0,
      txDate: tagValue(block, "transactionDate"),
      filingUrl,
    });
  }
  return txs;
}

/**
 * Recent Form 4 filings for a ticker via EDGAR full-text search,
 * then each filing's ownership XML parsed for open-market transactions.
 */
export async function fetchForm4Transactions(
  ticker: string,
  sinceDate: string,
  maxFilings = 15,
): Promise<InsiderTx[]> {
  const url =
    `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(ticker)}%22` +
    `&forms=4&dateRange=custom&startdt=${sinceDate}&enddt=${new Date().toISOString().slice(0, 10)}`;
  const res = await edgarJson<FtsResponse>(url);
  const out: InsiderTx[] = [];
  for (const hit of res.hits.hits.slice(0, maxFilings)) {
    const [adsh, file] = hit._id.split(":");
    if (!adsh || !file || !file.endsWith(".xml")) continue;
    const cik = hit._source.cik ?? "";
    if (!cik) continue;
    const base = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${adsh.replace(/-/g, "")}`;
    try {
      const xml = await edgarText(`${base}/${file}`);
      // FTS matches any mention of the ticker; keep only filings whose
      // issuer symbol actually is this ticker.
      out.push(...parseForm4(xml, `${base}/${file}`).filter((t) => t.ticker === ticker));
    } catch (err) {
      console.warn(`Form 4 fetch failed for ${adsh}: ${(err as Error).message}`);
    }
  }
  return out;
}

export const edgarForm4Adapter: DataSourceAdapter = {
  id: "edgar-form4",
  sourceName: "SEC Form 4 insider filings",
  lagDescription: "filed within 2 business days of the trade",
  isConfigured: () => true,
  async fetchSignals(tickers = []): Promise<Signal[]> {
    const since = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    const signals: Signal[] = [];
    for (const ticker of tickers) {
      const txs = await fetchForm4Transactions(ticker, since);
      const buys = txs.filter((t) => t.txType === "buy");
      signals.push({
        ticker,
        sector: sectorOf(ticker),
        signalType: "form4_insider",
        value: buys.length,
        delta: buys.reduce((s, t) => s + t.shares * t.priceUsd, 0),
        asOfDate: new Date().toISOString().slice(0, 10),
        lagDays: 2,
      });
    }
    return signals;
  },
};
