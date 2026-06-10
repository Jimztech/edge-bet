"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, Field, GoogleButton } from "@/components/edgeiq/auth-shell";

export default function SignupPage() {
  const router = useRouter();

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
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/plans");
        }}
      >
        <Field label="Email" type="email" placeholder="you@email.com" />
        <Field label="Password" type="password" placeholder="••••••••" />
        <Field label="Confirm Password" type="password" placeholder="••••••••" />
        <button
          type="submit"
          className="w-full gradient-primary text-white font-semibold py-3 rounded-xl shadow-glow-purple hover:opacity-90 transition"
        >
          Create account
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" /> OR{" "}
        <div className="flex-1 h-px bg-border" />
      </div>
      <GoogleButton label="Continue with Google" />
    </AuthShell>
  );
}