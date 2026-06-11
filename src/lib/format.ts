/** Number formatting for the mono data values. */

export function usd(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function signedUsd(value: number): string {
  return value >= 0 ? `+${usd(value)}` : usd(value);
}

import { PCT_NEW, PCT_EXIT } from "@/lib/ingest/deltas";

export function pct(value: number, digits = 1): string {
  if (value >= PCT_NEW) return "NEW";
  if (value <= PCT_EXIT) return "EXIT";
  const v = value * 100;
  return `${v >= 0 ? "+" : ""}${v.toFixed(digits)}%`;
}

export function quarterLabel(q: string): string {
  const [y, n] = q.split("Q");
  return `Q${n} ${y}`;
}

export function dateLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function compactShares(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}
