import Link from "next/link";
import { SiteHeader } from "@/components/edgeiq/site-header";
import { RiskBadge } from "@/components/edgeiq/risk-badge";
import { PlanCard } from "@/components/edgeiq/plan-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EdgeIQ",
  description:
    "AI-powered football bet slip analysis. Detect risk, evaluate predictions, and optimize betting decisions in seconds.",
  openGraph: {
    title: "EdgeIQ — AI Bet Slip Analysis",
    description: "Find the weak link in every bet slip before you place it.",
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <Bookmakers />
      <DemoSection />
      <Features />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pt-16 md:pt-24 pb-20">
      <div
        className="absolute inset-0 -z-10 rounded-[2.5rem] opacity-90"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
            AI decision intelligence · Smarter betting analysis
          </div>
          <h1 className="mt-5 text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            <span className="text-gradient">Find the Weak Link</span>
            <br />
            in Every Bet Slip
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">
            EdgeIQ uses AI to analyze football bets, detect risk, and help you
            make smarter betting decisions in seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl gradient-primary text-white font-semibold shadow-glow-purple hover:scale-[1.02] transition"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M13 2L4.5 13h6l-1.5 9L18 11h-6l1-9z" />
              </svg>
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-strong text-foreground font-semibold hover:bg-white/10 transition"
            >
              Login
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <div>
              <span className="text-foreground font-bold text-base">12k+</span>{" "}
              slips analyzed
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <span className="text-foreground font-bold text-base">3</span>{" "}
              bookmakers
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <span className="text-foreground font-bold text-base">AI</span>{" "}
              risk scoring
            </div>
          </div>
        </div>

        <HeroPreviewCard />
      </div>
    </section>
  );
}

function HeroPreviewCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-[var(--neon-green)] opacity-20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-white to-transparent blur-sm" />
      <div className="relative glass-strong rounded-3xl p-5 shadow-card glow-ring">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Arsenal vs Chelsea</div>
            <div className="text-xs text-muted-foreground">
              Premier League · Slip #4281
            </div>
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-[var(--risk-high)]/15 text-[var(--risk-high)] font-semibold">
            HIGH RISK
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] text-muted-foreground">
          <div>FORM</div>
          <div>H2H</div>
          <div>HOME</div>
          <div>AWAY</div>
        </div>

        <svg viewBox="0 0 320 110" className="mt-2 w-full">
          <defs>
            <linearGradient id="ln" x1="0" x2="1">
              <stop offset="0" stopColor="oklch(0.7 0.18 235)" />
              <stop offset="1" stopColor="oklch(0.65 0.22 295)" />
            </linearGradient>
            <linearGradient id="fl" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="oklch(0.65 0.22 295)" stopOpacity="0.4" />
              <stop offset="1" stopColor="oklch(0.65 0.22 295)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,80 C40,60 70,90 110,55 C150,20 190,70 230,40 C270,15 300,55 320,30 L320,110 L0,110 Z"
            fill="url(#fl)"
          />
          <path
            d="M0,80 C40,60 70,90 110,55 C150,20 190,70 230,40 C270,15 300,55 320,30"
            stroke="url(#ln)"
            strokeWidth="2.5"
            fill="none"
          />
          <circle cx="110" cy="55" r="6" fill="oklch(0.78 0.18 152)" />
          <circle cx="230" cy="40" r="6" fill="oklch(0.65 0.24 25)" />
        </svg>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs">
            <div className="text-muted-foreground">Suggested</div>
            <div className="font-semibold">Double Chance (1X)</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white text-black font-bold text-sm flex items-center gap-2">
            <span className="text-[var(--neon-green)]">●</span>
            Confidence: 72%
          </div>
        </div>
      </div>
    </div>
  );
}

function Bookmakers() {
  const items = [
    { src: "/assets/sporty-bet-logo.jpg", name: "SportyBet" },
    { src: "/assets/betnaija-logo.png", name: "Bet9ja" },
    { src: "/assets/footballdotcom-logo.webp", name: "Football.com" },
  ];
  const loop = [...items, ...items, ...items];

  return (
    <section id="bookmakers" className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-center text-sm text-muted-foreground">
        Analyze slips from your favorite betting platforms
      </p>
      <div
        className="mt-8 relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="flex gap-4 w-max animate-marquee">
          {loop.map((b, i) => (
            <div
              key={`${b.name}-${i}`}
              className="shrink-0 w-56 glass rounded-2xl p-6 flex items-center justify-center h-28 hover:shadow-glow transition group"
            >
              <img
                src={b.src}
                alt={b.name}
                className="max-h-14 max-w-[140px] object-contain grayscale group-hover:grayscale-0 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="mx-auto max-w-5xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          See EdgeIQ in action
        </h2>
        <p className="mt-3 text-muted-foreground">
          A live preview of how our AI breaks down every selection.
        </p>
      </div>

      <div className="mt-10 glass-strong rounded-3xl p-4 md:p-6 shadow-card">
        <div className="space-y-4">
          <ChatBubble role="user">Arsenal vs Chelsea — Arsenal Win</ChatBubble>
          <ChatBubble role="ai">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <RiskBadge level="high" />
                <span className="text-xs text-muted-foreground">
                  Confidence 72%
                </span>
              </div>
              <p className="text-sm">
                Arsenal Win carries elevated risk. Chelsea's defensive form has
                improved over the last 5 matches and they've shown stability in
                away fixtures.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                <div className="glass rounded-xl p-3">
                  <div className="text-muted-foreground">
                    Suggested alternative
                  </div>
                  <div className="font-semibold mt-0.5">Double Chance (1X)</div>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="text-muted-foreground">Or consider</div>
                  <div className="font-semibold mt-0.5">Draw No Bet</div>
                </div>
              </div>
            </div>
          </ChatBubble>
          <ChatBubble role="user">
            Add Man City vs Brighton — Over 2.5
          </ChatBubble>
          <ChatBubble role="ai">
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge level="low" />
              <span className="text-xs text-muted-foreground">
                Confidence 88%
              </span>
              <span className="text-sm">
                Strong pick — both teams averaging 3.1 goals combined per match.
              </span>
            </div>
          </ChatBubble>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({
  role,
  children,
}: {
  role: "user" | "ai";
  children: React.ReactNode;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] gradient-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-glow-purple">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 shrink-0 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-white">
        IQ
      </div>
      <div className="max-w-[85%] glass rounded-2xl rounded-tl-sm px-4 py-3">
        {children}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: "🧠",
      title: "AI Bet Slip Analysis",
      desc: "Paste any slip — our model dissects each leg and gives a verdict.",
    },
    {
      icon: "⚠️",
      title: "Risk Detection Engine",
      desc: "Color-coded scoring exposes the legs dragging your odds down.",
    },
    {
      icon: "🎯",
      title: "Weak Pick Identification",
      desc: "Instantly know which selection is most likely to bust your ticket.",
    },
    {
      icon: "💡",
      title: "Smart Alternatives",
      desc: "Get safer markets like Double Chance, DNB, or Over/Under swaps.",
    },
    {
      icon: "🔗",
      title: "Multi-Bookmaker",
      desc: "Works across SportyBet, Bet9ja, Football.com — paste codes directly.",
    },
    {
      icon: "⚡",
      title: "Sub-second Insights",
      desc: "Optimize your ticket before it ever hits the bookmaker.",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Built for the smart bettor
        </h2>
        <p className="mt-3 text-muted-foreground">
          Premium analytics that turn instinct into edge.
        </p>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="glass rounded-2xl p-6 hover:shadow-glow hover:-translate-y-1 transition group"
          >
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-xl shadow-glow-purple group-hover:scale-110 transition">
              {f.icon}
            </div>
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 py-20">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
          Simple, powerful pricing
        </h2>
        <p className="mt-3 text-muted-foreground">
          Pick the plan that matches your edge.
        </p>
      </div>
      <div className="mt-12 grid md:grid-cols-2 gap-5">
        <PlanCard
          name="Standard"
          price="₦2,500"
          features={[
            "AI chat analysis",
            "Manual bet slip paste",
            "Match predictions",
            "Risk scoring per game",
          ]}
        />
        <PlanCard
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
        />
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <div className="relative glass-strong rounded-3xl p-10 md:p-16 text-center overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter">
          Stop guessing.
          <br />
          Start analyzing with <span className="text-gradient">EdgeIQ</span>.
        </h2>
        <Link
          href="/signup"
          className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-2xl gradient-primary text-white font-semibold shadow-glow-purple hover:scale-[1.02] transition"
        >
          Get Started
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-muted-foreground border-t border-border">
      © {new Date().getFullYear()} EdgeIQ. AI decision intelligence for
      football betting analysis. Not a gambling platform.
    </footer>
  );
}