import express from "express";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Debug endpoint
app.get("/debug-env", (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL || "not set",
    frontendUrl: process.env.FRONTEND_URL || "not set",
    nodeEnv: process.env.NODE_ENV || "not set",
    timestamp: new Date().toISOString(),
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Root test
app.get("/", (req, res) => {
  res.json({ message: "API is running", version: "1.0.0" });
});

// ✅ Proper Better Auth mounting (must use /api/auth/* for better-auth default)
app.all("/api/auth/*", toNodeHandler(auth));

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[App] Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

export default app;
