import { promises as fs } from "fs";
import path from "path";
import { generateSampleSnapshot } from "@/lib/sample/generate";

async function main(): Promise<void> {
  const snap = generateSampleSnapshot();
  const out = path.join(process.cwd(), "data", "snapshot.json");
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify(snap, null, 1));
  console.log(
    `Wrote ${out}: ${snap.holdings.length} holdings, ${snap.deltas.length} deltas, ` +
      `${snap.insiders.length} insider txs, ${snap.shortInterest.length} short-interest rows (source=sample)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
