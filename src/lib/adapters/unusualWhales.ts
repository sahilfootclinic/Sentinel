import type { Signal } from "@/lib/types";
import { type DataSourceAdapter, NotImplementedError } from "./types";

/** Phase 3 stub — Unusual Whales options / dark-pool flow. */
export const unusualWhalesAdapter: DataSourceAdapter = {
  id: "unusual-whales",
  sourceName: "Unusual Whales options & dark pool flow",
  lagDescription: "intraday",
  isConfigured: () => Boolean(process.env.UNUSUAL_WHALES_API_KEY),
  async fetchSignals(): Promise<Signal[]> {
    throw new NotImplementedError(this.id);
  },
};
