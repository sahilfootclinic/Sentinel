"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { FundOverview } from "@/lib/data/compute";

const ABBREV: Record<string, string> = {
  "Information Technology": "Tech",
  Financials: "Fin",
  Energy: "Enrg",
  "Health Care": "Hlth",
  "Consumer Discretionary": "Disc",
  "Consumer Staples": "Stpl",
  Industrials: "Indl",
  Materials: "Matl",
  "Real Estate": "RE",
  Utilities: "Util",
  "Communication Services": "Comm",
};

/** QoQ portfolio shift by sector — % point change of portfolio weight. */
export function SectorShiftChart({ overview }: { overview: FundOverview }) {
  const data = overview.sectorShift
    .map((s) => {
      const priorW = overview.totalPriorUsd > 0 ? s.priorUsd / overview.totalPriorUsd : 0;
      const latestW = overview.totalLatestUsd > 0 ? s.latestUsd / overview.totalLatestUsd : 0;
      return { name: ABBREV[s.sector] ?? s.sector, shift: (latestW - priorW) * 100 };
    })
    .filter((d) => Math.abs(d.shift) > 0.05)
    .sort((a, b) => b.shift - a.shift);

  if (data.length === 0) {
    return <p className="text-xs text-txt2">No meaningful sector shift this quarter.</p>;
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -28 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748B", fontSize: 9, fontFamily: "var(--font-jetbrains)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 9, fontFamily: "var(--font-jetbrains)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Bar dataKey="shift" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.shift >= 0 ? "#10B981" : "#EF4444"} fillOpacity={0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
