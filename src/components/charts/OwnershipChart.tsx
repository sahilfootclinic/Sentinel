"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { TickerView } from "@/lib/data/compute";
import { quarterLabel, usd } from "@/lib/format";

/** Institutional ownership (tracked funds' $ value) across the last quarters. */
export function OwnershipChart({ view }: { view: TickerView }) {
  const data = view.ownershipByQuarter.map((q) => ({
    name: quarterLabel(q.quarter),
    value: q.valueUsd,
  }));
  if (data.length < 2) {
    return <p className="text-xs text-txt2">Not enough quarters of data yet.</p>;
  }
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748B", fontSize: 10, fontFamily: "var(--font-jetbrains)" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#64748B", fontSize: 9, fontFamily: "var(--font-jetbrains)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => usd(v)}
            width={64}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4F8EF7"
            strokeWidth={2}
            dot={{ fill: "#4F8EF7", r: 3 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
