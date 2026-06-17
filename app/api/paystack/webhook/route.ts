import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/db/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-paystack-signature");

  // Verify webhook authenticity
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");

  if (hash !== sig) {
    console.error("Invalid Paystack webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);
  console.log("Paystack webhook event:", event.event);

  switch (event.event) {
    // First charge or renewal
    case "charge.success": {
      const { metadata, customer } = event.data;
      const userId = metadata?.user_id;
      const plan = metadata?.plan as "standard" | "premium";

      if (!userId || !plan) {
        console.error("Missing metadata in charge.success");
        break;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await supabaseAdmin
        .from("users")
        .update({
          plan,
          plan_expires_at: expiresAt.toISOString(),
        })
        .eq("id", userId);

      // Log the transaction
      await supabaseAdmin.from("subscriptions").upsert({
        user_id: userId,
        paystack_reference: event.data.reference,
        plan,
        amount: event.data.amount,
        status: "active",
        expires_at: expiresAt.toISOString(),
      }, { onConflict: "paystack_reference" });

      console.log(`Plan activated: ${plan} for user ${userId}`);
      break;
    }

    // Subscription created — save subscription code + email token for cancellation
    case "subscription.create": {
      const { metadata } = event.data;
      const userId = metadata?.user_id;

      if (!userId) break;

      await supabaseAdmin
        .from("subscriptions")
        .update({
          paystack_subscription_code: event.data.subscription_code,
          paystack_email_token: event.data.email_token,
        })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      console.log(`Subscription created for user ${userId}`);
      break;
    }

    // Renewal charge failed — downgrade to free
    case "invoice.payment_failed": {
      const userId = event.data?.metadata?.user_id;
      if (!userId) break;

      await supabaseAdmin
        .from("users")
        .update({ plan: "free", plan_expires_at: null })
        .eq("id", userId);

      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("user_id", userId);

      console.log(`Plan downgraded to free for user ${userId} — payment failed`);
      break;
    }

    // User cancelled
    case "subscription.disable": {
      const userId = event.data?.metadata?.user_id;
      if (!userId) break;

      await supabaseAdmin
        .from("users")
        .update({ plan: "free", plan_expires_at: null })
        .eq("id", userId);

      await supabaseAdmin
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", userId);

      console.log(`Subscription cancelled for user ${userId}`);
      break;
    }

    default:
      console.log("Unhandled Paystack event:", event.event);
  }

  return NextResponse.json({ received: true });
}