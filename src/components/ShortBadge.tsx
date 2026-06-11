import type { ShortInterestRow } from "@/lib/types";
import { dateLabel } from "@/lib/format";

/**
 * FINRA short-pressure badge. Ratio is short volume / total volume from the
 * Reg SHO file; >40% reads as elevated pressure.
 */
export function ShortBadge({ row }: { row: ShortInterestRow }) {
  const pctVal = Math.round(row.shortRatio * 100);
  const hot = row.shortRatio >= 0.4;
  return (
    <span
      title={`FINRA bi-monthly short data — as of ${dateLabel(row.asOfDate)}`}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[0.65rem] ${
        hot ? "border-neg/40 bg-neg/10 text-neg" : "border-edge bg-surface text-data"
      }`}
    >
      ⇩ {pctVal}% short
    </span>
  );
}
