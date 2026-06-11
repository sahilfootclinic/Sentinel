import type { FundInfo, HoldingRow, Quarter, Signal } from "@/lib/types";
import { securityByCusip } from "@/lib/sectors";
import { edgarJson, edgarText, fetchSubmissions, padCik } from "./edgarClient";
import type { DataSourceAdapter } from "./types";

interface FilingRef {
  accession: string;
  reportDate: string; // period of report, e.g. "2026-03-31"
  quarter: Quarter;
}

interface FilingIndex {
  directory: { item: { name: string }[] };
}

function quarterOf(reportDate: string): Quarter {
  const [y, m] = reportDate.split("-").map(Number);
  return `${y}Q${Math.ceil((m as number) / 3)}` as Quarter;
}

/** Latest two 13F-HR filings with distinct report periods. */
export async function latest13fFilings(cik: string): Promise<FilingRef[]> {
  const subs = await fetchSubmissions(cik);
  const { form, accessionNumber, reportDate } = subs.filings.recent;
  const out: FilingRef[] = [];
  const seenPeriods = new Set<string>();
  for (let i = 0; i < form.length && out.length < 2; i++) {
    if (form[i] !== "13F-HR") continue;
    const period = reportDate[i] ?? "";
    if (!period || seenPeriods.has(period)) continue;
    seenPeriods.add(period);
    out.push({
      accession: accessionNumber[i] ?? "",
      reportDate: period,
      quarter: quarterOf(period),
    });
  }
  return out;
}

function tagValue(block: string, tag: string): string {
  // Namespace prefixes vary across filers (ns1:, n1:, none), so match loosely.
  const m = block.match(new RegExp(`<(?:\\w+:)?${tag}>([^<]*)<`, "i"));
  return m?.[1]?.trim() ?? "";
}

/**
 * Parse a 13F information-table XML into per-CUSIP holdings.
 * Values are reported in whole dollars for periods from 2023 onward
 * (in thousands before that). Put/call positions are excluded.
 */
export function parseInfoTable(xml: string, reportDate: string): Omit<HoldingRow, "fundCik" | "quarter" | "ticker">[] {
  const blocks = xml.match(/<(?:\w+:)?infoTable>[\s\S]*?<\/(?:\w+:)?infoTable>/gi) ?? [];
  const inThousands = reportDate < "2023-01-01";
  const byCusip = new Map<string, { issuerName: string; valueUsd: number; shares: number }>();
  for (const block of blocks) {
    if (tagValue(block, "putCall")) continue;
    const cusip = tagValue(block, "cusip").toUpperCase();
    if (!cusip) continue;
    const valueRaw = Number(tagValue(block, "value").replace(/,/g, "")) || 0;
    const shares = Number(tagValue(block, "sshPrnamt").replace(/,/g, "")) || 0;
    const valueUsd = inThousands ? valueRaw * 1000 : valueRaw;
    const prev = byCusip.get(cusip);
    if (prev) {
      prev.valueUsd += valueUsd;
      prev.shares += shares;
    } else {
      byCusip.set(cusip, {
        issuerName: tagValue(block, "nameOfIssuer"),
        valueUsd,
        shares,
      });
    }
  }
  return [...byCusip.entries()].map(([cusip, v]) => ({ cusip, ...v }));
}

async function fetchInfoTableXml(cik: string, accession: string): Promise<string> {
  const accNoDashes = accession.replace(/-/g, "");
  const base = `https://www.sec.gov/Archives/edgar/data/${Number(padCik(cik))}/${accNoDashes}`;
  const index = await edgarJson<FilingIndex>(`${base}/index.json`);
  const files = index.directory.item.map((i) => i.name);
  const xmlName =
    files.find((f) => /infotable/i.test(f) && f.endsWith(".xml")) ??
    files.find((f) => f.endsWith(".xml") && !/primary_doc/i.test(f));
  if (!xmlName) throw new Error(`No information table XML in ${base}`);
  return edgarText(`${base}/${xmlName}`);
}

/**
 * Resolve CUSIPs to tickers: static reference table first, then OpenFIGI
 * (free, no key required at low volume). Unresolved CUSIPs keep ticker "?".
 */
async function resolveTickers(cusips: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unknown: string[] = [];
  for (const c of cusips) {
    const ref = securityByCusip.get(c);
    if (ref) out.set(c, ref.ticker);
    else unknown.push(c);
  }
  // OpenFIGI allows 25 jobs/6s unauthenticated, 100 mappings per job.
  for (let i = 0; i < unknown.length; i += 100) {
    const batch = unknown.slice(i, i + 100);
    try {
      const res = await fetch("https://api.openfigi.com/v3/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch.map((c) => ({ idType: "ID_CUSIP", idValue: c }))),
      });
      if (!res.ok) throw new Error(`OpenFIGI ${res.status}`);
      const rows = (await res.json()) as { data?: { ticker?: string }[] }[];
      rows.forEach((row, j) => {
        const ticker = row.data?.[0]?.ticker;
        const cusip = batch[j];
        if (ticker && cusip) out.set(cusip, ticker);
      });
      await new Promise((r) => setTimeout(r, 6500 / 25));
    } catch (err) {
      console.warn(`OpenFIGI lookup failed (${(err as Error).message}); ${batch.length} CUSIPs unresolved`);
    }
  }
  return out;
}

export interface FundQuarterHoldings {
  fund: FundInfo;
  quarter: Quarter;
  reportDate: string;
  rows: HoldingRow[];
}

/** Fetch the latest two quarters of holdings for one fund. */
export async function fetch13fHoldings(fund: FundInfo): Promise<FundQuarterHoldings[]> {
  const filings = await latest13fFilings(fund.cik);
  const results: FundQuarterHoldings[] = [];
  for (const filing of filings) {
    const xml = await fetchInfoTableXml(fund.cik, filing.accession);
    const parsed = parseInfoTable(xml, filing.reportDate);
    const tickerMap = await resolveTickers(parsed.map((p) => p.cusip));
    results.push({
      fund,
      quarter: filing.quarter,
      reportDate: filing.reportDate,
      rows: parsed.map((p) => ({
        fundCik: fund.cik,
        quarter: filing.quarter,
        ticker: tickerMap.get(p.cusip) ?? "?",
        ...p,
      })),
    });
  }
  return results;
}

export const edgar13fAdapter: DataSourceAdapter = {
  id: "edgar-13f",
  sourceName: "SEC EDGAR 13F",
  lagDescription: "filed up to 45 days after quarter end",
  isConfigured: () => true,
  async fetchSignals(): Promise<Signal[]> {
    // Signals are derived from holdings deltas in the ingestion job; the
    // adapter-level signal view is intentionally thin.
    return [];
  },
};
