/** Monogram avatar with a deterministic gradient per name — Autopilot-style. */

const GRADIENTS = [
  "linear-gradient(135deg, #4F8EF7, #7C3AED)",
  "linear-gradient(135deg, #10B981, #4F8EF7)",
  "linear-gradient(135deg, #7C3AED, #EF4444)",
  "linear-gradient(135deg, #F59E0B, #EF4444)",
  "linear-gradient(135deg, #06B6D4, #10B981)",
  "linear-gradient(135deg, #EC4899, #7C3AED)",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls =
    size === "lg"
      ? "h-14 w-14 text-lg"
      : size === "sm"
        ? "h-8 w-8 text-[0.65rem]"
        : "h-10 w-10 text-xs";
  return (
    <span
      aria-hidden
      className={`${cls} flex shrink-0 items-center justify-center rounded-full font-sans font-semibold text-white`}
      style={{ background: GRADIENTS[hash(name) % GRADIENTS.length] }}
    >
      {initials}
    </span>
  );
}
