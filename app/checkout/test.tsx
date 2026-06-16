"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/edgeiq/logo";
import { Field } from "@/components/edgeiq/auth-shell";

const PLANS: Record<"standard" | "premium", {
  name: string;
  price: string;
  features: string[];
}> = {
  standard: {
    name: "Standard",
    price: "₦5,000",
    features: [
      "AI chat analysis",
      "Match predictions",
      "Risk scoring per game",
      "Confidence scores",
    ],
  },
  premium: {
    name: "Premium",
    price: "₦15,000",
    features: [
      "Everything in Standard",
      "Full bet slip review",
      "Weakest leg detection",
      "Bet code converter",
      "Multi-bookmaker support",
    ],
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");
  const plan: "standard" | "premium" =
    rawPlan === "standard" || rawPlan === "premium" ? rawPlan : "premium";
  const info = PLANS[plan];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Payment initialization failed");
        setLoading(false);
        return;
      }

      // Redirect to Paystack hosted payment page
      window.location.href = data.url;
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="px-6 py-6 max-w-6xl mx-auto flex items-center justify-between">
        <Logo />
        <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground">
          ← Change plan
        </Link>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 grid md:grid-cols-5 gap-6">
        {/* Left — payment action */}
        <div className="md:col-span-3 glass-strong rounded-3xl p-7">
          <p className="text-sm text-[var(--neon-green)] font-semibold uppercase tracking-widest">
            Step 2 of 2
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Complete your payment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You'll be taken to Paystack's secure payment page to enter your card details.
            Your card will be saved for automatic monthly renewal.
          </p>

          <div className="mt-6">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Selected Plan
            </span>
            <div className="mt-1.5 px-4 py-3 rounded-xl glass flex items-center justify-between">
              <span className="font-semibold">{info.name}</span>
              <span className="text-[var(--neon-green)] font-bold">{info.price}/mo</span>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-xs text-[var(--risk-high)] bg-[var(--risk-high)]/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-6 w-full gradient-primary text-white font-semibold py-3.5 rounded-xl shadow-glow-purple hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Redirecting to Paystack…" : `Pay ${info.price} with Paystack`}
          </button>

          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            Payments are processed securely by Paystack. By paying you agree to our terms.
          </p>

          {/* Payment badges */}
          <div className="pt-4 mt-2 border-t border-border flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Powered by</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                <span className="h-5 w-5 rounded-md bg-[#00C3F7] flex items-center justify-center text-white text-[10px] font-black">P</span>
                Paystack
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white text-[#1A1F71] text-[11px] font-extrabold italic tracking-tight shadow-sm">VISA</span>
              <span className="px-2.5 py-1 rounded-md bg-white inline-flex items-center gap-0.5 shadow-sm">
                <span className="h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#F79E1B] -ml-1.5 mix-blend-multiply" />
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[#00C3F7] text-white text-[11px] font-extrabold tracking-tight shadow-sm">paystack</span>
            </div>
          </div>
        </div>

        {/* Right — order summary */}
        <aside className="md:col-span-2 glass rounded-3xl p-7 h-fit">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Order summary</h3>
          <div className="mt-4 flex items-center justify-between">
            <span>{info.name} plan</span>
            <span className="font-semibold">{info.price}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>Billed monthly</span>
            <span>VAT included</span>
          </div>
          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <span className="font-semibold">Total today</span>
            <span className="text-2xl font-extrabold text-gradient">{info.price}</span>
          </div>
          <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
            {info.features.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
            <li>✓ Cancel anytime</li>
            <li>✓ Instant access after payment</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}