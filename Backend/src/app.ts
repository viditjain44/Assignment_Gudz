import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import routes from "./routes/index.js";
import { auth } from "./lib/auth.js";

dotenv.config();

const app = express();

// CORS configuration - must be before routes
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "https://assignment-gudz-53s7.vercel.app", 
    process.env.FRONTEND_URL || ""
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Mount BetterAuth handler BEFORE express.json()
// BetterAuth handles its own body parsing
if (auth) {
  console.log('[App] Mounting Better Auth at /api/auth');
  app.use("/api/auth", toNodeHandler(auth));
} else {
  console.error('[App] Auth not configured');
  app.use("/api/auth", (req, res) => {
    res.status(500).json({ 
      error: "Auth not configured - missing environment variables" 
    });
  });
}

// JSON parsing for other routes
app.use(express.json());

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    authConfigured: !!auth 
  });
});

export default app;