import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/db/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("Exchange result:", {
      userId: data?.user?.id,
      error: error?.message,
      code: code?.slice(0, 8) + "...",
    });

    if (!error && data.user) {
      await supabaseAdmin.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name ?? null,
        plan: "free",
      }, {
        onConflict: "id",
        ignoreDuplicates: true,
      });

      return NextResponse.redirect(new URL("/chat", request.url));
    }

    console.error("OAuth error:", error?.message);
  }

  return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
}