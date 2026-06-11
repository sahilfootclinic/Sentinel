"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TickerItem {
  ticker: string;
  name: string;
}
interface FundItem {
  slug: string;
  name: string;
}

export function SearchClient({
  tickers,
  funds,
}: {
  tickers: TickerItem[];
  funds: FundItem[];
}) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return { tickers: [] as TickerItem[], funds: [] as FundItem[] };
    return {
      tickers: tickers
        .filter(
          (t) =>
            t.ticker.toLowerCase().includes(needle) || t.name.toLowerCase().includes(needle),
        )
        .slice(0, 12),
      funds: funds.filter((f) => f.name.toLowerCase().includes(needle)).slice(0, 6),
    };
  }, [q, tickers, funds]);

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="AAPL, Energy, Berkshire…"
        autoFocus
        className="w-full rounded-xl border border-edge bg-surface px-4 py-3 font-mono text-sm text-txt placeholder:text-txt2 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
      {q.trim() !== "" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-4 flex flex-col gap-4"
        >
          {results.funds.length > 0 && (
            <div>
              <h2 className="label mb-2">Funds</h2>
              <div className="flex flex-col gap-2">
                {results.funds.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/fund/${f.slug}`}
                    className="card card-hover px-3 py-2.5 text-sm font-medium"
                  >
                    {f.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.tickers.length > 0 && (
            <div>
              <h2 className="label mb-2">Tickers</h2>
              <div className="flex flex-col gap-2">
                {results.tickers.map((t) => (
                  <Link
                    key={t.ticker}
                    href={`/ticker/${t.ticker}`}
                    className="card card-hover flex items-center justify-between px-3 py-2.5"
                  >
                    <span className="font-mono text-sm font-medium">{t.ticker}</span>
                    <span className="truncate pl-3 text-xs text-txt2">{t.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.tickers.length === 0 && results.funds.length === 0 && (
            <p className="text-sm text-txt2">
              Nothing matched — Sentinel only tracks securities held by its 25 curated funds.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
