import type { Request, Response } from "express";
import { askAI } from "../services/gemini.service";
import Analysis from "../models/analysis.model";

export const analyzeQuery = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    // AI call
    const aiResponse = await askAI(query);

    // Save to DB
    const savedData = await Analysis.create({
      query,
      aiResponse,
      visibilityScore: aiResponse.visibilityScore,
      keywords: aiResponse.keywords,
      products: aiResponse.products,
      meta: {
        provider: "groq",
        model: "llama-3.1-8b-instant",
      },
    });

    // CLEAN RESPONSE FORMAT (IMPORTANT)
    return res.status(200).json({
      success: true,
      data: aiResponse,
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