import { promises as fs } from "fs";
import path from "path";
import { ingest13f } from "@/lib/ingest/ingest13f";
import { fetchForm4Transactions } from "@/lib/adapters/edgarForm4";
import { fetchLatestShortInterest } from "@/lib/adapters/finraShort";
import { topMovedTickers } from "@/lib/data/compute";
import { persistSnapshot } from "@/lib/ingest/persist";
import { getDb } from "@/lib/db/client";
import type { Snapshot } from "@/lib/types";

/**
 * Full real-data seed: EDGAR 13F (2 quarters × ~25 funds) → Form 4 for the
 * top-moved tickers → FINRA short interest. Writes Postgres when
 * DATABASE_URL is set AND refreshes data/snapshot.json so the JSON fallback
 * always matches.
 *
 * Requires outbound access to data.sec.gov, www.sec.gov, efts.sec.gov,
 * api.openfigi.com and cdn.finra.org. Run: npm run seed
 */
async function main(): Promise<void> {
  console.log("→ Ingesting 13F filings (this takes a few minutes at 10 req/s)…");
  const r13f = await ingest13f();
  for (const w of r13f.warnings) console.warn(`  ⚠ ${w}`);
  console.log(
    `  ${r13f.fundsIngested} funds, ${r13f.holdings.length} holdings, ${r13f.deltas.length} deltas ` +
      `(${r13f.priorQuarter} → ${r13f.latestQuarter})`,
  );
  if (r13f.fundsIngested === 0) {
    throw new Error("No funds ingested — refusing to overwrite snapshot. Check EDGAR access.");
  }

  const partial: Snapshot = {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "edgar",
      latestQuarter: r13f.latestQuarter,
      priorQuarter: r13f.priorQuarter,
    },
    funds: [],
    holdings: r13f.holdings,
    deltas: r13f.deltas,
    insiders: [],
    shortInterest: [],
    etfFlows: [],
  };

  const targets = topMovedTickers(partial, 20);
  console.log(`→ Form 4 insider filings for top movers: ${targets.join(", ")}`);
  const since = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  for (const ticker of targets) {
    try {
      partial.insiders.push(...(await fetchForm4Transactions(ticker, since)));
    } catch (err) {
      console.warn(`  ⚠ Form 4 ${ticker}: ${(err as Error).message}`);
    }
  }
  console.log(`  ${partial.insiders.length} insider transactions`);

  console.log("→ FINRA Reg SHO short interest…");
  const allTickers = [...new Set(partial.holdings.map((h) => h.ticker).filter((t) => t !== "?"))];
  try {
    partial.shortInterest = await fetchLatestShortInterest(allTickers);
    console.log(`  ${partial.shortInterest.length} short-interest rows`);
  } catch (err) {
    console.warn(`  ⚠ FINRA: ${(err as Error).message}`);
  }

  const db = getDb();
  if (db) {
    console.log("→ Persisting to Postgres…");
    await persistSnapshot(db, partial);
  } else {
    console.log("→ DATABASE_URL not set — skipping Postgres, writing JSON snapshot only.");
  }

  const out = path.join(process.cwd(), "data", "snapshot.json");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify(partial, null, 1));
  console.log(`✓ Seed complete → ${out} (source=edgar)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
