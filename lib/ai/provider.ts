const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];


export type AnalysisResult = {
  match: string;
  pick: string;
  risk: "low" | "mid" | "high";
  confidence: number;
  reason: string;
  alternative: string;
};

export type AIResponse =
  | { type: "single"; data: AnalysisResult }
  | { type: "slip"; data: AnalysisResult[]; overall_risk: number };

const SYSTEM_PROMPT = `You are EdgeIQ, an expert football betting analyst. 
You analyze football betting selections and provide honest, data-driven risk assessments.
You NEVER guarantee wins or claim certainty. Football is unpredictable.
You always respond with valid JSON only — no markdown, no explanation outside the JSON.`;


function buildPrompt(userMessage: string): string {
  return `
Analyze the following football betting input from a user.

First, determine if this is:
1. A SINGLE match (may or may not include a pick)
2. A BET SLIP with multiple selections (multiple lines/matches)

IMPORTANT RULES:
- If the user provides ONLY a match name (e.g. "Portugal vs Nigeria"), you MUST still analyze it.
  Use your football knowledge to predict the best market — Home Win, Away Win, Draw, Over/Under 2.5, BTTS etc.
  Never refuse to analyze. Never ask the user to specify a pick. Always make a recommendation yourself.
- If the user provides a match AND a pick (e.g. "Arsenal vs Chelsea — Arsenal Win"), analyze that specific pick.
- For unknown or hypothetical teams, use general football logic to make a reasonable prediction.
- Always be confident in your recommendation while being honest about uncertainty.

User input:
"${userMessage}"

If SINGLE match or selection, respond with this exact JSON:
{
  "type": "single",
  "data": {
    "match": "Team A vs Team B",
    "pick": "your recommended pick or the user's pick if they provided one",
    "risk": "low" | "mid" | "high",
    "confidence": <number 0-100>,
    "reason": "2-3 sentence explanation referencing team strength, form, head-to-head, tournament context etc.",
    "alternative": "a safer market suggestion e.g. Double Chance, Draw No Bet, Over/Under"
  }
}

If BET SLIP (multiple matches/selections), respond with this exact JSON:
{
  "type": "slip",
  "overall_risk": <number 0-100>,
  "data": [
    {
      "match": "Team A vs Team B",
      "pick": "selection or your recommended pick",
      "risk": "low" | "mid" | "high",
      "confidence": <number 0-100>,
      "reason": "brief reason",
      "alternative": "safer option"
    }
  ]
}

Risk guide:
- low: confidence >= 70
- mid: confidence 45-69  
- high: confidence < 45

For overall_risk on slips: accumulator probability compounds with each leg.
A 5-leg slip where each leg has 70% confidence = 0.7^5 = 16.8% probability, so overall_risk = 83.

Be realistic, honest, and always provide a pick even when the user hasn't specified one.
`.trim();
}

async function callGeminiModel(
  model: string,
  userMessage: string
): Promise<AIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(userMessage) }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`${model} error: ${err?.error?.message ?? res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error(`Empty response from ${model}`);

  return JSON.parse(text) as AIResponse;
}

export async function analyzeWithAI(userMessage: string): Promise<AIResponse> {
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`Trying ${model}...`);
      const result = await callGeminiModel(model, userMessage);
      console.log(`${model} succeeded`);
      return result;
    } catch (err) {
      console.error(`${model} failed:`, err);
    }
  }

  throw new Error("All AI providers failed. Please try again in a moment.");
}