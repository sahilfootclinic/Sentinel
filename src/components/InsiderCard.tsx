import Link from "next/link";
import type { InsiderCluster } from "@/lib/data/compute";
import { usd, dateLabel } from "@/lib/format";
import { SourceTag } from "./SourceTag";

/** "Smart Money Insider" cluster card — ≥3 open-market buys in 30 days. */
export function InsiderCard({ cluster }: { cluster: InsiderCluster }) {
  const latest = cluster.buys.map((b) => b.txDate).sort().reverse()[0] ?? "";
  return (
    <Link href={`/ticker/${cluster.ticker}`} className="card card-hover block px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="label text-violet-300">Smart money insider</p>
          <p className="mt-1 font-mono text-base font-medium">{cluster.ticker}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm font-medium text-pos">{usd(cluster.totalValueUsd)}</p>
          <p className="text-xs text-txt2">{cluster.buys.length} insider buys / 30d</p>
        </div>
      </div>
      <SourceTag parts={["SEC Form 4", `latest ${dateLabel(latest)}`, "filed within 2 days of trade"]} />
    </Link>
  );
}
