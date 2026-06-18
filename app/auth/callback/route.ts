// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/db/supabase-client";

// export default function AuthCallbackPage() {
//   const router = useRouter();

//   useEffect(() => {
//     const supabase = createClient();

//     supabase.auth.getSession().then(async ({ data: { session } }) => {
//       if (session?.user) {
//         await supabase.from("users").upsert({
//           id: session.user.id,
//           email: session.user.email,
//           name: session.user.user_metadata?.full_name ?? null,
//           plan: "free",
//         }, {
//           onConflict: "id",
//           ignoreDuplicates: true,
//         });

//         const { data: profile } = await supabase
//           .from("users")
//           .select("plan")
//           .eq("id", session.user.id)
//           .single();

//         if (profile?.plan && profile.plan !== "free") {
//           router.push("/chat");
//         } else {
//           router.push("/plans");
//         }
//       } else {
//         router.push("/login?error=oauth_failed");
//       }
//     });
//   }, [router]);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="flex items-center gap-3 text-muted-foreground text-sm">
//         <span className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
//         Signing you in…
//       </div>
//     </div>
//   );
// }


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

      const { data: profile } = await supabaseAdmin
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

    console.error("OAuth error:", error?.message);
  }

  return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
}