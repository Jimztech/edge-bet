const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

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

// function buildPrompt(userMessage: string): string {
//   return `
// Analyze the following football betting input from a user.

// First, determine if this is:
// 1. A SINGLE match/selection question (e.g. "Arsenal vs Chelsea — Arsenal Win")
// 2. A BET SLIP with multiple selections (multiple lines with different matches)

// User input:
// "${userMessage}"

// If SINGLE selection, respond with this exact JSON:
// {
//   "type": "single",
//   "data": {
//     "match": "Team A vs Team B",
//     "pick": "the user's selection",
//     "risk": "low" | "mid" | "high",
//     "confidence": <number 0-100>,
//     "reason": "2-3 sentence explanation of why this pick carries this risk level, referencing realistic football factors like form, head-to-head, home advantage, injuries etc.",
//     "alternative": "a safer market suggestion e.g. Double Chance, Draw No Bet, Over/Under"
//   }
// }

// If BET SLIP (multiple selections), respond with this exact JSON:
// {
//   "type": "slip",
//   "overall_risk": <number 0-100>,
//   "data": [
//     {
//       "match": "Team A vs Team B",
//       "pick": "selection",
//       "risk": "low" | "mid" | "high",
//       "confidence": <number 0-100>,
//       "reason": "brief reason",
//       "alternative": "safer option or null"
//     }
//   ]
// }

// Risk guide:
// - low: confidence >= 70
// - mid: confidence 45-69
// - high: confidence < 45

// For overall_risk on slips: accumulator probability drops with each leg. 
// A 5-leg slip where each leg has 70% confidence has an overall probability of 0.7^5 = 16.8%, so overall_risk should be ~83.

// Be realistic and honest. Never inflate confidence scores.
// `.trim();
// }

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

async function callGemini(userMessage: string): Promise<AIResponse> {
  const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
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
    throw new Error(`Gemini error: ${err?.error?.message ?? res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty response from Gemini");

  return JSON.parse(text) as AIResponse;
}

async function callDeepSeek(userMessage: string): Promise<AIResponse> {
  const res = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildPrompt(userMessage) },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`DeepSeek error: ${err?.error?.message ?? res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error("Empty response from DeepSeek");

  return JSON.parse(text) as AIResponse;
}

export async function analyzeWithAI(userMessage: string): Promise<AIResponse> {
  // Try Gemini first
  try {
    console.log("Calling Gemini 2.5 Flash...");
    const result = await callGemini(userMessage);
    console.log("Gemini success");
    return result;
  } catch (geminiError) {
    console.error("Gemini failed:", geminiError);

    // Fallback to DeepSeek if key is available
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        console.log("Falling back to DeepSeek...");
        const result = await callDeepSeek(userMessage);
        console.log("DeepSeek success");
        return result;
      } catch (deepseekError) {
        console.error("DeepSeek also failed:", deepseekError);
        throw new Error("All AI providers failed");
      }
    }

    throw geminiError;
  }
}