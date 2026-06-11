import Link from "next/link";
import type { Move } from "@/lib/data/compute";
import { signedUsd, pct } from "@/lib/format";

const CHANGE_LABEL: Record<Move["changeType"], string> = {
  new: "NEW",
  exit: "EXIT",
  increase: "ADD",
  decrease: "TRIM",
};

/** One institutional move: fund + ticker + size delta. */
export function MoveRow({ move, showFund = true }: { move: Move; showFund?: boolean }) {
  const positive = move.flowUsd >= 0;
  return (
    <Link
      href={`/ticker/${move.ticker}`}
      className="card card-hover flex items-center justify-between gap-3 px-3 py-2.5"
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-sm font-medium">{move.ticker}</p>
        <p className="truncate text-xs text-txt2">
          {showFund ? move.fundName : move.issuerName}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-mono text-sm font-medium ${positive ? "text-pos" : "text-neg"}`}>
          {signedUsd(move.flowUsd)}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-widest text-data">
          {CHANGE_LABEL[move.changeType]}
          {move.changeType === "increase" || move.changeType === "decrease"
            ? ` ${pct(move.pctChange, 0)}`
            : ""}
        </p>
      </div>
    </Link>
  );
}
