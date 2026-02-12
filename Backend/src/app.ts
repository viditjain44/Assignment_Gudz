import dotenv from "dotenv";

dotenv.config();

let app: any = null;
let serverlessHandler: any = null;
let initError: Error | null = null;

// Simplified initialization - NO database connections
async function initializeApp() {
  if (app && serverlessHandler) {
    return;
  }

  if (initError) {
    throw initError;
  }

  try {
    console.log('[Init] Starting initialization...');
    const startTime = Date.now();

    // Load serverless-http
    const serverlessModule = await import("serverless-http");
    const serverless = serverlessModule.default;
    console.log('[Init] Serverless-http loaded');

    // Load app (which loads Better Auth, but doesn't connect DB yet)
    console.log('[Init] Loading app...');
    const appModule = await import("./app.js");
    app = appModule.default;
    console.log('[Init] App loaded');

    // Create handler
    serverlessHandler = serverless(app);

    const elapsed = Date.now() - startTime;
    console.log(`[Init] ✅ Initialization complete in ${elapsed}ms`);
    console.log('[Init] Database connections will happen on first request');

  } catch (error) {
    initError = error as Error;
    console.error('[Init] ❌ Initialization failed:', error);
    throw error;
  }
}

// Export for Vercel serverless
export default async (req: any, res: any) => {
  console.log(`[Request] ${req.method} ${req.url}`);

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://assignment-gudz-53s7.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Debug endpoint
  if (req.url === '/debug-env') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      hasMongoUri: !!process.env.MONGODB_URI,
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      betterAuthUrl: process.env.BETTER_AUTH_URL,
      frontendUrl: process.env.FRONTEND_URL,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Health check
  if (req.url === '/health' || req.url === '/health-check') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'ok', 
      initialized: !!app,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Initialize app (fast - no DB connections)
  try {
    await initializeApp();
  } catch (error: any) {
    console.error('[Request] Init failed:', error);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Service unavailable', 
      message: error.message
    }));
    return;
  }

  // Handle request (DB connections happen here if needed)
  try {
    return await serverlessHandler(req, res);
  } catch (error: any) {
    console.error('[Request] Handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }));
  }
};