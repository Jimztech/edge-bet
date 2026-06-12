import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Client-side (use in "use client" components and hooks) ──────────────────
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Server-side (use in Server Components, Route Handlers, Server Actions) ──
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

// ── Admin client (use in route handlers that need elevated access) ───────────
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── DB helpers ───────────────────────────────────────────────────────────────
export async function getUserById(supabaseUserId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", supabaseUserId)
    .single();
  return data;
}

export async function upsertUser(params: {
  id: string;
  email: string;
  name?: string;
}) {
  const { data } = await supabaseAdmin
    .from("users")
    .upsert({ id: params.id, email: params.email, name: params.name })
    .select()
    .single();
  return data;
}

export async function saveAnalysis(params: {
  userId: string;
  type: "match" | "slip" | "convert";
  input: object;
  result: object;
  riskScore?: number;
}) {
  const { data } = await supabaseAdmin
    .from("analyses")
    .insert({
      user_id: params.userId,
      type: params.type,
      input: params.input,
      result: params.result,
      risk_score: params.riskScore,
    })
    .select()
    .single();
  return data;
}

export async function updateUserPlan(
  supabaseUserId: string,
  plan: "standard" | "premium",
  expiresAt: Date
) {
  await supabaseAdmin
    .from("users")
    .update({ plan, plan_expires_at: expiresAt.toISOString() })
    .eq("id", supabaseUserId);
}