"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, Field, GoogleButton } from "@/components/edgeiq/auth-shell";
import { createClient } from "@/lib/db/supabase-client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/plans`,
        data: {
          app_name: "EdgeIQ",
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Upsert user into our users table with default free plan
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        plan: "free",
      });

      router.push("/plans");
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start analyzing smarter bet slips in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-foreground font-medium">
            Log in
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
        <Field 
          label="Confirm Password" 
          type="password" 
          placeholder="••••••••" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Creating account…" : "Create account"}
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