import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    query: String,
    aiResponse: Object,
    visibilityScore: Number,
    keywords: [String],
    products: Array,
    meta: {
      provider: String,
      model: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Analysis", analysisSchema);