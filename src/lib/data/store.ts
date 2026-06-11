import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import * as t from "@/lib/db/schema";
import { FUNDS } from "@/lib/config";
import type { HoldingChangeType, Quarter, Snapshot } from "@/lib/types";

const SNAPSHOT_PATH = path.join(process.cwd(), "data", "snapshot.json");

async function readJsonSnapshot(): Promise<Snapshot> {
  const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
  return JSON.parse(raw) as Snapshot;
}

async function readDbSnapshot(): Promise<Snapshot | null> {
  const db = getDb();
  if (!db) return null;
  const holdings = await db.select().from(t.holdingSnapshots);
  if (holdings.length === 0) return null; // empty DB → fall back to JSON

  const [deltas, insiders, shorts, flows] = await Promise.all([
    db.select().from(t.holdings),
    db.select().from(t.insiderTransactions).orderBy(desc(t.insiderTransactions.txDate)),
    db.select().from(t.shortInterest),
    db.select().from(t.etfFlows),
  ]);

  const quarters = [...new Set(holdings.map((h) => h.quarter))].sort().reverse();
  const latestQuarter = (quarters[0] ?? "2026Q1") as Quarter;
  const priorQuarter = (quarters[1] ?? quarters[0] ?? "2025Q4") as Quarter;

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "edgar",
      latestQuarter,
      priorQuarter,
    },
    funds: FUNDS,
    holdings: holdings.map((h) => ({ ...h, quarter: h.quarter as Quarter })),
    deltas: deltas.map((d) => ({ ...d, changeType: d.changeType as HoldingChangeType })),
    insiders: insiders.map((row) => {
      const { id: _omitted, ...i } = row;
      void _omitted;
      return { ...i, txType: i.txType as "buy" | "sell" };
    }),
    shortInterest: shorts,
    etfFlows: flows.map((f) => ({
      ...f,
      sector: "Unknown" as never, // enriched at read time from SECTOR_ETFS
    })),
  };
}

/**
 * The single entry point the UI uses for data. Postgres when DATABASE_URL is
 * set and seeded; otherwise the committed JSON snapshot, so the app never
 * renders empty. Deduplicated per request via React cache.
 */
export const getSnapshot = cache(async (): Promise<Snapshot> => {
  try {
    const fromDb = await readDbSnapshot();
    if (fromDb) return fromDb;
  } catch (err) {
    console.warn(`DB snapshot unavailable, using JSON fallback: ${(err as Error).message}`);
  }
  return readJsonSnapshot();
});
