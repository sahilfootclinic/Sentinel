import type { Signal } from "@/lib/types";
import { SECTOR_ETFS } from "@/lib/config";
import type { DataSourceAdapter } from "./types";

/**
 * Phase 2 — ETF sector flow proxy ("Fast Signal").
 * Tracks daily shares-outstanding changes for the 11 SPDR sector ETFs;
 * net creations approximate institutional buying pressure into a sector.
 *
 * Disabled until Phase 1 is deployed (ENABLE_ETF_FLOWS=true turns it on).
 * Data source: Yahoo Finance quote endpoint (sharesOutstanding field).
 */
export const etfFlowsAdapter: DataSourceAdapter = {
  id: "etf-flows",
  sourceName: "ETF flow proxy",
  lagDescription: "as of yesterday · 1-day lag",
  isConfigured: () => process.env.ENABLE_ETF_FLOWS === "true",
  async fetchSignals(): Promise<Signal[]> {
    if (!this.isConfigured()) return [];
    const symbols = SECTOR_ETFS.map((e) => e.etf).join(",");
    const res = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=sharesOutstanding`,
      { headers: { "User-Agent": "Mozilla/5.0 (Sentinel/1.0)" } },
    );
    if (!res.ok) throw new Error(`Yahoo quote ${res.status}`);
    const json = (await res.json()) as {
      quoteResponse: { result: { symbol: string; sharesOutstanding?: number }[] };
    };
    const asOf = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
    return json.quoteResponse.result.flatMap((q) => {
      const ref = SECTOR_ETFS.find((e) => e.etf === q.symbol);
      if (!ref || !q.sharesOutstanding) return [];
      return [
        {
          ticker: q.symbol,
          sector: ref.sector,
          signalType: "etf_flow" as const,
          value: q.sharesOutstanding,
          delta: 0, // delta vs prior day is computed in the ingestion job from stored history
          asOfDate: asOf,
          lagDays: 1,
        },
      ];
    });
  },
};
