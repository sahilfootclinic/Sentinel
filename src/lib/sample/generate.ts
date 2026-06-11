import type {
  HoldingRow,
  InsiderTx,
  Quarter,
  ShortInterestRow,
  Snapshot,
} from "@/lib/types";
import { FUNDS } from "@/lib/config";
import { SECURITIES } from "@/lib/sectors";
import { computeDeltas } from "@/lib/ingest/deltas";

/**
 * Deterministic sample snapshot — used ONLY until real EDGAR data is seeded.
 * The UI shows a clearly-labelled "sample data" banner whenever
 * meta.source === "sample"; per the data-honesty rules this must never be
 * presented as live institutional data.
 */

// mulberry32 — tiny seeded PRNG so the fixture is stable across runs.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PRIOR: Quarter = "2025Q4";
const LATEST: Quarter = "2026Q1";

export function generateSampleSnapshot(now = new Date("2026-06-11")): Snapshot {
  const holdings: HoldingRow[] = [];

  for (const [fi, fund] of FUNDS.entries()) {
    const rand = rng(fi * 7919 + 17);
    const count = 14 + Math.floor(rand() * 14);
    // Stable per-fund subset of the universe.
    const picks = [...SECURITIES]
      .map((s) => ({ s, k: rand() }))
      .sort((a, b) => a.k - b.k)
      .slice(0, count);

    for (const [pi, { s }] of picks.entries()) {
      const baseShares = Math.round((0.2 + rand() * 4) * 1_000_000);
      const price = 30 + rand() * 470;
      const priorValue = Math.round(baseShares * price);
      const roll = rand();

      // ~12% new this quarter, ~10% full exit, ~30% size change >20%, rest stable-ish.
      const isNew = roll < 0.12;
      const isExit = !isNew && roll < 0.22;
      const change = isNew
        ? 1
        : isExit
          ? -1
          : roll < 0.37
            ? 0.25 + rand() * 0.8 // increase >20%
            : roll < 0.52
              ? -(0.25 + rand() * 0.5) // decrease >20%
              : (rand() - 0.5) * 0.2; // within threshold → no signal

      if (!isNew) {
        holdings.push({
          fundCik: fund.cik,
          quarter: PRIOR,
          ticker: s.ticker,
          cusip: s.cusip ?? `SAMPLE${fi}${pi}`,
          issuerName: s.name,
          valueUsd: priorValue,
          shares: baseShares,
        });
      }
      if (!isExit) {
        const latestShares = isNew ? baseShares : Math.max(1, Math.round(baseShares * (1 + change)));
        holdings.push({
          fundCik: fund.cik,
          quarter: LATEST,
          ticker: s.ticker,
          cusip: s.cusip ?? `SAMPLE${fi}${pi}`,
          issuerName: s.name,
          valueUsd: Math.round(latestShares * price * (0.95 + rand() * 0.1)),
          shares: latestShares,
        });
      }
    }
  }

  const deltas = FUNDS.flatMap((fund) =>
    computeDeltas(
      holdings.filter((h) => h.fundCik === fund.cik && h.quarter === PRIOR),
      holdings.filter((h) => h.fundCik === fund.cik && h.quarter === LATEST),
    ),
  );

  // Insider transactions: clusters (≥3 buys/30d) on a few tickers plus scattered noise.
  const insiders: InsiderTx[] = [];
  const irand = rng(424242);
  const clusterTickers = ["NVDA", "XOM", "UNH"];
  const names = [
    ["J. Whitfield", "Chief Executive Officer"],
    ["M. Okafor", "Chief Financial Officer"],
    ["A. Lindqvist", "Director"],
    ["R. Castellanos", "EVP, Operations"],
    ["S. Hargrove", "Director"],
  ] as const;
  const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400_000).toISOString().slice(0, 10);

  for (const ticker of clusterTickers) {
    for (let i = 0; i < 3 + Math.floor(irand() * 2); i++) {
      const [filerName, filerRole] = names[Math.floor(irand() * names.length)] as [string, string];
      insiders.push({
        ticker,
        filerName,
        filerRole,
        txType: "buy",
        shares: Math.round(1000 + irand() * 20000),
        priceUsd: Math.round((50 + irand() * 400) * 100) / 100,
        txDate: iso(Math.floor(irand() * 25)),
        filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany",
      });
    }
  }
  for (const ticker of ["AAPL", "TSLA", "JPM", "META", "CAT", "LLY", "AMZN", "GS"]) {
    const [filerName, filerRole] = names[Math.floor(irand() * names.length)] as [string, string];
    insiders.push({
      ticker,
      filerName,
      filerRole,
      txType: irand() > 0.45 ? "sell" : "buy",
      shares: Math.round(500 + irand() * 15000),
      priceUsd: Math.round((40 + irand() * 500) * 100) / 100,
      txDate: iso(Math.floor(irand() * 28)),
      filingUrl: "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany",
    });
  }

  // Short interest: two bi-monthly observations per ticker → visible trend.
  const shortInterest: ShortInterestRow[] = [];
  const srand = rng(777);
  for (const s of SECURITIES) {
    const base = 0.08 + srand() * 0.35;
    for (const [i, daysAgo] of [17, 3].entries()) {
      const ratio = Math.min(0.6, Math.max(0.02, base + (i === 1 ? (srand() - 0.5) * 0.1 : 0)));
      const totalVolume = Math.round(2_000_000 + srand() * 40_000_000);
      shortInterest.push({
        ticker: s.ticker,
        asOfDate: iso(daysAgo),
        shortVolume: Math.round(totalVolume * ratio),
        totalVolume,
        shortRatio: Math.round(ratio * 1000) / 1000,
      });
    }
  }

  return {
    meta: {
      generatedAt: now.toISOString(),
      source: "sample",
      latestQuarter: LATEST,
      priorQuarter: PRIOR,
    },
    funds: FUNDS,
    holdings,
    deltas,
    insiders,
    shortInterest,
    etfFlows: [],
  };
}
