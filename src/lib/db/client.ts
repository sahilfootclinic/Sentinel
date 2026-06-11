import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | null | undefined;

/**
 * Returns the Drizzle/Neon client, or null when DATABASE_URL is not set.
 * Callers must handle null — the app falls back to the committed JSON
 * snapshot so it works before Neon is provisioned.
 */
export function getDb(): Db | null {
  if (_db !== undefined) return _db;
  const url = process.env.DATABASE_URL;
  _db = url ? drizzle(neon(url), { schema }) : null;
  return _db;
}
