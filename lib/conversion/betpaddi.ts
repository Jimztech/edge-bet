// lib/conversion/betpaddi.ts
export type Bookmaker = "sportybet" | "bet9ja" | "1xbet" | "betway" | "msport";

export async function convertBetCode(params: {
  fromBookmaker: Bookmaker;
  toBookmaker: Bookmaker;
  code: string;
}) {
  throw new Error("Bet code conversion not yet configured");
}