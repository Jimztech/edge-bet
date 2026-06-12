import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, getUserById, saveAnalysis } from "@/lib/db/supabase";
import { convertBetCode, type Bookmaker } from "@/lib/conversion/betpaddi";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(session.user.id);

  // Conversion is Premium-only
  if (!user || user.plan !== "premium") {
    return NextResponse.json(
      { error: "Bet code conversion requires a Premium plan" },
      { status: 403 }
    );
  }

  const { fromBookmaker, toBookmaker, code } = await req.json();

  if (!fromBookmaker || !toBookmaker || !code) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const result = await convertBetCode({
      fromBookmaker: fromBookmaker as Bookmaker,
      toBookmaker: toBookmaker as Bookmaker,
      code,
    });
    await saveAnalysis({
      userId: user.id,
      type: "convert",
      input: { fromBookmaker, toBookmaker, code },
      result,
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Conversion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}