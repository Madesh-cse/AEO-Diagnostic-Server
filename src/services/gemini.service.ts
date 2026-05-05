import Groq from "groq-sdk";

export const askAI = async (query: string) => {
  try {

    // Validate Key
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in .env");
    }
    console.log("✅ Groq Key Loaded");
    const groq = new Groq({
      apiKey,
    });

    // AI Completion
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",

          content: `
You are an AEO (AI Engine Optimization) analyzer.

Return ONLY valid JSON.
`,
        },

        {
          role: "user",

          content: `
Analyze this search query:

"${query}"

Return ONLY valid JSON:

{
  "visibilityScore": number,
  "products": [
    {
      "name": string,
      "rank": number,
      "sentiment": "Positive" | "Neutral" | "Negative",
      "reason": string
      "link": string
    }
  ],
  "keywords": string[]
}
`,
        },
      ],

      temperature: 0.7,

      max_tokens: 1000,
    });

    // Extract Response
    const text =
      completion.choices[0]?.message?.content || "";

    if (!text) {
      throw new Error("Empty AI response");
    }

    // Clean Markdown
    const cleanedResponse = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    const parsedResponse = JSON.parse(cleanedResponse);

    return parsedResponse;

  } catch (error: any) {

    console.log("❌ Groq Service Error");

    if (error?.message) {
      console.log(error.message);
    }

    console.error(error);

    throw new Error("Groq API Failed");
  }
};