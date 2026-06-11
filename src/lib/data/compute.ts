import type {
  GicsSector,
  HoldingDelta,
  InsiderTx,
  Quarter,
  ShortInterestRow,
  Snapshot,
} from "@/lib/types";
import { GICS_SECTORS } from "@/lib/types";
import { fundByCik } from "@/lib/config";
import { sectorOf } from "@/lib/sectors";
import {
  INSIDER_CLUSTER_MIN_BUYS,
  INSIDER_CLUSTER_WINDOW_DAYS,
} from "@/lib/config";

export interface SectorFlow {
  sector: GicsSector;
  netFlowUsd: number;
  /** Net flow as % of the sector's prior-quarter institutional value. */
  pctDelta: number;
  /** -1..1 colour intensity relative to the strongest sector move. */
  intensity: number;
  buys: number;
  exits: number;
}

const deltaFlow = (d: HoldingDelta) => d.valueLatestUsd - d.valuePriorUsd;

/** Net institutional flow per GICS sector — the hero heatmap data. */
export function sectorFlows(snap: Snapshot): SectorFlow[] {
  const flows = new Map<GicsSector, { net: number; buys: number; exits: number }>(
    GICS_SECTORS.map((s) => [s, { net: 0, buys: 0, exits: 0 }]),
  );
  for (const d of snap.deltas) {
    const sector = sectorOf(d.ticker);
    if (sector === "Unknown") continue;
    const f = flows.get(sector)!;
    f.net += deltaFlow(d);
    if (d.changeType === "new" || d.changeType === "increase") f.buys++;
    if (d.changeType === "exit") f.exits++;
  }
  const priorBySector = new Map<GicsSector, number>();
  for (const h of snap.holdings) {
    if (h.quarter !== snap.meta.priorQuarter) continue;
    const sector = sectorOf(h.ticker);
    if (sector === "Unknown") continue;
    priorBySector.set(sector, (priorBySector.get(sector) ?? 0) + h.valueUsd);
  }
  const maxAbs = Math.max(1, ...[...flows.values()].map((f) => Math.abs(f.net)));
  return GICS_SECTORS.map((sector) => {
    const f = flows.get(sector)!;
    const prior = priorBySector.get(sector) ?? 0;
    return {
      sector,
      netFlowUsd: f.net,
      pctDelta: prior > 0 ? f.net / prior : 0,
      intensity: f.net / maxAbs,
      buys: f.buys,
      exits: f.exits,
    };
  }).sort((a, b) => b.netFlowUsd - a.netFlowUsd);
}

export interface Move {
  fundCik: string;
  fundName: string;
  ticker: string;
  issuerName: string;
  changeType: HoldingDelta["changeType"];
  flowUsd: number;
  pctChange: number;
}

function toMove(d: HoldingDelta): Move {
  return {
    fundCik: d.fundCik,
    fundName: fundByCik.get(d.fundCik)?.name ?? d.fundCik,
    ticker: d.ticker,
    issuerName: d.issuerName,
    changeType: d.changeType,
    flowUsd: deltaFlow(d),
    pctChange: d.pctChange,
  };
}

/** Top buys (new + increases) and exits within one sector. */
export function sectorMoves(snap: Snapshot, sector: GicsSector, top = 5) {
  const inSector = snap.deltas.filter((d) => sectorOf(d.ticker) === sector);
  const buys = inSector
    .filter((d) => d.changeType === "new" || d.changeType === "increase")
    .sort((a, b) => deltaFlow(b) - deltaFlow(a))
    .slice(0, top)
    .map(toMove);
  const exits = inSector
    .filter((d) => d.changeType === "exit" || d.changeType === "decrease")
    .sort((a, b) => deltaFlow(a) - deltaFlow(b))
    .slice(0, top)
    .map(toMove);
  return { buys, exits };
}

/** The biggest moves across all funds this quarter — the dashboard feed. */
export function latestMoves(snap: Snapshot, top = 10): Move[] {
  return [...snap.deltas]
    .filter((d) => d.ticker !== "?")
    .sort((a, b) => Math.abs(deltaFlow(b)) - Math.abs(deltaFlow(a)))
    .slice(0, top)
    .map(toMove);
}

/** Tickers ranked by absolute institutional flow — drives Form 4 targeting. */
export function topMovedTickers(snap: Snapshot, top = 20): string[] {
  const byTicker = new Map<string, number>();
  for (const d of snap.deltas) {
    if (d.ticker === "?") continue;
    byTicker.set(d.ticker, (byTicker.get(d.ticker) ?? 0) + Math.abs(deltaFlow(d)));
  }
  return [...byTicker.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([ticker]) => ticker);
}

export interface FundOverview {
  newPositions: Move[];
  exits: Move[];
  increases: Move[];
  decreases: Move[];
  sectorShift: { sector: GicsSector; priorUsd: number; latestUsd: number }[];
  totalLatestUsd: number;
  totalPriorUsd: number;
}

export function fundOverview(snap: Snapshot, cik: string, top = 5): FundOverview {
  const deltas = snap.deltas.filter((d) => d.fundCik === cik);
  const pick = (types: HoldingDelta["changeType"][], dir: 1 | -1) =>
    deltas
      .filter((d) => types.includes(d.changeType))
      .sort((a, b) => dir * (deltaFlow(b) - deltaFlow(a)))
      .slice(0, top)
      .map(toMove);

  const shift = new Map<GicsSector, { priorUsd: number; latestUsd: number }>();
  let totalLatestUsd = 0;
  let totalPriorUsd = 0;
  for (const h of snap.holdings) {
    if (h.fundCik !== cik) continue;
    const isLatest = h.quarter === snap.meta.latestQuarter;
    if (isLatest) totalLatestUsd += h.valueUsd;
    else totalPriorUsd += h.valueUsd;
    const sector = sectorOf(h.ticker);
    if (sector === "Unknown") continue;
    const s = shift.get(sector) ?? { priorUsd: 0, latestUsd: 0 };
    if (isLatest) s.latestUsd += h.valueUsd;
    else s.priorUsd += h.valueUsd;
    shift.set(sector, s);
  }
  return {
    newPositions: pick(["new"], 1),
    exits: pick(["exit"], -1),
    increases: pick(["increase"], 1),
    decreases: pick(["decrease"], -1),
    sectorShift: [...shift.entries()]
      .map(([sector, v]) => ({ sector, ...v }))
      .sort((a, b) => b.latestUsd - a.latestUsd),
    totalLatestUsd,
    totalPriorUsd,
  };
}

export interface TickerView {
  ticker: string;
  ownershipByQuarter: { quarter: Quarter; valueUsd: number; funds: number }[];
  holders: Move[];
  insiders: InsiderTx[];
  shortInterest: ShortInterestRow[];
}

export function tickerView(snap: Snapshot, ticker: string): TickerView {
  const byQuarter = new Map<Quarter, { valueUsd: number; funds: Set<string> }>();
  for (const h of snap.holdings) {
    if (h.ticker !== ticker) continue;
    const q = byQuarter.get(h.quarter) ?? { valueUsd: 0, funds: new Set<string>() };
    q.valueUsd += h.valueUsd;
    q.funds.add(h.fundCik);
    byQuarter.set(h.quarter, q);
  }
  return {
    ticker,
    ownershipByQuarter: [...byQuarter.entries()]
      .map(([quarter, v]) => ({ quarter, valueUsd: v.valueUsd, funds: v.funds.size }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter)),
    holders: snap.deltas.filter((d) => d.ticker === ticker).map(toMove),
    insiders: snap.insiders
      .filter((i) => i.ticker === ticker)
      .sort((a, b) => b.txDate.localeCompare(a.txDate)),
    shortInterest: snap.shortInterest
      .filter((s) => s.ticker === ticker)
      .sort((a, b) => b.asOfDate.localeCompare(a.asOfDate)),
  };
}

export interface InsiderCluster {
  ticker: string;
  buys: InsiderTx[];
  totalValueUsd: number;
}

/** ≥3 insider open-market buys on one ticker within 30 days. */
export function insiderClusters(snap: Snapshot): InsiderCluster[] {
  const windowStart = new Date(Date.now() - INSIDER_CLUSTER_WINDOW_DAYS * 86400_000)
    .toISOString()
    .slice(0, 10);
  const byTicker = new Map<string, InsiderTx[]>();
  for (const tx of snap.insiders) {
    if (tx.txType !== "buy" || tx.txDate < windowStart) continue;
    byTicker.set(tx.ticker, [...(byTicker.get(tx.ticker) ?? []), tx]);
  }
  return [...byTicker.entries()]
    .filter(([, buys]) => buys.length >= INSIDER_CLUSTER_MIN_BUYS)
    .map(([ticker, buys]) => ({
      ticker,
      buys,
      totalValueUsd: buys.reduce((s, b) => s + b.shares * b.priceUsd, 0),
    }))
    .sort((a, b) => b.totalValueUsd - a.totalValueUsd);
}

export function latestShortRatio(snap: Snapshot, ticker: string): ShortInterestRow | undefined {
  return snap.shortInterest
    .filter((s) => s.ticker === ticker)
    .sort((a, b) => b.asOfDate.localeCompare(a.asOfDate))[0];
}
