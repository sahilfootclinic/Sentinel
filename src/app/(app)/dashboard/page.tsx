import { Heatmap } from "@/components/Heatmap";
import { InsiderCard } from "@/components/InsiderCard";
import { MoveRow } from "@/components/MoveRow";
import { FadeIn } from "@/components/FadeIn";
import { SourceTag } from "@/components/SourceTag";
import { getSnapshot } from "@/lib/data/store";
import { sectorFlows, insiderClusters, latestMoves } from "@/lib/data/compute";
import { quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export default async function DashboardPage() {
  const snap = await getSnapshot();
  const flows = sectorFlows(snap);
  const moves = latestMoves(snap, 8);
  const clusters = insiderClusters(snap).slice(0, 4);
  const hasFast = snap.etfFlows.length > 0;

  return (
    <div className="hero-glow -mx-4 -mt-4 px-4 pt-6">
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Latest moves</h1>
        <p className="mt-1 text-sm text-txt2">
          The biggest position changes, {quarterLabel(snap.meta.priorQuarter)} →{" "}
          {quarterLabel(snap.meta.latestQuarter)}
        </p>
      </FadeIn>

      <FadeIn delay={0.05} className="mt-4">
        <div className="flex flex-col gap-2">
          {moves.map((m) => (
            <MoveRow key={`${m.fundCik}-${m.ticker}`} move={m} />
          ))}
        </div>
        <SourceTag
          parts={[
            "13F data",
            quarterLabel(snap.meta.latestQuarter),
            "filed up to 45 days after quarter end",
          ]}
        />
      </FadeIn>

      <FadeIn delay={0.1} className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-semibold tracking-tight">Sector flows</h2>
          <div className="flex gap-1.5">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-accent">
              Slow (13F)
            </span>
            <span
              className="rounded-full border border-edge px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-txt2"
              title={hasFast ? "ETF flow proxy" : "Fast signal arrives in Phase 2 (ETF flow proxy)"}
            >
              Fast {hasFast ? "" : "· soon"}
            </span>
          </div>
        </div>
        <div className="mt-3">
          <Heatmap flows={flows} />
          <SourceTag
            parts={[
              "13F data",
              quarterLabel(snap.meta.latestQuarter),
              "filed up to 45 days after quarter end",
            ]}
          />
        </div>
      </FadeIn>

      {clusters.length > 0 && (
        <FadeIn delay={0.15} className="mt-8">
          <h2 className="label mb-3">Insider buying clusters</h2>
          <div className="flex flex-col gap-2">
            {clusters.map((c) => (
              <InsiderCard key={c.ticker} cluster={c} />
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
