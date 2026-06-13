"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/edgeiq/logo";
import { RiskBadge } from "@/components/edgeiq/risk-badge";
import { createClient } from "@/lib/db/supabase-client";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";


type Analysis = {
  match: string;
  pick: string;
  risk: "low" | "mid" | "high";
  confidence: number;
  reason: string;
  alternative: string;
};

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; text?: string; analysis?: Analysis };

const SUGGESTIONS = [
  "Arsenal vs Chelsea — Arsenal Win",
  "Man City vs Brighton — Over 2.5",
  "Real Madrid vs Barca — BTTS",
  "Paste my bet code 8H2K1A",
];

const SAMPLE_RESPONSES: Analysis[] = [
  {
    match: "Arsenal vs Chelsea",
    pick: "Arsenal Win",
    risk: "high",
    confidence: 72,
    reason: "Chelsea's defensive form has improved over their last 5 matches and they've shown stability in away fixtures.",
    alternative: "Double Chance (1X) or Draw No Bet",
  },
  {
    match: "Man City vs Brighton",
    pick: "Over 2.5",
    risk: "low",
    confidence: 88,
    reason: "Both sides averaging 3.1 combined goals per match. Man City scoring 2.4 at home; Brighton concedes 1.6 away.",
    alternative: "Stick with Over 2.5 — strong value",
  },
  {
    match: "Real Madrid vs Barcelona",
    pick: "BTTS",
    risk: "mid",
    confidence: 64,
    reason: "El Clásico typically sees both scoring (7 of last 10), but tactical caution from either coach could lower output.",
    alternative: "Over 1.5 goals for safer odds",
  },
  {
    match: "Slip code 8H2K1A",
    pick: "5-leg accumulator",
    risk: "high",
    confidence: 31,
    reason: "Two legs (Leg 2 & Leg 4) have sub-50% confidence. Combined accumulator confidence drops sharply.",
    alternative: "Drop Leg 4 (Inter -1) and replace with Inter Over 1.5",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { profile, user } = useUser();

  const name = profile?.name ?? user?.email ?? "User";
  const initials = getInitials(name);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const analysis = SAMPLE_RESPONSES[messages.length % SAMPLE_RESPONSES.length];
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ai", analysis }]);
      setThinking(false);
    }, 1100);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border glass-strong">
        <div className="p-4">
          <Logo />
        </div>
        <div className="px-3">
          <button
            onClick={() => setMessages([])}
            className="w-full glass rounded-xl py-2.5 text-sm font-medium hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>
        <nav className="mt-6 px-3 space-y-1 text-sm">
          <p className="px-3 text-[10px] uppercase tracking-widest text-muted-foreground">Menu</p>
          {["My Slips", "Predictions", "Risk Monitor", "Bookmakers"].map((x) => (
            <button
              key={x}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition"
            >
              {x}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-3 space-y-2">
          <Link
            href="/accounts"
            className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition"
          >
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{name}</div>
              <div className="text-[11px] text-muted-foreground">Account settings</div>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-[11px] text-muted-foreground hover:text-foreground transition text-center py-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden glass-strong border-b border-border px-4 py-3 flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-xs text-muted-foreground">
            Exit
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              <EmptyState onPick={send} />
            ) : (
              <div className="space-y-5">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <UserBubble key={m.id}>{m.text}</UserBubble>
                  ) : (
                    <AIBubble key={m.id}>
                      {m.analysis && <AnalysisCard a={m.analysis} />}
                    </AIBubble>
                  )
                )}
                {thinking && (
                  <AIBubble>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
                      Analyzing slip…
                    </div>
                  </AIBubble>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="px-4 pb-4 pt-2">
          <div className="mx-auto max-w-3xl glass-strong rounded-2xl p-3 shadow-glow">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste a bet slip, bet code, or describe a match…"
                className="w-full bg-transparent outline-none px-3 py-2 text-sm placeholder:text-muted-foreground"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-full glass text-xs flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)]" /> Auto
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-full glass text-xs text-muted-foreground"
                  >
                    + Attach
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="gradient-primary disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-glow-purple flex items-center gap-1.5"
                >
                  Send
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center text-center pt-10">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full gradient-primary blur-2xl opacity-60 animate-float" />
        <div className="relative w-full h-full rounded-full glass-strong flex items-center justify-center shadow-glow">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-[var(--neon-green)]" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
          </svg>
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold">
        Hey, I'm <span className="text-gradient">EdgeIQ</span>. How can I help you today?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Paste a slip, drop a bet code, or describe a match — I'll surface the weak link and suggest safer alternatives.
      </p>
      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="glass rounded-full px-4 py-2 text-xs hover:bg-white/10 hover:shadow-glow transition"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] gradient-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-glow-purple">
        {children}
      </div>
    </div>
  );
}

function AIBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 shrink-0 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-white">
        IQ
      </div>
      <div className="max-w-[88%] glass rounded-2xl rounded-tl-sm px-4 py-3 flex-1">{children}</div>
    </div>
  );
}

function AnalysisCard({ a }: { a: Analysis }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-sm font-semibold">{a.match}</div>
          <div className="text-xs text-muted-foreground">Pick: {a.pick}</div>
        </div>
        <RiskBadge level={a.risk} />
      </div>

      <div className="glass rounded-xl p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Confidence</span>
          <span className="font-bold">{a.confidence}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${a.confidence}%`,
              background:
                a.confidence >= 75
                  ? "var(--risk-low)"
                  : a.confidence >= 50
                  ? "var(--risk-mid)"
                  : "var(--risk-high)",
            }}
          />
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Reasoning
        </div>
        <p className="text-sm">{a.reason}</p>
      </div>

      <div className="glass rounded-xl p-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Smart alternative
        </div>
        <div className="mt-0.5 text-sm font-semibold text-[var(--neon-green)]">{a.alternative}</div>
      </div>
    </div>
  );
}