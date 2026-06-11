import { NextResponse } from "next/server";

/**
 * Vercel Cron invokes routes with `Authorization: Bearer ${CRON_SECRET}`.
 * Without CRON_SECRET set the routes stay open (local/dev) — set it in
 * production so outsiders can't trigger ingestion.
 */
export function checkCronAuth(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null;
  if (req.headers.get("authorization") === `Bearer ${secret}`) return null;
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}
