import { NextResponse } from "next/server";
import { fetchForm4Transactions } from "@/lib/adapters/edgarForm4";
import { topMovedTickers } from "@/lib/data/compute";
import { getSnapshot } from "@/lib/data/store";
import { persistSnapshot, logIngestRun } from "@/lib/ingest/persist";
import { checkCronAuth } from "@/lib/ingest/cronAuth";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: Request): Promise<NextResponse> {
  const denied = checkCronAuth(req);
  if (denied) return denied;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const snap = await getSnapshot();
    const targets = topMovedTickers(snap, 20);
    const since = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
    const insiders = [];
    const warnings: string[] = [];
    for (const ticker of targets) {
      try {
        insiders.push(...(await fetchForm4Transactions(ticker, since)));
      } catch (err) {
        warnings.push(`${ticker}: ${(err as Error).message}`);
      }
    }
    await persistSnapshot(db, { ...snap, holdings: [], deltas: snap.deltas, insiders, shortInterest: [], etfFlows: [] });
    await logIngestRun(db, "ingest-form4", true, `${insiders.length} txs across ${targets.length} tickers`);
    return NextResponse.json({ ok: true, transactions: insiders.length, targets, warnings });
  } catch (err) {
    const message = (err as Error).message;
    await logIngestRun(db, "ingest-form4", false, message).catch(() => {});
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
