"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/edgeiq/logo";
import { RiskBadge } from "@/components/edgeiq/risk-badge";
import { createClient } from "@/lib/db/supabase-client";
import { useUser } from "@/hooks/use-user";

type AnalysisResult = {
  match: string;
  pick: string;
  risk: "low" | "mid" | "high";
  confidence: number;
  reason: string;
  alternative: string;
};

type AIResponse =
  | { type: "single"; data: AnalysisResult }
  | { type: "slip"; data: AnalysisResult[]; overall_risk: number };

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "ai"; response: AIResponse }
  | { id: string; role: "error"; text: string };

const SUGGESTIONS = [
  "Arsenal vs Chelsea — Arsenal Win",
  "Man City vs Brighton — Over 2.5",
  "Real Madrid vs Barca — BTTS",
  "Barcelona Win\nMan City Win\nPSG Win",
];

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (text: string) => {
    if (!text.trim() || thinking) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "error", text: data.error ?? "Analysis failed" },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "ai", response: data },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "error", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border glass-strong">
        <div className="p-4"><Logo /></div>
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
            href="/account"
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
          <Link href="/" className="text-xs text-muted-foreground">Exit</Link>
        </header>

        <div className="flex-1 overflow-y-auto pb-36">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              <EmptyState onPick={send} />
            ) : (
              <div className="space-y-5">
                {messages.map((m) => {
                  if (m.role === "user") {
                    return <UserBubble key={m.id}>{m.text}</UserBubble>;
                  }
                  if (m.role === "error") {
                    return (
                      <AIBubble key={m.id}>
                        <p className="text-sm text-[var(--risk-high)]">{m.text}</p>
                      </AIBubble>
                    );
                  }
                  return (
                    <AIBubble key={m.id}>
                      {m.response.type === "single" ? (
                        <AnalysisCard a={m.response.data} />
                      ) : (
                        <SlipAnalysis response={m.response} />
                      )}
                    </AIBubble>
                  );
                })}
                {thinking && (
                  <AIBubble>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
                      Analyzing…
                    </div>
                  </AIBubble>
                )}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 px-4 pb-4 pt-2 bg-background/80 backdrop-blur-md border-t border-border md:border-none">
          <div className="mx-auto max-w-3xl glass-strong rounded-2xl p-3 shadow-glow">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Paste a bet slip, or describe a match… (Shift+Enter for new line)"
              rows={2}
              className="w-full bg-transparent outline-none px-3 py-2 text-sm placeholder:text-muted-foreground resize-none"
            />
            <div className="mt-2 flex items-center justify-end">
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                className="gradient-primary disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-glow-purple flex items-center gap-1.5"
              >
                {thinking ? "Analyzing…" : "Send"}
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
        Paste a slip, describe a match — I'll surface the weak link and suggest safer alternatives.
      </p>
      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="glass rounded-full px-4 py-2 text-xs hover:bg-white/10 hover:shadow-glow transition"
          >
            {s.length > 40 ? s.slice(0, 40) + "…" : s}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] gradient-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-glow-purple whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

function AIBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 shrink-0 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-white">IQ</div>
      <div className="max-w-[88%] glass rounded-2xl rounded-tl-sm px-4 py-3 flex-1">{children}</div>
    </div>
  );
}

function AnalysisCard({ a }: { a: AnalysisResult }) {
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
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${a.confidence}%`,
              background: a.confidence >= 70 ? "var(--risk-low)" : a.confidence >= 45 ? "var(--risk-mid)" : "var(--risk-high)",
            }}
          />
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Reasoning</div>
        <p className="text-sm">{a.reason}</p>
      </div>

      <div className="glass rounded-xl p-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Smart alternative</div>
        <div className="mt-0.5 text-sm font-semibold text-[var(--neon-green)]">{a.alternative}</div>
      </div>
    </div>
  );
}

function SlipAnalysis({ response }: { response: { type: "slip"; data: AnalysisResult[]; overall_risk: number } }) {
  return (
    <div className="space-y-4">
      {/* Overall risk */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Overall Slip Risk</span>
          <span
            className="text-2xl font-extrabold"
            style={{
              color: response.overall_risk >= 70 ? "var(--risk-high)" : response.overall_risk >= 45 ? "var(--risk-mid)" : "var(--risk-low)",
            }}
          >
            {response.overall_risk}%
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${response.overall_risk}%`,
              background: response.overall_risk >= 70 ? "var(--risk-high)" : response.overall_risk >= 45 ? "var(--risk-mid)" : "var(--risk-low)",
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {response.overall_risk >= 70
            ? "Very risky accumulator — consider removing weak legs"
            : response.overall_risk >= 45
            ? "Moderate risk — one or two legs need attention"
            : "Solid slip — good selections overall"}
        </p>
      </div>

      {/* Individual selections */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Selections ({response.data.length} legs)
        </div>
        {response.data.map((a, i) => (
          <div key={i} className="glass rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs font-semibold">{a.match}</div>
                <div className="text-[11px] text-muted-foreground">Pick: {a.pick}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">{a.confidence}%</span>
                <RiskBadge level={a.risk} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{a.reason}</p>
            {a.alternative && (
              <div className="text-xs text-[var(--neon-green)] font-medium">
                → {a.alternative}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}