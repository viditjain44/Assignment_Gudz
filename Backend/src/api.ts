import serverless from "serverless-http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
let isConnected = false;

const connectOnce = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Export for Vercel serverless
export default async (req: any, res: any) => {
  await connectOnce();
  const handler = serverless(app);
  return handler(req, res);
};
