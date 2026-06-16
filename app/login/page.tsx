"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, Field, GoogleButton } from "@/components/edgeiq/auth-shell";
import { createClient } from "@/lib/db/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Check plan — proxy/middleware will also enforce this,
      // but we do it here for an instant redirect without a round trip
      const { data: profile } = await supabase
        .from("users")
        .select("plan")
        .eq("id", data.user.id)
        .single();

      if (profile?.plan && profile.plan !== "free") {
        router.push("/chat");
      } else {
        router.push("/plans");
      }
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your EdgeIQ workspace."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-foreground font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <Field 
          label="Email" 
          type="email" 
          placeholder="you@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-xs text-[var(--risk-high)] bg-[var(--risk-high)]/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full gradient-primary text-white font-semibold py-3 rounded-xl shadow-glow-purple hover:opacity-90 transition"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" /> OR{" "}
        <div className="flex-1 h-px bg-border" />
      </div>
      <GoogleButton label="Continue with Google" onClick={handleGoogle} />
    </AuthShell>
  );
}