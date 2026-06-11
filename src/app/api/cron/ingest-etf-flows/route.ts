import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { etfFlowsAdapter } from "@/lib/adapters/etfFlows";
import { SECTOR_ETFS } from "@/lib/config";
import { etfFlows } from "@/lib/db/schema";
import { logIngestRun } from "@/lib/ingest/persist";
import { checkCronAuth } from "@/lib/ingest/cronAuth";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Phase 2 — daily SPDR sector ETF shares-outstanding snapshot ("Fast
 * Signal"). No-op until ENABLE_ETF_FLOWS=true.
 */
export async function GET(req: Request): Promise<NextResponse> {
  const denied = checkCronAuth(req);
  if (denied) return denied;
  if (!etfFlowsAdapter.isConfigured()) {
    return NextResponse.json({ ok: true, skipped: "ENABLE_ETF_FLOWS not set (Phase 2)" });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }
  try {
    const signals = await etfFlowsAdapter.fetchSignals(SECTOR_ETFS.map((e) => e.etf));
    let written = 0;
    for (const s of signals) {
      // Delta vs the most recent stored observation for this ETF.
      const prev = await db
        .select({ so: etfFlows.sharesOutstanding })
        .from(etfFlows)
        .where(sql`${etfFlows.etf} = ${s.ticker} and ${etfFlows.date} < ${s.asOfDate}`)
        .orderBy(sql`${etfFlows.date} desc`)
        .limit(1);
      await db
        .insert(etfFlows)
        .values({
          etf: s.ticker,
          date: s.asOfDate,
          sharesOutstanding: s.value,
          sharesDelta: prev[0] ? s.value - prev[0].so : 0,
        })
        .onConflictDoUpdate({
          target: [etfFlows.etf, etfFlows.date],
          set: { sharesOutstanding: sql`excluded.shares_outstanding`, sharesDelta: sql`excluded.shares_delta` },
        });
      written++;
    }
    await logIngestRun(db, "ingest-etf-flows", true, `${written} ETFs`);
    return NextResponse.json({ ok: true, written });
  } catch (err) {
    const message = (err as Error).message;
    await logIngestRun(db, "ingest-etf-flows", false, message).catch(() => {});
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
