import { NextRequest, NextResponse } from "next/server";
// import { createServerSupabaseClient, getUserById, saveAnalysis } from "@/lib/db/supabase-server";
// import { convertBetCode, type Bookmaker } from "@/lib/conversion/betpaddi";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Bet code conversion is coming soon" },
    { status: 501 }
  );
}