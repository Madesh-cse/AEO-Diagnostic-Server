import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    rank: Number,
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
    },
    risk: {
      type: String,
      enum: ["Low", "Medium", "High"],
    },
    reason: String,
    link: String,
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      index: true,
    },

    aiResponse: {
      type: Object,
      required: true,
    },

    visibilityScore: {
      type: Number,
      default: 0,
    },

    keywords: {
      type: [String],
      default: [],
    },

    products: {
      type: [productSchema],
      default: [],
    },

    meta: {
      provider: String,
      model: String,
    },

    // ⚡ CACHE FEATURE
    cached: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);