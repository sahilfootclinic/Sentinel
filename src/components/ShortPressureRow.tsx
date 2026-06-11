import Link from "next/link";
import type { ShortInterestRow } from "@/lib/types";
import { securityByTicker } from "@/lib/sectors";
import { dateLabel } from "@/lib/format";

export function ShortPressureRow({ row }: { row: ShortInterestRow }) {
  const security = securityByTicker.get(row.ticker);
  const pct = (row.shortRatio * 100).toFixed(1);
  // 20%+ short ratio is extreme; scale color intensity accordingly
  const intensity = Math.min(row.shortRatio / 0.25, 1);
  const bgAlpha = (0.25 + intensity * 0.55).toFixed(2);

  return (
    <Link
      href={`/ticker/${row.ticker}`}
      className="card card-hover flex items-center gap-3 px-3.5 py-3"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[0.65rem] font-bold text-white"
        style={{ background: `rgba(239, 68, 68, ${bgAlpha})` }}
      >
        {row.ticker.slice(0, 4)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{row.ticker}</p>
        <p className="truncate text-xs text-txt2">{security?.name ?? "—"}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-sm font-semibold text-neg">{pct}% short</p>
        <p className="font-mono text-[0.65rem] text-data">{dateLabel(row.asOfDate)}</p>
      </div>
    </Link>
  );
}
