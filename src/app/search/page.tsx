import { FadeIn } from "@/components/FadeIn";
import { SearchClient } from "@/components/SearchClient";
import { getSnapshot } from "@/lib/data/store";
import { securityByTicker } from "@/lib/sectors";

export const revalidate = 3600;

export default async function SearchPage() {
  const snap = await getSnapshot();
  const tickers = [...new Set(snap.holdings.map((h) => h.ticker))]
    .filter((t) => t !== "?")
    .sort()
    .map((t) => ({ ticker: t, name: securityByTicker.get(t)?.name ?? t }));
  const funds = snap.funds.map((f) => ({ slug: f.slug, name: f.name }));

  return (
    <div>
      <FadeIn>
        <h1 className="font-sans text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-txt2">Tickers and tracked funds</p>
      </FadeIn>
      <div className="mt-4">
        <SearchClient tickers={tickers} funds={funds} />
      </div>
    </div>
  );
}
