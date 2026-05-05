import express from "express";
import cors from "cors";
import IndexRouter from "./routes";


const app = express();

// Middlewares
app.use(cors());

app.use(express.json());

// Routes
app.use("/api", IndexRouter);

// Health Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Running Successfully",
  });
});

export default app;