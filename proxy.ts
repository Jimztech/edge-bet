import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const isPublic = ["/", "/login", "/signup"].includes(pathname);
  const isPaystackWebhook = pathname === "/api/paystack/webhook";
  const isAuthCallback = pathname === "/auth/callback";

  // Always allow public routes and Paystack webhook
  if (isPublic || isPaystackWebhook || isAuthCallback) {
    // If logged in with a plan and trying to access login/signup, redirect to chat
    if (session && (pathname === "/login" || pathname === "/signup")) {
      const { data: user } = await supabase
        .from("users")
        .select("plan")
        .eq("id", session.user.id)
        .single();

      if (user?.plan && user.plan !== "free") {
        return NextResponse.redirect(new URL("/chat", request.url));
      }
    }
    return response;
  }

  // Not logged in → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Fetch user plan for protected routes
  const { data: user } = await supabase
    .from("users")
    .select("plan, plan_expires_at")
    .eq("id", session.user.id)
    .single();

  const hasActivePlan =
    user?.plan &&
    user.plan !== "free" &&
    (!user.plan_expires_at || new Date(user.plan_expires_at) > new Date());

  // /plans and /checkout — logged in but redirect to chat if already has plan
  if ((pathname === "/plans" || pathname.startsWith("/checkout")) && hasActivePlan) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // /chat — requires active plan, else redirect to /plans
  if (pathname.startsWith("/chat") && !hasActivePlan) {
    return NextResponse.redirect(new URL("/plans", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};