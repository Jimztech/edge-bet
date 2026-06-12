import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getUserById, saveAnalysis } from "@/lib/db/supabase";
import { analyzeMatch } from "@/lib/ai/match-analysis";

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

  const { homeTeam, awayTeam, market } = await req.json();

  if (!homeTeam || !awayTeam || !market) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await analyzeMatch(homeTeam, awayTeam, market);
    await saveAnalysis({
      userId: user.id,
      type: "match",
      input: { homeTeam, awayTeam, market },
      result,
      riskScore: result.confidence,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}