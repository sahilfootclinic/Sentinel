import { notFound } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { Avatar } from "@/components/Avatar";
import { SourceTag } from "@/components/SourceTag";
import { ShortBadge } from "@/components/ShortBadge";
import { OwnershipChart } from "@/components/charts/OwnershipChart";
import { getSnapshot } from "@/lib/data/store";
import { tickerView, latestShortRatio } from "@/lib/data/compute";
import { securityByTicker, sectorSlug } from "@/lib/sectors";
import { fundByCik } from "@/lib/config";
import { signedUsd, pct, dateLabel, compactShares, quarterLabel } from "@/lib/format";

export const revalidate = 3600;

export default async function TickerPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol).toUpperCase();
  const snap = await getSnapshot();
  const view = tickerView(snap, ticker);
  const ref = securityByTicker.get(ticker);
  if (!ref && view.ownershipByQuarter.length === 0) notFound();

  const short = latestShortRatio(snap, ticker);
  const shortTrend = view.shortInterest.slice(0, 2);
  const trendDelta =
    shortTrend.length === 2 ? shortTrend[0]!.shortRatio - shortTrend[1]!.shortRatio : null;

  return (
    <div>
      <FadeIn>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-mono text-2xl font-semibold tracking-tight">{ticker}</h1>
            <p className="mt-0.5 text-sm text-txt2">{ref?.name ?? "Unmapped security"}</p>
          </div>
          {short && <ShortBadge row={short} />}
        </div>
        {ref && (
          <Link
            href={`/sector/${sectorSlug(ref.sector)}`}
            className="label mt-2 inline-block text-accent"
          >
            {ref.sector} →
          </Link>
        )}
      </FadeIn>

      <FadeIn delay={0.05} className="mt-6">
        <h2 className="label mb-3">Institutional ownership · tracked funds</h2>
        <div className="card px-3 py-3">
          <OwnershipChart view={view} />
          <SourceTag
            parts={["13F data", quarterLabel(snap.meta.latestQuarter), "filed up to 45 days after quarter end"]}
          />
        </div>
      </FadeIn>

      {view.holders.length > 0 && (
        <FadeIn delay={0.1} className="mt-6">
          <h2 className="label mb-3">Fund moves this quarter</h2>
          <div className="flex flex-col gap-2">
            {view.holders.map((h) => {
              const fund = fundByCik.get(h.fundCik);
              return (
                <Link
                  key={h.fundCik}
                  href={`/fund/${fund?.slug ?? ""}`}
                  className="card card-hover flex items-center gap-3 px-3.5 py-3"
                >
                  <Avatar name={fund?.manager ?? h.fundName} size="sm" src={fund?.photo} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {fund?.manager ?? h.fundName}
                    </p>
                    <p className="truncate text-xs text-txt2">{h.fundName}</p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-sm font-semibold ${
                      h.flowUsd >= 0 ? "text-pos" : "text-neg"
                    }`}
                  >
                    {signedUsd(h.flowUsd)} · {pct(h.pctChange, 0)}
                  </span>
                </Link>
              );
            })}
          </div>
        </FadeIn>
      )}

      {view.insiders.length > 0 && (
        <FadeIn delay={0.15} className="mt-6">
          <h2 className="label mb-3">Insider activity · Form 4</h2>
          <div className="flex flex-col gap-2">
            {view.insiders.slice(0, 8).map((tx, i) => (
              <a
                key={i}
                href={tx.filingUrl}
                target="_blank"
                rel="noreferrer"
                className="card card-hover flex items-center justify-between px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tx.filerName}</p>
                  <p className="truncate text-xs text-txt2">{tx.filerRole}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`font-mono text-sm ${tx.txType === "buy" ? "text-pos" : "text-neg"}`}
                  >
                    {tx.txType === "buy" ? "BUY" : "SELL"} {compactShares(tx.shares)}
                  </p>
                  <p className="font-mono text-[0.65rem] text-data">{dateLabel(tx.txDate)}</p>
                </div>
              </a>
            ))}
          </div>
          <SourceTag parts={["SEC Form 4", "filed within 2 business days of trade"]} />
        </FadeIn>
      )}

      {short && (
        <FadeIn delay={0.2} className="mt-6">
          <h2 className="label mb-3">Short pressure</h2>
          <div className="card px-4 py-3">
            <p className="font-mono text-xl font-medium">
              {(short.shortRatio * 100).toFixed(1)}%
              {trendDelta !== null && (
                <span
                  className={`ml-2 text-sm ${trendDelta >= 0 ? "text-neg" : "text-pos"}`}
                >
                  {trendDelta >= 0 ? "▲" : "▼"} {(Math.abs(trendDelta) * 100).toFixed(1)}pt
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-txt2">
              of daily volume sold short ({compactShares(short.shortVolume)} of{" "}
              {compactShares(short.totalVolume)} shares)
            </p>
            <SourceTag
              parts={["FINRA bi-monthly short data", `as of ${dateLabel(short.asOfDate)}`]}
            />
          </div>
        </FadeIn>
      )}
    </div>
  );
}
