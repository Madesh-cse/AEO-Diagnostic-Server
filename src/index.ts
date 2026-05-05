import { config } from "dotenv";
config();

import dns from "dns";
import app from "./app.js";
import { connectDB } from "./db/connection.js";



dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Connect DB
    await connectDB();

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();