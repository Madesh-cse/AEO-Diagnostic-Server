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

    // ⚡ 1. CHECK CACHE FIRST
    const cachedResult = await Analysis.findOne({
      query: normalizedQuery,
    });

    if (cachedResult) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedResult.aiResponse,
        id: cachedResult._id,
      });
    }

    // 🤖 2. CALL AI
    const aiResponse = await askAI(query);

    // 🧠 3. ENRICH PRODUCTS (risk layer)
    const enrichedProducts = (aiResponse.products || []).map(
      (p: any) => {
        let risk = "Low";

        if (p.sentiment === "Negative") risk = "High";
        else if (p.sentiment === "Neutral") risk = "Medium";

        return {
          name: p.name,
          rank: p.rank,
          sentiment: p.sentiment,
          reason: p.reason,
          link: p.link || "",
          risk,
        };
      }
    );

    // 📦 4. SAVE TO DB
    const savedData = await Analysis.create({
      query: normalizedQuery,
      aiResponse: {
        ...aiResponse,
        products: enrichedProducts,
      },
      visibilityScore: aiResponse.visibilityScore,
      keywords: aiResponse.keywords,
      products: enrichedProducts,
      meta: {
        provider: "groq",
        model: "llama-3.1-8b-instant",
      },
      cached: false,
    });

    // 🚀 5. RESPONSE
    return res.status(200).json({
      success: true,
      cached: false,
      data: savedData.aiResponse,
      id: savedData._id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};