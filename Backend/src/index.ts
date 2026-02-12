import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

// Track connection state
let isMainDBConnected = false;

async function ensureConnection() {
  // Only connect your main app database
  // Better-auth manages its own MongoDB connection
  if (isMainDBConnected) {
    return;
  }

  try {
    console.log("[Server] Connecting to main database...");
    await connectDB();
    console.log("[Server] Main database connected");
    isMainDBConnected = true;
  } catch (error) {
    console.error("[Server] Database connection failed:", error);
    isMainDBConnected = false;
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    // Connect to your main database
    await ensureConnection();
    
    // Pass request to Express app (which includes better-auth)
    return app(req, res);
  } catch (error) {
    console.error("[Server] Handler error:", error);
    return res.status(500).json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}