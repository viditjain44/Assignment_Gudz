import serverless from "serverless-http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectAuthDB } from "./lib/auth.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
let isConnected = false;
let connectionError: Error | null = null;

const connectOnce = async () => {
  if (isConnected) return;
  if (connectionError) throw connectionError;
  
  try {
    await Promise.all([
      connectDB(),
      connectAuthDB()
    ]);
    isConnected = true;
  } catch (error) {
    connectionError = error as Error;
    throw error;
  }
};

// Export for Vercel serverless
export default async (req: any, res: any) => {
  // Health check endpoint that doesn't need DB
  if (req.url === '/health-check') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', db: isConnected }));
    return;
  }

  try {
    await connectOnce();
  } catch (error: any) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database connection failed', message: error.message }));
    return;
  }
  
  const handler = serverless(app);
  return handler(req, res);
};
