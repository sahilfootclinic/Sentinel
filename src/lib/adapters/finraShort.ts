import type { ShortInterestRow, Signal } from "@/lib/types";
import { sectorOf } from "@/lib/sectors";
import type { DataSourceAdapter } from "./types";

/**
 * FINRA Reg SHO consolidated short volume files (CNMS = consolidated NMS).
 * Pipe-delimited: Date|Symbol|ShortVolume|ShortExemptVolume|TotalVolume|Market
 * Published daily; Sentinel ingests on the 1st and 15th per the spec and
 * labels the data with its true as-of date.
 */
const FINRA_BASE = "https://cdn.finra.org/equity/regsho/daily";

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export function parseRegShoFile(text: string, tickers: Set<string>): ShortInterestRow[] {
  const rows: ShortInterestRow[] = [];
  for (const line of text.split("\n")) {
    const [date, symbol, shortVol, , totalVol] = line.split("|");
    if (!date || !symbol || !tickers.has(symbol)) continue;
    const shortVolume = Number(shortVol) || 0;
    const totalVolume = Number(totalVol) || 0;
    if (totalVolume === 0) continue;
    rows.push({
      ticker: symbol,
      asOfDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
      shortVolume,
      totalVolume,
      shortRatio: shortVolume / totalVolume,
    });
  }
  return rows;
}

/**
 * Fetch the most recent available Reg SHO file, walking back up to
 * `maxLookbackDays` over weekends/holidays.
 */
export async function fetchLatestShortInterest(
  tickers: string[],
  maxLookbackDays = 7,
): Promise<ShortInterestRow[]> {
  const wanted = new Set(tickers);
  for (let back = 1; back <= maxLookbackDays; back++) {
    const d = new Date(Date.now() - back * 86400_000);
    const url = `${FINRA_BASE}/CNMSshvol${fmt(d)}.txt`;
    const res = await fetch(url);
    if (!res.ok) continue;
    return parseRegShoFile(await res.text(), wanted);
  }
  throw new Error(`No FINRA Reg SHO file found in the last ${maxLookbackDays} days`);
}

export const finraShortAdapter: DataSourceAdapter = {
  id: "finra-short",
  sourceName: "FINRA Reg SHO short volume",
  lagDescription: "published daily; ingested twice monthly",
  isConfigured: () => true,
  async fetchSignals(tickers = []): Promise<Signal[]> {
    const rows = await fetchLatestShortInterest(tickers);
    return rows.map((r) => ({
      ticker: r.ticker,
      sector: sectorOf(r.ticker),
      signalType: "short_interest" as const,
      value: r.shortRatio,
      delta: 0,
      asOfDate: r.asOfDate,
      lagDays: Math.round((Date.now() - Date.parse(r.asOfDate)) / 86400_000),
    }));
  },
};
