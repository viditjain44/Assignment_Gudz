import dotenv from "dotenv";

dotenv.config();

let app: any = null;
let serverless: any = null;
let initError: Error | null = null;
let isConnected = false;

// Lazy initialization to catch errors
async function initializeApp() {
  if (app) return;
  if (initError) throw initError;
  
  try {
    const serverlessModule = await import("serverless-http");
    serverless = serverlessModule.default;
    
    const appModule = await import("./app.js");
    app = appModule.default;
    
    const dbModule = await import("./config/db.js");
    await dbModule.connectDB();
    
    const authModule = await import("./lib/auth.js");
    if (authModule.connectAuthDB) {
      await authModule.connectAuthDB();
    }
    
    isConnected = true;
  } catch (error) {
    initError = error as Error;
    throw error;
  }
}

// Export for Vercel serverless
export default async (req: any, res: any) => {
  // Debug endpoint - doesn't need initialization
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
    res.end(JSON.stringify({ status: 'ok', initialized: !!app, connected: isConnected }));
    return;
  }

  // Test DB connection with short timeout
  if (req.url === '/test-db') {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI as string, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await client.connect();
      await client.db('technician-booking').command({ ping: 1 });
      await client.close();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'ok', message: 'MongoDB connected successfully' }));
    } catch (error: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: 'error', message: error.message }));
    }
    return;
  }

  try {
    await initializeApp();
  } catch (error: any) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Initialization failed', 
      message: error.message,
      stack: error.stack 
    }));
    return;
  }
  
  const handler = serverless(app);
  return handler(req, res);
};
