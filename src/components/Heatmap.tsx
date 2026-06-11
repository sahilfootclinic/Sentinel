"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { SectorFlow } from "@/lib/data/compute";
import { sectorSlug } from "@/lib/sectors";

const SHORT_NAMES: Record<string, string> = {
  "Information Technology": "Tech",
  "Communication Services": "Comms",
  "Consumer Discretionary": "Discretionary",
  "Consumer Staples": "Staples",
  "Health Care": "Health",
  "Real Estate": "Real Estate",
};

/**
 * Hero sector heatmap: 11 GICS cells, translucent fill coloured by relative
 * flow intensity with a soft glow — no hard borders per the design system.
 */
export function Heatmap({ flows }: { flows: SectorFlow[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {flows.map((f, i) => {
        const up = f.netFlowUsd >= 0;
        const alpha = 0.08 + Math.abs(f.intensity) * 0.3;
        const rgb = up ? "16,185,129" : "239,68,68";
        return (
          <motion.div
            key={f.sector}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
          >
            <Link
              href={`/sector/${sectorSlug(f.sector)}`}
              className="flex aspect-square flex-col justify-between rounded-xl p-2.5 transition-transform active:scale-95"
              style={{
                background: `rgba(${rgb},${alpha})`,
                boxShadow: `0 0 ${12 + Math.abs(f.intensity) * 20}px rgba(${rgb},${alpha * 0.8})`,
              }}
            >
              <span className="text-[0.7rem] font-medium leading-tight text-txt">
                {SHORT_NAMES[f.sector] ?? f.sector}
              </span>
              <span
                className={`font-mono text-xs font-medium ${up ? "text-pos" : "text-neg"}`}
              >
                {up ? "↑" : "↓"} {(Math.abs(f.pctDelta) * 100).toFixed(1)}%
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
