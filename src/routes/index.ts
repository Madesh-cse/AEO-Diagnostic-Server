import express from "express";
import AnalyzeRouter from "./analyze.routes";

const IndexRouter = express.Router();
IndexRouter.use("/ai", AnalyzeRouter);

export default IndexRouter;



