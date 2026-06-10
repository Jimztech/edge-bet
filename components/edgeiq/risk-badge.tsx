export function RiskBadge({ level }: { level: "low" | "mid" | "high" }) {
  const map = {
    low: { c: "var(--risk-low)", t: "Low Risk" },
    mid: { c: "var(--risk-mid)", t: "Medium Risk" },
    high: { c: "var(--risk-high)", t: "High Risk" },
  }[level];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: `color-mix(in oklab, ${map.c} 18%, transparent)`,
        color: map.c,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: map.c }} />
      {map.t}
    </span>
  );
}