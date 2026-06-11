import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { SourceTag } from "@/components/SourceTag";
import { Avatar } from "@/components/Avatar";
import { getSnapshot } from "@/lib/data/store";
import { FUNDS } from "@/lib/config";
import { usd, quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export default async function FundsPage() {
  const snap = await getSnapshot();
  const latestTotals = new Map<string, number>();
  const priorTotals = new Map<string, number>();
  for (const h of snap.holdings) {
    const m = h.quarter === snap.meta.latestQuarter ? latestTotals : priorTotals;
    m.set(h.fundCik, (m.get(h.fundCik) ?? 0) + h.valueUsd);
  }
  const funds = [...FUNDS].sort(
    (a, b) => (latestTotals.get(b.cik) ?? 0) - (latestTotals.get(a.cik) ?? 0),
  );

  return (
    <div>
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">The whales</h1>
        <SourceTag
          parts={["13F data", quarterLabel(snap.meta.latestQuarter), "tracked long positions only"]}
        />
      </FadeIn>
      <div className="mt-4 flex flex-col gap-2">
        {funds.map((f, i) => {
          const latest = latestTotals.get(f.cik) ?? 0;
          const prior = priorTotals.get(f.cik) ?? 0;
          const shift = prior > 0 ? (latest - prior) / prior : 0;
          return (
            <FadeIn key={f.cik} delay={Math.min(i * 0.02, 0.3)}>
              <Link
                href={`/fund/${f.slug}`}
                className="card card-hover flex items-center gap-3 px-3.5 py-3"
              >
                <Avatar name={f.manager} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{f.manager}</p>
                  <p className="truncate text-xs text-txt2">{f.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold">{usd(latest)}</p>
                  {prior > 0 && (
                    <p
                      className={`font-mono text-[0.65rem] ${
                        shift >= 0 ? "text-pos" : "text-neg"
                      }`}
                    >
                      {shift >= 0 ? "▲" : "▼"} {(Math.abs(shift) * 100).toFixed(1)}% QoQ
                    </p>
                  )}
                </div>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
