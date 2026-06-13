import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert user into our users table in case it's their first Google login
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name ?? null,
        plan: "free",
      }, {
        onConflict: "id",
        ignoreDuplicates: true, // don't overwrite existing plan on re-login
      });

      // Check their plan and route accordingly
      const { data: profile } = await supabase
        .from("users")
        .select("plan")
        .eq("id", data.user.id)
        .single();

      if (profile?.plan && profile.plan !== "free") {
        return NextResponse.redirect(new URL("/chat", request.url));
      } else {
        return NextResponse.redirect(new URL("/plans", request.url));
      }
    }
  }

  // Something went wrong — send back to login with error
  return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
}