import type { Signal } from "@/lib/types";

/**
 * Every data source plugs in behind this interface so sources are swappable.
 * Adapters fetch from their upstream and normalise into the shared Signal
 * shape; they never touch the database — ingestion jobs own persistence.
 */
export interface DataSourceAdapter {
  /** Stable identifier, e.g. "edgar-13f". */
  readonly id: string;
  /** Human-readable source label shown in the UI, e.g. "SEC EDGAR 13F". */
  readonly sourceName: string;
  /** Plain-English lag description, e.g. "filed up to 45 days after quarter end". */
  readonly lagDescription: string;
  /** True when required config (API keys etc.) is present. */
  isConfigured(): boolean;
  /** Fetch and normalise the latest data for the given tickers (or all). */
  fetchSignals(tickers?: string[]): Promise<Signal[]>;
}

export class NotImplementedError extends Error {
  constructor(adapterId: string) {
    super(`NOT_IMPLEMENTED: adapter "${adapterId}" is a Phase 3 stub`);
    this.name = "NotImplementedError";
  }
}
