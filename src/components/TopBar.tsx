import Link from "next/link";
import { dateLabel } from "@/lib/format";

export function TopBar({ generatedAt }: { generatedAt: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-edge bg-bg/85 px-4 py-3 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(79,142,247,0.8)]"
        />
        <span className="font-sans text-sm font-semibold tracking-tight">SENTINEL</span>
      </Link>
      <span className="label">upd {dateLabel(generatedAt.slice(0, 10))}</span>
    </header>
  );
}
