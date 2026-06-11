import { FadeIn } from "@/components/FadeIn";
import { getSnapshot } from "@/lib/data/store";
import { quarterLabel } from "@/lib/format";

export const revalidate = 3600;

const CARD = "card px-4 py-3";

export default async function AboutPage() {
  const snap = await getSnapshot();
  return (
    <div className="flex flex-col gap-4">
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">How Sentinel works</h1>
        <p className="mt-2 text-sm leading-relaxed text-data">
          By the time retail money floods into a sector, the institutional move usually
          happened months earlier. Sentinel watches the public paper trail big investors
          leave behind and surfaces that earlier move.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className={CARD}>
          <h2 className="label">13F filings · slow signal</h2>
          <p className="mt-2 text-sm leading-relaxed text-data">
            Every quarter, funds managing over $100M must disclose their US stock holdings
            to the SEC on Form 13F — but they get up to 45 days after quarter end to do it.
            Sentinel compares the latest two quarters ({quarterLabel(snap.meta.priorQuarter)}{" "}
            → {quarterLabel(snap.meta.latestQuarter)}) across ~25 well-known funds and
            aggregates the changes into sector flows. It&apos;s the most reliable picture of
            institutional positioning, but it is always weeks old. Never treat it as live.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className={CARD}>
          <h2 className="label">Form 4 insider trades</h2>
          <p className="mt-2 text-sm leading-relaxed text-data">
            Company executives and directors must report their own trades within 2 business
            days. One insider buying can mean anything; three or more buying the same stock
            within 30 days is a pattern — Sentinel flags that as a cluster.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className={CARD}>
          <h2 className="label">FINRA short volume</h2>
          <p className="mt-2 text-sm leading-relaxed text-data">
            FINRA publishes how much of each stock&apos;s daily volume was sold short.
            Sentinel ingests it on the 1st and 15th of each month and always shows the
            as-of date. A high ratio means traders are betting against the stock — or
            hedging.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className={CARD}>
          <h2 className="label">ETF flow proxy · fast signal · coming soon</h2>
          <p className="mt-2 text-sm leading-relaxed text-data">
            Daily share creations in the 11 SPDR sector ETFs approximate where money is
            flowing right now, with only a 1-day lag. Less precise than 13F, much fresher.
            Phase 2.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.25}>
        <div className="card border-violet/30 px-4 py-3">
          <h2 className="label text-violet-300">Not financial advice</h2>
          <p className="mt-2 text-sm leading-relaxed text-data">
            Sentinel shows where big investors moved money weeks or months ago. It doesn&apos;t
            know why, it can&apos;t see their hedges or shorts, and it has no idea what they&apos;ll
            do next. Use it to understand positioning, not as a buy list. Do your own
            research before risking money.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
