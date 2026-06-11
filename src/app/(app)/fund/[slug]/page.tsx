import { notFound } from "next/navigation";
import { FadeIn } from "@/components/FadeIn";
import { Avatar } from "@/components/Avatar";
import { MoveRow } from "@/components/MoveRow";
import { SourceTag } from "@/components/SourceTag";
import { SectorShiftChart } from "@/components/charts/SectorShiftChart";
import { getSnapshot } from "@/lib/data/store";
import { fundOverview } from "@/lib/data/compute";
import { fundBySlug, FUNDS } from "@/lib/config";
import { usd, quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export function generateStaticParams() {
  return FUNDS.map((f) => ({ slug: f.slug }));
}

function Section({
  title,
  moves,
  delay,
}: {
  title: string;
  moves: React.ComponentProps<typeof MoveRow>["move"][];
  delay: number;
}) {
  if (moves.length === 0) return null;
  return (
    <FadeIn delay={delay} className="mt-6">
      <h2 className="label mb-3">{title}</h2>
      <div className="flex flex-col gap-2">
        {moves.map((m) => (
          <MoveRow key={m.ticker} move={m} showFund={false} />
        ))}
      </div>
    </FadeIn>
  );
}

export default async function FundPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fund = fundBySlug.get(slug);
  if (!fund) notFound();

  const snap = await getSnapshot();
  const o = fundOverview(snap, fund.cik);

  return (
    <div>
      <FadeIn>
        <div className="flex items-center gap-4">
          <Avatar name={fund.manager} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate font-sans text-2xl font-semibold tracking-tight">
              {fund.manager}
            </h1>
            <p className="truncate text-sm text-txt2">{fund.name}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <div className="card flex-1 px-3.5 py-2.5">
            <p className="label">Tracked</p>
            <p className="mt-1 font-mono text-lg font-semibold">{usd(o.totalLatestUsd)}</p>
          </div>
          <div className="card flex-1 px-3.5 py-2.5">
            <p className="label">QoQ</p>
            <p
              className={`mt-1 font-mono text-lg font-semibold ${
                o.totalLatestUsd >= o.totalPriorUsd ? "text-pos" : "text-neg"
              }`}
            >
              {o.totalPriorUsd > 0
                ? `${o.totalLatestUsd >= o.totalPriorUsd ? "+" : ""}${(
                    ((o.totalLatestUsd - o.totalPriorUsd) / o.totalPriorUsd) * 100
                  ).toFixed(1)}%`
                : "—"}
            </p>
          </div>
        </div>
        <SourceTag
          parts={["13F data", quarterLabel(snap.meta.latestQuarter), "filed up to 45 days after quarter end"]}
        />
      </FadeIn>

      <Section title="Biggest new positions" moves={o.newPositions} delay={0.05} />
      <Section title="Full exits" moves={o.exits} delay={0.1} />
      <Section title="Top increases" moves={o.increases} delay={0.15} />
      <Section title="Top decreases" moves={o.decreases} delay={0.2} />

      <FadeIn delay={0.25} className="mt-6">
        <h2 className="label mb-3">Portfolio shift by sector (QoQ)</h2>
        <div className="card px-3 py-3">
          <SectorShiftChart overview={o} />
        </div>
      </FadeIn>
    </div>
  );
}
