import Link from "next/link";

export function PlanCard({
  name,
  price,
  features,
  highlight,
  badge,
}: {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}) {
  const plan = name.toLowerCase() as "standard" | "premium";

  return (
    <div
      className={`relative rounded-3xl p-7 ${
        highlight ? "glass-strong shadow-glow glow-ring" : "glass"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-7 px-3 py-1 rounded-full text-xs font-bold gradient-primary text-white shadow-glow-purple">
          {badge}
        </span>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-bold">{name}</h3>
        {highlight && (
          <span className="text-[10px] uppercase tracking-widest text-[var(--neon-green)]">
            Most Popular
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span
              className={`mt-0.5 inline-flex w-4 h-4 rounded-full items-center justify-center ${
                highlight
                  ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)]"
                  : "bg-white/10 text-foreground"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={`/checkout?plan=${plan}`}
        className={`mt-7 block text-center py-3 rounded-xl font-semibold transition ${
          highlight
            ? "gradient-primary text-white shadow-glow-purple hover:opacity-90"
            : "bg-white/10 hover:bg-white/15"
        }`}
      >
        Choose {name}
      </Link>
    </div>
  );
}