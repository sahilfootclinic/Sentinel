import { FUNDS } from "@/lib/config";
import { fetch13fHoldings } from "@/lib/adapters/edgar13f";
import { verifyCik } from "@/lib/adapters/edgarClient";
import { computeDeltas } from "@/lib/ingest/deltas";
import type { HoldingDelta, HoldingRow, Quarter } from "@/lib/types";

export interface Ingest13fResult {
  holdings: HoldingRow[];
  deltas: HoldingDelta[];
  latestQuarter: Quarter;
  priorQuarter: Quarter;
  fundsIngested: number;
  warnings: string[];
}

/**
 * Pull the latest two 13F-HR quarters for every curated fund and compute
 * quarter-over-quarter deltas. Pure fetch+compute — persistence happens in
 * the caller (cron route or seed script) so this stays testable.
 */
export async function ingest13f(): Promise<Ingest13fResult> {
  const holdings: HoldingRow[] = [];
  const deltas: HoldingDelta[] = [];
  const warnings: string[] = [];
  const quarterVotes = new Map<string, number>();
  let fundsIngested = 0;

  for (const fund of FUNDS) {
    try {
      const check = await verifyCik(fund.cik, fund.name);
      if (!check.ok) {
        warnings.push(`CIK ${fund.cik} (“${fund.name}”) resolves to “${check.edgarName}” on EDGAR — skipped`);
        continue;
      }
      const quarters = await fetch13fHoldings(fund);
      if (quarters.length < 2) {
        warnings.push(`${fund.name}: only ${quarters.length} 13F-HR filings found — skipped deltas`);
        for (const q of quarters) holdings.push(...q.rows);
        continue;
      }
      const [latest, prior] = quarters as [typeof quarters[0], typeof quarters[0]];
      holdings.push(...latest.rows, ...prior.rows);
      deltas.push(...computeDeltas(prior.rows, latest.rows));
      quarterVotes.set(latest.quarter, (quarterVotes.get(latest.quarter) ?? 0) + 1);
      fundsIngested++;
    } catch (err) {
      warnings.push(`${fund.name}: ${(err as Error).message}`);
    }
  }

  // Funds file on different dates; take the majority latest quarter.
  const latestQuarter = ([...quarterVotes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "2026Q1") as Quarter;
  const [y, q] = latestQuarter.split("Q").map(Number);
  const priorQuarter = (q === 1 ? `${(y as number) - 1}Q4` : `${y}Q${(q as number) - 1}`) as Quarter;

  return { holdings, deltas, latestQuarter, priorQuarter, fundsIngested, warnings };
}
