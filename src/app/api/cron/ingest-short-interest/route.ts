import { NextResponse } from "next/server";
import { fetchLatestShortInterest } from "@/lib/adapters/finraShort";
import { getSnapshot } from "@/lib/data/store";
import { persistSnapshot, logIngestRun } from "@/lib/ingest/persist";
import { checkCronAuth } from "@/lib/ingest/cronAuth";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request): Promise<NextResponse> {
  const denied = checkCronAuth(req);
  if (denied) return denied;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const snap = await getSnapshot();
    const tickers = [...new Set(snap.holdings.map((h) => h.ticker).filter((t) => t !== "?"))];
    const rows = await fetchLatestShortInterest(tickers);
    await persistSnapshot(db, { ...snap, holdings: [], deltas: [], insiders: [], shortInterest: rows, etfFlows: [] });
    await logIngestRun(db, "ingest-short-interest", true, `${rows.length} rows as of ${rows[0]?.asOfDate ?? "?"}`);
    return NextResponse.json({ ok: true, rows: rows.length, asOf: rows[0]?.asOfDate ?? null });
  } catch (err) {
    const message = (err as Error).message;
    await logIngestRun(db, "ingest-short-interest", false, message).catch(() => {});
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
