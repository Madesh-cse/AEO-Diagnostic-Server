import express from "express";
import AnalyzeRouter from "./analyze.routes.js";

const IndexRouter = express.Router();
IndexRouter.use("/ai", AnalyzeRouter);

export default IndexRouter;



