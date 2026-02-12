import express from "express";
import cors from "cors";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://assignment-gudz-53s7.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Handle preflight for all routes (removed wildcard - cors middleware handles this)

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

// ✅ Better Auth mounting with manual CORS
const authHandler = toNodeHandler(auth);

// Middleware for auth routes - handles CORS and passes to Better Auth
app.use("/api/auth", (req, res, next) => {
  // Set CORS headers manually (toNodeHandler bypasses Express middleware)
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://assignment-gudz-53s7.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Pass to Better Auth handler
  return authHandler(req, res);
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[App] Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

export default app;
