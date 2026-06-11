import { Heatmap } from "@/components/Heatmap";
import { InsiderCard } from "@/components/InsiderCard";
import { FadeIn } from "@/components/FadeIn";
import { SourceTag } from "@/components/SourceTag";
import { getSnapshot } from "@/lib/data/store";
import { sectorFlows, insiderClusters } from "@/lib/data/compute";
import { quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export default async function HomePage() {
  const snap = await getSnapshot();
  const flows = sectorFlows(snap);
  const clusters = insiderClusters(snap).slice(0, 4);
  const hasFast = snap.etfFlows.length > 0;

  return (
    <div className="hero-glow -mx-4 -mt-4 px-4 pt-6">
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">
          Where the smart money moved
        </h1>
        <p className="mt-1 text-sm text-txt2">
          Net institutional flow by sector, {quarterLabel(snap.meta.priorQuarter)} →{" "}
          {quarterLabel(snap.meta.latestQuarter)}
        </p>
      </FadeIn>

      <div className="mt-4 flex gap-2">
        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-accent">
          Slow (13F)
        </span>
        <span
          className="rounded-full border border-edge px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-txt2"
          title={hasFast ? "ETF flow proxy" : "Fast signal arrives in Phase 2 (ETF flow proxy)"}
        >
          Fast (ETF) {hasFast ? "" : "· soon"}
        </span>
      </div>

      <div className="mt-4">
        <Heatmap flows={flows} />
        <SourceTag
          parts={[
            "13F data",
            quarterLabel(snap.meta.latestQuarter),
            "filed up to 45 days after quarter end",
          ]}
        />
      </div>

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
