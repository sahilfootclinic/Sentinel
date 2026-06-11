import { sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import * as t from "@/lib/db/schema";
import { FUNDS } from "@/lib/config";
import { SECURITIES } from "@/lib/sectors";
import type { Snapshot } from "@/lib/types";

const CHUNK = 500;

function chunks<T>(rows: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += CHUNK) out.push(rows.slice(i, i + CHUNK));
  return out;
}

/**
 * Idempotent persistence of a full snapshot into Postgres. Every write is an
 * upsert on the natural key, so re-running any ingestion job never
 * duplicates rows.
 */
export async function persistSnapshot(db: Db, snap: Snapshot): Promise<void> {
  await db
    .insert(t.funds)
    .values(FUNDS.map((f) => ({ cik: f.cik, name: f.name, slug: f.slug })))
    .onConflictDoUpdate({ target: t.funds.cik, set: { name: sql`excluded.name` } });

  await db
    .insert(t.securities)
    .values(SECURITIES.map((s) => ({ ticker: s.ticker, name: s.name, sector: s.sector, cusip: s.cusip ?? null })))
    .onConflictDoUpdate({ target: t.securities.ticker, set: { sector: sql`excluded.sector` } });

  for (const batch of chunks(snap.holdings)) {
    await db
      .insert(t.holdingSnapshots)
      .values(batch)
      .onConflictDoUpdate({
        target: [t.holdingSnapshots.fundCik, t.holdingSnapshots.quarter, t.holdingSnapshots.cusip],
        set: {
          valueUsd: sql`excluded.value_usd`,
          shares: sql`excluded.shares`,
          ticker: sql`excluded.ticker`,
        },
      });
  }

  // Deltas are derived data scoped to the current quarter pair — replace
  // wholesale (skipped when empty so partial jobs can't wipe them).
  if (snap.deltas.length > 0) {
    await db.delete(t.holdings);
    for (const batch of chunks(snap.deltas)) {
      await db.insert(t.holdings).values(batch);
    }
  }

  if (snap.insiders.length > 0) {
    const rows = snap.insiders.map((i) => ({
      id: `${i.filingUrl}#${i.txDate}#${i.filerName}#${i.shares}`,
      ...i,
    }));
    for (const batch of chunks(rows)) {
      await db.insert(t.insiderTransactions).values(batch).onConflictDoNothing();
    }
  }

  if (snap.shortInterest.length > 0) {
    for (const batch of chunks(snap.shortInterest)) {
      await db
        .insert(t.shortInterest)
        .values(batch)
        .onConflictDoUpdate({
          target: [t.shortInterest.ticker, t.shortInterest.asOfDate],
          set: {
            shortVolume: sql`excluded.short_volume`,
            totalVolume: sql`excluded.total_volume`,
            shortRatio: sql`excluded.short_ratio`,
          },
        });
    }
  }

  if (snap.etfFlows.length > 0) {
    for (const batch of chunks(snap.etfFlows)) {
      await db
        .insert(t.etfFlows)
        .values(batch)
        .onConflictDoUpdate({
          target: [t.etfFlows.etf, t.etfFlows.date],
          set: {
            sharesOutstanding: sql`excluded.shares_outstanding`,
            sharesDelta: sql`excluded.shares_delta`,
          },
        });
    }
  }
}

export async function logIngestRun(db: Db, job: string, ok: boolean, detail?: string): Promise<void> {
  await db.insert(t.ingestRuns).values({ job, ok: ok ? 1 : 0, detail: detail ?? null });
}
