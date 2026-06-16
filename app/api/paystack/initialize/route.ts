import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { getUserById } from "@/lib/db/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { plan } = await req.json();
  if (!plan || !["standard", "premium"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planCode =
    plan === "standard"
      ? process.env.PAYSTACK_STANDARD_PLAN_CODE
      : process.env.PAYSTACK_PREMIUM_PLAN_CODE;

  const amount =
    plan === "standard" ? 500000 : 1500000; // kobo

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/chat`;

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        plan: planCode,
        callback_url: callbackUrl,
        metadata: {
          user_id: session.user.id,
          plan,
        },
      }),
    });

    const data = await res.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ url: data.data.authorization_url });
  } catch (err) {
    console.error("Paystack init error:", err);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}