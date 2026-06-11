import { NextResponse } from "next/server";
import { ingest13f } from "@/lib/ingest/ingest13f";
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
    return NextResponse.json(
      { error: "DATABASE_URL not configured — run `npm run seed` locally instead" },
      { status: 503 },
    );
  }
  try {
    const r = await ingest13f();
    await persistSnapshot(db, {
      meta: {
        generatedAt: new Date().toISOString(),
        source: "edgar",
        latestQuarter: r.latestQuarter,
        priorQuarter: r.priorQuarter,
      },
      funds: [],
      holdings: r.holdings,
      deltas: r.deltas,
      insiders: [],
      shortInterest: [],
      etfFlows: [],
    });
    await logIngestRun(db, "ingest-13f", true, `${r.fundsIngested} funds; ${r.warnings.length} warnings`);
    return NextResponse.json({
      ok: true,
      fundsIngested: r.fundsIngested,
      holdings: r.holdings.length,
      deltas: r.deltas.length,
      warnings: r.warnings,
    });
  } catch (err) {
    const message = (err as Error).message;
    await logIngestRun(db, "ingest-13f", false, message).catch(() => {});
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
