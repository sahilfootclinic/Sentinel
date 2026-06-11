import { Heatmap } from "@/components/Heatmap";
import { InsiderCard } from "@/components/InsiderCard";
import { MoveRow } from "@/components/MoveRow";
import { ShortPressureRow } from "@/components/ShortPressureRow";
import { FadeIn } from "@/components/FadeIn";
import { SourceTag } from "@/components/SourceTag";
import { getSnapshot } from "@/lib/data/store";
import { sectorFlows, insiderClusters, latestMoves, topShortPressure } from "@/lib/data/compute";
import { quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export default async function DashboardPage() {
  const snap = await getSnapshot();
  const flows = sectorFlows(snap);
  const clusters = insiderClusters(snap);
  const shorts = topShortPressure(snap, 6);
  const moves = latestMoves(snap, 8);
  const hasFast = snap.etfFlows.length > 0;

  return (
    <div className="hero-glow -mx-4 -mt-4 px-4 pt-6">
      {/* ── Section 1: Form 4 — freshest signal (≤2 days) ── */}
      <FadeIn>
        <div className="flex items-center gap-2">
          <h1 className="font-sans text-2xl font-semibold tracking-tight">Insider activity</h1>
          <span className="rounded-full bg-pos/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-pos">
            Live · 2d
          </span>
        </div>
        <p className="mt-1 text-sm text-txt2">
          Open-market buys clustered in the last 30 days
        </p>
      </FadeIn>

      {clusters.length > 0 ? (
        <FadeIn delay={0.05} className="mt-4">
          <div className="flex flex-col gap-2">
            {clusters.slice(0, 5).map((c) => (
              <InsiderCard key={c.ticker} cluster={c} />
            ))}
          </div>
        </FadeIn>
      ) : (
        <FadeIn delay={0.05} className="mt-4">
          <div className="card px-4 py-5 text-center text-sm text-txt2">
            No insider buying clusters in the last 30 days
          </div>
        </FadeIn>
      )}

      {/* ── Section 2: FINRA short pressure (daily) ── */}
      {shorts.length > 0 && (
        <FadeIn delay={0.1} className="mt-8">
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg font-semibold tracking-tight">Short pressure</h2>
            <span className="rounded-full bg-neg/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-neg">
              Daily
            </span>
          </div>
          <p className="mt-1 text-sm text-txt2">Highest short volume as % of daily trading</p>
          <div className="mt-3 flex flex-col gap-2">
            {shorts.map((s) => (
              <ShortPressureRow key={s.ticker} row={s} />
            ))}
          </div>
          <SourceTag parts={["FINRA Reg SHO", "bi-monthly short volume data"]} />
        </FadeIn>
      )}

      {/* ── Section 3: 13F whale moves (45-day lag) ── */}
      <FadeIn delay={0.15} className="mt-8">
        <div className="flex items-center gap-2">
          <h2 className="font-sans text-lg font-semibold tracking-tight">Whale moves</h2>
          <span className="rounded-full border border-edge px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-txt2">
            13F · 45d lag
          </span>
        </div>
        <p className="mt-1 text-sm text-txt2">
          Biggest position changes, {quarterLabel(snap.meta.priorQuarter)} →{" "}
          {quarterLabel(snap.meta.latestQuarter)}
        </p>
        <div className="mt-3 flex flex-col gap-2">
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

      {/* ── Section 4: Sector heatmap ── */}
      <FadeIn delay={0.2} className="mt-8">
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
    </div>
  );
}
