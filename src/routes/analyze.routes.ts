import { Router } from "express";

import { analyzeQuery } from "../controllers/analyze.controller.js";

const AnalyzeRouter = Router();

AnalyzeRouter.post("/analyze", analyzeQuery);

export default AnalyzeRouter;