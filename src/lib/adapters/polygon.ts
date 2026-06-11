import type { Signal } from "@/lib/types";
import { type DataSourceAdapter, NotImplementedError } from "./types";

/**
 * Phase 3 stub — Polygon.io live prices.
 *
 * When POLYGON_API_KEY is provided this adapter should stream real-time
 * quotes via the Polygon WebSocket (wss://socket.polygon.io/stocks) and
 * upsert into the `live_prices` table. See README-polygon.md for the exact
 * setup steps. All methods throw NOT_IMPLEMENTED until then.
 */
export const polygonAdapter: DataSourceAdapter = {
  id: "polygon",
  sourceName: "Polygon.io live prices",
  lagDescription: "real-time",
  isConfigured: () => Boolean(process.env.POLYGON_API_KEY),
  async fetchSignals(): Promise<Signal[]> {
    throw new NotImplementedError(this.id);
  },
};
