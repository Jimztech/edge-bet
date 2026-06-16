"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/supabase-client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await supabase.from("users").upsert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name ?? null,
          plan: "free",
        }, {
          onConflict: "id",
          ignoreDuplicates: true,
        });

        const { data: profile } = await supabase
          .from("users")
          .select("plan")
          .eq("id", session.user.id)
          .single();

        if (profile?.plan && profile.plan !== "free") {
          router.push("/chat");
        } else {
          router.push("/plans");
        }
      } else {
        router.push("/login?error=oauth_failed");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground text-sm">
        <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
        Signing you in…
      </div>
    </div>
  );
}