import type { Request, Response } from "express";
import { askAI } from "../services/gemini.service.js";
import Analysis from "../models/analysis.model.js";

export const analyzeQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    // 1️⃣ Validate input
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query is required and must be a string",
      });
    }

    const normalizedQuery = query.toLowerCase().trim();

    // 2️⃣ Check cache
    const cachedResult = await Analysis.findOne({ query: normalizedQuery });

    if (cachedResult) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedResult.aiResponse,
        id: cachedResult._id,
      });
    }

    // 3️⃣ Call AI safely
    let aiResponse;

    try {
      aiResponse = await askAI(query);
    } catch (aiError: any) {
      console.error("❌ AI SERVICE ERROR:", aiError);

      return res.status(500).json({
        success: false,
        message: "AI service failed",
        error: aiError?.message || "Unknown AI error",
      });
    }

    // 4️⃣ Validate AI response
    if (!aiResponse || typeof aiResponse !== "object") {
      return res.status(500).json({
        success: false,
        message: "Invalid AI response format",
      });
    }

    // 5️⃣ Safe extraction
    const rawProducts = Array.isArray((aiResponse as any).products)
      ? (aiResponse as any).products
      : [];

    // 6️⃣ Normalize products safely
    const enrichedProducts = rawProducts.map((p: any) => {
      let risk: "Low" | "Medium" | "High" = "Low";

      if (p?.sentiment === "Negative") risk = "High";
      else if (p?.sentiment === "Neutral") risk = "Medium";

      return {
        name: p?.name || "Unknown",
        rank: typeof p?.rank === "number" ? p.rank : 0,
        sentiment: p?.sentiment || "Neutral",
        reason: p?.reason || "",
        link: p?.link || "",
        risk,
      };
    });

    // 7️⃣ Build safe AI response
    const safeAIResponse = {
      ...aiResponse,
      products: enrichedProducts,
      visibilityScore:
        typeof (aiResponse as any).visibilityScore === "number"
          ? (aiResponse as any).visibilityScore
          : 0,
      keywords: Array.isArray((aiResponse as any).keywords)
        ? (aiResponse as any).keywords
        : [],
    };

    // 8️⃣ Save to DB
    const savedData = await Analysis.create({
      query: normalizedQuery,
      aiResponse: safeAIResponse,
      visibilityScore: safeAIResponse.visibilityScore,
      keywords: safeAIResponse.keywords,
      products: enrichedProducts,
      meta: {
        provider: "groq/gemini",
        model: "llama-3.1-8b-instant",
      },
      cached: false,
    });

    // 9️⃣ Response to frontend
    return res.status(200).json({
      success: true,
      cached: false,
      data: savedData.aiResponse,
      id: savedData._id,
    });
  } catch (error: any) {
    console.error("🔥 CONTROLLER CRASH:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error?.message || "Unknown error",
    });
  }
};