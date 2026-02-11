import dotenv from "dotenv";

dotenv.config();

// Export for Vercel serverless
export default async (req: any, res: any) => {
  // Debug endpoint to check env vars
  if (req.url === '/debug-env') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      hasMongoUri: !!process.env.MONGODB_URI,
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      betterAuthUrl: process.env.BETTER_AUTH_URL,
      frontendUrl: process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
    }));
    return;
  }

  // Health check
  if (req.url === '/health-check') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // For now, return error for other routes
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Service temporarily unavailable - debugging' }));
};
