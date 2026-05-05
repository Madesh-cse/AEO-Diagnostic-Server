import type { Request, Response } from "express";
import { askAI } from "../services/gemini.service.js";
import Analysis from "../models/analysis.model.js";

export const analyzeQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }
    const normalizedQuery = query.toLowerCase().trim();
    const cachedResult = await Analysis.findOne({ query: normalizedQuery });

    if (cachedResult) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedResult.aiResponse,
        id: cachedResult._id,
      });
    }
    let aiResponse;

    try {
      aiResponse = await askAI(query);
    } catch (aiError: any) {
      console.error("❌ AI ERROR:", aiError?.message || aiError);

      return res.status(500).json({
        success: false,
        message: "AI service failed",
        error: aiError?.message || "Unknown AI error",
      });
    }

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: "AI returned empty response",
      });
    }

    // 🧠 3. SAFE PRODUCT ENRICHMENT
    const enrichedProducts = (aiResponse.products || []).map((p: any) => {
      let risk = "Low";

      if (p?.sentiment === "Negative") risk = "High";
      else if (p?.sentiment === "Neutral") risk = "Medium";

      return {
        name: p?.name || "Unknown",
        rank: p?.rank ?? 0,
        sentiment: p?.sentiment || "Neutral",
        reason: p?.reason || "",
        link: p?.link || "",
        risk,
      };
    });
    const savedData = await Analysis.create({
      query: normalizedQuery,
      aiResponse: {
        ...aiResponse,
        products: enrichedProducts,
      },
      visibilityScore: aiResponse?.visibilityScore ?? 0,
      keywords: aiResponse?.keywords ?? [],
      products: enrichedProducts,
      meta: {
        provider: "groq",
        model: "llama-3.1-8b-instant",
      },
      cached: false,
    });
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