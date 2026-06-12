import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getUserById, saveAnalysis } from "@/lib/db/supabase";
import { analyzeSlip } from "@/lib/ai/slip-analysis";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);

  if (!user || user.plan === "free") {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }

  // Slip review is available to both Standard and Premium
  const { selections } = await req.json();

  if (!selections || !Array.isArray(selections) || selections.length === 0) {
    return NextResponse.json({ error: "No selections provided" }, { status: 400 });
  }

  try {
    const result = await analyzeSlip(selections);
    await saveAnalysis({
      userId: user.id,
      type: "slip",
      input: { selections },
      result,
      riskScore: result.overall_risk_score,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}