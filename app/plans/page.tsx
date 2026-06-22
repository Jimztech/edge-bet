"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/edgeiq/logo";

export default function PlansPage() {
  const router = useRouter();
  const go = (plan: "standard" | "premium") =>
    router.push(`/checkout?plan=${plan}`);

  return (
    <div className="min-h-screen">
      <div className="px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <Logo />
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Sign out
        </Link>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm text-[var(--neon-green)] font-semibold uppercase tracking-widest">
            Step 1 of 2
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">Pick your plan</h1>
          <p className="mt-3 text-muted-foreground">You can upgrade or cancel any time.</p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <PlanBox
            name="Standard"
            price="₦2,500"
            features={[
              "AI chat analysis",
              "Manual bet slip paste",
              "Match predictions",
              "Risk scoring per game",
            ]}
            onSelect={() => go("standard")}
          />
          <PlanBox
            name="Premium"
            price="₦15,000"
            highlight
            badge="Most Powerful"
            features={[
              "Everything in Standard",
              "Paste bookmaker bet codes",
              "Multi-bookmaker compatibility",
              "Advanced slip breakdown",
              "Slip optimization suggestions",
            ]}
            onSelect={() => go("premium")}
          />
        </div>
      </div>
    </div>
  );
}

function PlanBox({
  name,
  price,
  features,
  highlight,
  badge,
  onSelect,
}: {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
  onSelect: () => void;
}) {
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
      <h3 className="text-xl font-bold">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold">{price}</span>
        <span className="text-sm text-muted-foreground">/ month</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span
              className={`mt-0.5 inline-flex w-4 h-4 rounded-full items-center justify-center ${
                highlight
                  ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)]"
                  : "bg-white/10"
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
      <button
        onClick={onSelect}
        className={`mt-7 w-full py-3 rounded-xl font-semibold transition ${
          highlight
            ? "gradient-primary text-white shadow-glow-purple hover:opacity-90"
            : "bg-white/10 hover:bg-white/15"
        }`}
      >
        Choose {name}
      </button>
    </div>
  );
}