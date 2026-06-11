import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { SourceTag } from "@/components/SourceTag";
import { getSnapshot } from "@/lib/data/store";
import { usd, quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export default async function FundsPage() {
  const snap = await getSnapshot();
  const totals = new Map<string, number>();
  for (const h of snap.holdings) {
    if (h.quarter !== snap.meta.latestQuarter) continue;
    totals.set(h.fundCik, (totals.get(h.fundCik) ?? 0) + h.valueUsd);
  }
  const funds = [...snap.funds].sort(
    (a, b) => (totals.get(b.cik) ?? 0) - (totals.get(a.cik) ?? 0),
  );

  return (
    <div>
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Tracked funds</h1>
        <SourceTag
          parts={["13F data", quarterLabel(snap.meta.latestQuarter), "tracked long positions only"]}
        />
      </FadeIn>
      <div className="mt-4 flex flex-col gap-2">
        {funds.map((f, i) => (
          <FadeIn key={f.cik} delay={Math.min(i * 0.02, 0.3)}>
            <Link
              href={`/fund/${f.slug}`}
              className="card card-hover flex items-center justify-between px-3 py-2.5"
            >
              <span className="text-sm font-medium">{f.name}</span>
              <span className="font-mono text-sm text-data">{usd(totals.get(f.cik) ?? 0)}</span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
