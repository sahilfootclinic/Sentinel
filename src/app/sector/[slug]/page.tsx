import { notFound } from "next/navigation";
import { FadeIn } from "@/components/FadeIn";
import { MoveRow } from "@/components/MoveRow";
import { InsiderCard } from "@/components/InsiderCard";
import { ShortBadge } from "@/components/ShortBadge";
import { SourceTag } from "@/components/SourceTag";
import { getSnapshot } from "@/lib/data/store";
import {
  sectorFlows,
  sectorMoves,
  insiderClusters,
  latestShortRatio,
} from "@/lib/data/compute";
import { sectorBySlug, sectorSlug, sectorOf } from "@/lib/sectors";
import { GICS_SECTORS } from "@/lib/types";
import { signedUsd, quarterLabel, dateLabel } from "@/lib/format";

export const revalidate = 3600;

export function generateStaticParams() {
  return GICS_SECTORS.map((s) => ({ slug: sectorSlug(s) }));
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sector = sectorBySlug.get(slug);
  if (!sector) notFound();

  const snap = await getSnapshot();
  const flow = sectorFlows(snap).find((f) => f.sector === sector);
  const { buys, exits } = sectorMoves(snap, sector);
  const clusters = insiderClusters(snap).filter((c) => sectorOf(c.ticker) === sector);
  const shortRows = [...new Set([...buys, ...exits].map((m) => m.ticker))]
    .map((t) => latestShortRatio(snap, t))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .sort((a, b) => b.shortRatio - a.shortRatio)
    .slice(0, 6);

  return (
    <div>
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">{sector}</h1>
        {flow && (
          <p className={`mt-1 font-mono text-sm ${flow.netFlowUsd >= 0 ? "text-pos" : "text-neg"}`}>
            {flow.netFlowUsd >= 0 ? "↑" : "↓"} {signedUsd(flow.netFlowUsd)} net institutional flow
          </p>
        )}
        <SourceTag
          parts={["13F data", quarterLabel(snap.meta.latestQuarter), "filed up to 45 days after quarter end"]}
        />
      </FadeIn>

      <FadeIn delay={0.05} className="mt-6">
        <h2 className="label mb-3">Top institutional buys</h2>
        <div className="flex flex-col gap-2">
          {buys.length === 0 && <p className="text-sm text-txt2">No significant buys this quarter.</p>}
          {buys.map((m) => (
            <MoveRow key={`${m.fundCik}-${m.ticker}`} move={m} />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-6">
        <h2 className="label mb-3">Top exits & trims</h2>
        <div className="flex flex-col gap-2">
          {exits.length === 0 && <p className="text-sm text-txt2">No significant exits this quarter.</p>}
          {exits.map((m) => (
            <MoveRow key={`${m.fundCik}-${m.ticker}`} move={m} />
          ))}
        </div>
      </FadeIn>

      {clusters.length > 0 && (
        <FadeIn delay={0.15} className="mt-6">
          <h2 className="label mb-3">Insider signal</h2>
          <div className="flex flex-col gap-2">
            {clusters.map((c) => (
              <InsiderCard key={c.ticker} cluster={c} />
            ))}
          </div>
        </FadeIn>
      )}

      {shortRows.length > 0 && (
        <FadeIn delay={0.2} className="mt-6">
          <h2 className="label mb-3">Short pressure</h2>
          <div className="flex flex-wrap gap-2">
            {shortRows.map((r) => (
              <span key={r.ticker} className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-txt">{r.ticker}</span>
                <ShortBadge row={r} />
              </span>
            ))}
          </div>
          <SourceTag
            parts={[
              "FINRA bi-monthly short data",
              `as of ${dateLabel(shortRows[0]!.asOfDate)}`,
            ]}
          />
        </FadeIn>
      )}
    </div>
  );
}
