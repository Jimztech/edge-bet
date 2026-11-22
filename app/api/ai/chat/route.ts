import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getUserById, saveAnalysis } from "@/lib/db/supabase-server";
import { analyzeWithAI } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(authUser.id);

  if (!user) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  const { message } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const result = await analyzeWithAI(message);

    // Save to analysis history
    await saveAnalysis({
      userId: user.id,
      type: result.type === "slip" ? "slip" : "match",
      input: { message },
      result,
      riskScore: result.type === "single"
        ? result.data.confidence
        : result.overall_risk,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("AI analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}