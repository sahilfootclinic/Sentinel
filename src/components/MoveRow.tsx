import Link from "next/link";
import type { Move } from "@/lib/data/compute";
import { fundByCik } from "@/lib/config";
import { Avatar } from "@/components/Avatar";
import { signedUsd, pct } from "@/lib/format";

const VERB: Record<Move["changeType"], string> = {
  new: "Opened",
  exit: "Exited",
  increase: "Added",
  decrease: "Trimmed",
};

function ActionChip({ move }: { move: Move }) {
  const positive = move.changeType === "new" || move.changeType === "increase";
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${
        positive ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
      }`}
    >
      {VERB[move.changeType]}
      {move.changeType === "increase" || move.changeType === "decrease"
        ? ` ${pct(move.pctChange, 0)}`
        : ""}
    </span>
  );
}

/**
 * One institutional move, Autopilot-feed style: the manager as the actor,
 * the trade as the event.
 */
export function MoveRow({ move, showFund = true }: { move: Move; showFund?: boolean }) {
  const manager = fundByCik.get(move.fundCik)?.manager ?? move.fundName;
  return (
    <Link
      href={`/ticker/${move.ticker}`}
      className="card card-hover flex items-center gap-3 px-3.5 py-3"
    >
      {showFund ? (
        <Avatar name={manager} src={fundByCik.get(move.fundCik)?.photo} />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-edge bg-bg font-mono text-[0.65rem] font-medium text-data">
          {move.ticker.slice(0, 4)}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {showFund ? manager : move.ticker}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-txt2">
          <ActionChip move={move} />
          <span className="truncate">
            {showFund ? move.ticker : move.issuerName}
          </span>
        </p>
      </div>
      <p
        className={`shrink-0 font-mono text-sm font-semibold ${
          move.flowUsd >= 0 ? "text-pos" : "text-neg"
        }`}
      >
        {signedUsd(move.flowUsd)}
      </p>
    </Link>
  );
}
