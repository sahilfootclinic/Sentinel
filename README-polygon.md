# Polygon.io live prices — setup guide (Phase 3)

The Polygon adapter (`src/lib/adapters/polygon.ts`) is a stub: it is wired
into the adapter registry and the `live_prices` table exists, but every
method throws `NOT_IMPLEMENTED` until a key is provided and the streaming
worker is built.

## What it will do

Stream real-time stock quotes over the Polygon WebSocket and keep the
`live_prices` table fresh, so ticker views can show a live price next to the
(lagged) institutional data — clearly labelled as the only live number in
the app.

## Exact setup steps

1. **Get a key** — create an account at <https://polygon.io>, choose a plan
   with WebSocket access (the free tier is REST-only with 5 req/min; live
   streaming needs the Stocks Starter plan or above).

2. **Set the env var** — locally in `.env.local` and on Vercel
   (Project → Settings → Environment Variables):

   ```
   POLYGON_API_KEY=pk_your_key_here
   ```

3. **Implement the adapter** — replace the `fetchSignals` stub in
   `src/lib/adapters/polygon.ts`:
   - Connect to `wss://socket.polygon.io/stocks`.
   - Authenticate: send `{"action":"auth","params":"<POLYGON_API_KEY>"}`.
   - Subscribe to aggregates for tracked tickers:
     `{"action":"subscribe","params":"A.AAPL,A.MSFT,…"}` (tracked tickers
     come from `topMovedTickers()` in `src/lib/data/compute.ts`).
   - On each `A` (per-second aggregate) message, upsert
     `{ ticker, priceUsd: close, updatedAt }` into `live_prices`.

4. **Run it somewhere long-lived** — Vercel serverless functions can't hold
   a WebSocket open. Options, in order of simplicity:
   - A tiny worker on Fly.io / Railway / a VPS running
     `tsx scripts/polygon-stream.ts` (script to be written alongside the
     adapter implementation).
   - Or poll Polygon's REST snapshot endpoint from a Vercel cron every
     minute instead of streaming — worse latency, zero infra.

5. **Surface it** — `tickerView()` already returns everything the ticker
   screen needs; add `live_prices` to the query and render the price with
   the label `"Polygon · live"`. Per the data-honesty rules, everything
   else keeps its lag label.

## Notes

- Never expose the key client-side; all Polygon calls stay server-side.
- Respect plan rate limits; the WebSocket sends a lot of data — subscribe
  only to tracked tickers (~120), not `A.*`.
