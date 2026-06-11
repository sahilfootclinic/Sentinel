import type { Signal } from "@/lib/types";
import { type DataSourceAdapter, NotImplementedError } from "./types";

/** Phase 3 stub — WhaleWisdom / Fintel aggregated 13F analytics. */
export const whaleWisdomAdapter: DataSourceAdapter = {
  id: "whale-wisdom",
  sourceName: "WhaleWisdom / Fintel",
  lagDescription: "varies by dataset",
  isConfigured: () => Boolean(process.env.WHALEWISDOM_API_KEY),
  async fetchSignals(): Promise<Signal[]> {
    throw new NotImplementedError(this.id);
  },
};
