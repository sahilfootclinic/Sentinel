/**
 * Data-honesty label: every panel shows source + as-of date + lag in plain
 * English. Non-negotiable per the product spec.
 */
export function SourceTag({ parts }: { parts: string[] }) {
  return <p className="label mt-2">{parts.join(" · ")}</p>;
}
