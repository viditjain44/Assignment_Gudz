import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import routes from "./routes/index.js";
import { auth } from "./lib/auth.js";

dotenv.config();

const app = express();

// CORS configuration - must be before routes
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", process.env.FRONTEND_URL || ""].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Mount BetterAuth handler BEFORE express.json()
// BetterAuth handles its own body parsing
app.all("/api/auth/{*path}", toNodeHandler(auth));

// JSON parsing for other routes
app.use(express.json());

// API routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
