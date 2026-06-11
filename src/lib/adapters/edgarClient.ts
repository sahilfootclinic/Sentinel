import { EDGAR_USER_AGENT, EDGAR_MAX_RPS } from "@/lib/config";

/**
 * Rate-limited fetch for SEC EDGAR. EDGAR returns 403 without a descriptive
 * User-Agent and bans clients exceeding 10 req/s, so all EDGAR traffic goes
 * through this helper.
 */
const minIntervalMs = Math.ceil(1000 / EDGAR_MAX_RPS) + 10;
let lastRequestAt = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const wait = lastRequestAt + minIntervalMs - now;
  lastRequestAt = Math.max(now, lastRequestAt + minIntervalMs);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

export async function edgarFetch(url: string, retries = 2): Promise<Response> {
  await throttle();
  const res = await fetch(url, {
    headers: { "User-Agent": EDGAR_USER_AGENT, "Accept-Encoding": "gzip, deflate" },
  });
  if ((res.status === 429 || res.status >= 500) && retries > 0) {
    await new Promise((r) => setTimeout(r, 2000 * (3 - retries)));
    return edgarFetch(url, retries - 1);
  }
  if (!res.ok) {
    throw new Error(`EDGAR ${res.status} for ${url}`);
  }
  return res;
}

export async function edgarJson<T>(url: string): Promise<T> {
  const res = await edgarFetch(url);
  return (await res.json()) as T;
}

export async function edgarText(url: string): Promise<string> {
  const res = await edgarFetch(url);
  return res.text();
}

export interface EdgarSubmissions {
  cik: string;
  name: string;
  filings: {
    recent: {
      accessionNumber: string[];
      form: string[];
      filingDate: string[];
      reportDate: string[];
      primaryDocument: string[];
    };
  };
}

export function padCik(cik: string | number): string {
  return String(cik).replace(/^0+/, "").padStart(10, "0");
}

export async function fetchSubmissions(cik: string): Promise<EdgarSubmissions> {
  return edgarJson<EdgarSubmissions>(
    `https://data.sec.gov/submissions/CIK${padCik(cik)}.json`,
  );
}

/**
 * Verify a configured CIK by checking the entity name EDGAR returns for it.
 * Our curated CIK list is best-effort; this catches a wrong mapping loudly
 * instead of silently ingesting another entity's filings.
 */
export async function verifyCik(
  cik: string,
  expectedName: string,
): Promise<{ ok: boolean; edgarName: string }> {
  const subs = await fetchSubmissions(cik);
  const edgarName = subs.name ?? "";
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/)[0] ?? "";
  return { ok: norm(edgarName) === norm(expectedName), edgarName };
}
