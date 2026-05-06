import Groq from "groq-sdk";

export const askAI = async (query: string) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in .env");
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content: `
You are an AEO (AI Engine Optimization) analyzer.

RULES:
- Output ONLY valid JSON
- No markdown
- No explanation
- No extra text
- Ensure JSON is fully valid
`,
        },
        {
          role: "user",
          content: `
Analyze this query:

"${query}"

Return ONLY JSON:

{
  "visibilityScore": 0,
  "products": [
    {
      "name": "",
      "rank": 1,
      "sentiment": "Positive",
      "reason": "",
      "link": ""
    }
  ],
  "keywords": []
}
`,
        },
      ],

      temperature: 0.3,
      max_tokens: 1200,
    });

    const text = completion.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("Empty AI response");
    }

    console.log("🔵 RAW AI:", text);

    // 🔥 Extract JSON safely (better than regex cleanup)
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No JSON found in AI response");
    }

    const jsonString = text.slice(jsonStart, jsonEnd + 1);

    let parsed;

    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("❌ JSON PARSE FAILED:", jsonString);
      throw new Error("Invalid JSON from AI");
    }

    // ✅ Validate structure
    return {
      visibilityScore: parsed.visibilityScore ?? 0,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    };

  } catch (error: any) {
    console.error("❌ Groq Service Error FULL:", error);
    throw error;
  }
};