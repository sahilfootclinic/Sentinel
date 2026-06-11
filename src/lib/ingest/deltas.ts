import type { HoldingDelta, HoldingRow } from "@/lib/types";
import { DELTA_THRESHOLD } from "@/lib/config";

/** Sentinel encoding for "from zero" / "to zero" percentage changes. */
export const PCT_NEW = 9999;
export const PCT_EXIT = -9999;

/**
 * Quarter-over-quarter position changes for one fund.
 * Keeps only the signals the product cares about: new positions, full
 * exits, and size changes beyond ±20% (shares-based, so price moves
 * alone don't trigger a signal).
 */
export function computeDeltas(prior: HoldingRow[], latest: HoldingRow[]): HoldingDelta[] {
  const key = (r: HoldingRow) => (r.ticker !== "?" ? r.ticker : `cusip:${r.cusip}`);
  const priorMap = new Map(prior.map((r) => [key(r), r]));
  const latestMap = new Map(latest.map((r) => [key(r), r]));
  const out: HoldingDelta[] = [];

  for (const [k, l] of latestMap) {
    const p = priorMap.get(k);
    if (!p) {
      out.push({
        fundCik: l.fundCik,
        ticker: l.ticker,
        issuerName: l.issuerName,
        changeType: "new",
        valuePriorUsd: 0,
        valueLatestUsd: l.valueUsd,
        pctChange: PCT_NEW,
      });
      continue;
    }
    if (p.shares === 0) continue;
    const pct = (l.shares - p.shares) / p.shares;
    if (Math.abs(pct) < DELTA_THRESHOLD) continue;
    out.push({
      fundCik: l.fundCik,
      ticker: l.ticker,
      issuerName: l.issuerName,
      changeType: pct > 0 ? "increase" : "decrease",
      valuePriorUsd: p.valueUsd,
      valueLatestUsd: l.valueUsd,
      pctChange: pct,
    });
  }

  for (const [k, p] of priorMap) {
    if (latestMap.has(k)) continue;
    out.push({
      fundCik: p.fundCik,
      ticker: p.ticker,
      issuerName: p.issuerName,
      changeType: "exit",
      valuePriorUsd: p.valueUsd,
      valueLatestUsd: 0,
      pctChange: PCT_EXIT,
    });
  }

  return out;
}
