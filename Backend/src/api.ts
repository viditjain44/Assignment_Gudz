// import dotenv from "dotenv";

// dotenv.config();

// let app: any = null;
// let serverlessHandler: any = null;
// let initPromise: Promise<void> | null = null;
// let initError: Error | null = null;

// // Lazy initialization with aggressive timeouts
// async function initializeApp() {
//   // If already initialized, return immediately
//   if (app && serverlessHandler) {
//     console.log('[Init] Using cached app');
//     return;
//   }

//   // If initialization failed before, throw the error
//   if (initError) {
//     console.error('[Init] Previous init failed, throwing cached error');
//     throw initError;
//   }

//   // If already initializing, wait for it
//   if (initPromise) {
//     console.log('[Init] Waiting for existing initialization');
//     return initPromise;
//   }

//   // Start initialization
//   initPromise = (async () => {
//     try {
//       console.log('[Init] ===== STARTING INITIALIZATION =====');
//       console.log('[Init] Timestamp:', new Date().toISOString());
//       const startTime = Date.now();

//       // 1. Load serverless-http
//       console.log('[Init] Step 1: Loading serverless-http...');
//       const serverlessModule = await Promise.race([
//         import("serverless-http"),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('serverless-http import timeout')), 5000)
//         )
//       ]) as any;
//       const serverless = serverlessModule.default;
//       console.log('[Init] ✅ serverless-http loaded');

//       // 2. Load app module (which includes better-auth)
//       console.log('[Init] Step 2: Loading app module...');
//       const appModule = await Promise.race([
//         import("./app.js"),
//         new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('app.js import timeout')), 5000)
//         )
//       ]) as any;
//       app = appModule.default;
//       console.log('[Init] ✅ App module loaded (better-auth included)');

//       // 3. Create serverless handler
//       serverlessHandler = serverless(app);
//       console.log('[Init] ✅ Serverless handler created');

//       // 4. Connect to MongoDB (with short timeout)
//       console.log('[Init] Step 3: Connecting to main database...');
//       try {
//         const dbModule = await import("./config/db.js");
        
//         const dbConnectPromise = dbModule.connectDB();
//         const dbTimeoutPromise = new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Main DB connection timeout (10s)')), 10000)
//         );
        
//         await Promise.race([dbConnectPromise, dbTimeoutPromise]);
//         console.log('[Init] ✅ Main database connected');
//       } catch (dbError: any) {
//         console.error('[Init] ⚠️ Main DB connection failed:', dbError.message);
//         console.log('[Init] Continuing without main DB connection...');
//       }

//       // Better Auth manages its own MongoDB connection - no need to pre-connect
//       console.log('[Init] Better Auth will connect to its database on first use');

//       const elapsed = Date.now() - startTime;
//       console.log(`[Init] ===== INITIALIZATION COMPLETE in ${elapsed}ms =====`);

//     } catch (error) {
//       initError = error as Error;
//       console.error('[Init] ===== INITIALIZATION FAILED =====');
//       console.error('[Init] Error:', error);
//       throw error;
//     }
//   })();

//   return initPromise;
// }

// // Export for Vercel serverless
// export default async (req: any, res: any) => {
//   const requestStart = Date.now();
//   console.log(`[Request] ${req.method} ${req.url} - Started at ${new Date().toISOString()}`);

//   // Set CORS headers immediately
//   res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://assignment-gudz-53s7.vercel.app');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//   // Handle OPTIONS requests immediately
//   if (req.method === 'OPTIONS') {
//     console.log('[Request] OPTIONS request - responding immediately');
//     res.statusCode = 204;
//     res.end();
//     return;
//   }

//   // Debug endpoint - doesn't need initialization
//   if (req.url === '/debug-env') {
//     console.log('[Request] Debug endpoint');
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({
//       hasMongoUri: !!process.env.MONGODB_URI,
//       hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
//       betterAuthUrl: process.env.BETTER_AUTH_URL,
//       frontendUrl: process.env.FRONTEND_URL,
//       nodeEnv: process.env.NODE_ENV,
//       timestamp: new Date().toISOString(),
//     }));
//     return;
//   }

//   // Health check - quick response
//   if (req.url === '/health' || req.url === '/health-check') {
//     console.log('[Request] Health check endpoint');
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       status: 'ok', 
//       initialized: !!app,
//       timestamp: new Date().toISOString()
//     }));
//     return;
//   }

//   // Initialize app with aggressive timeout (15 seconds max)
//   try {
//     console.log('[Request] Starting initialization...');
//     const initTimeout = new Promise((_, reject) => 
//       setTimeout(() => {
//         console.error('[Request] INITIALIZATION TIMEOUT - took longer than 15 seconds');
//         reject(new Error('Initialization timeout - took longer than 15 seconds'));
//       }, 15000)
//     );

//     await Promise.race([initializeApp(), initTimeout]);
//     console.log('[Request] Initialization complete, handling request...');
//   } catch (error: any) {
//     const elapsed = Date.now() - requestStart;
//     console.error(`[Request] Initialization failed after ${elapsed}ms:`, error);
//     res.statusCode = 503;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       error: 'Service initialization failed', 
//       message: error.message,
//       elapsed: `${elapsed}ms`,
//       timestamp: new Date().toISOString()
//     }));
//     return;
//   }

//   // Handle request
//   try {
//     console.log('[Request] Passing to Express handler...');
//     const result = await serverlessHandler(req, res);
//     const elapsed = Date.now() - requestStart;
//     console.log(`[Request] Completed in ${elapsed}ms`);
//     return result;
//   } catch (error: any) {
//     const elapsed = Date.now() - requestStart;
//     console.error(`[Request] Handler failed after ${elapsed}ms:`, error);
//     res.statusCode = 500;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       error: 'Internal server error',
//       message: error.message,
//       elapsed: `${elapsed}ms`
//     }));
//   }
// };

import express from "express";
import cors from "cors";
import { auth } from "./lib/auth.js";
import apiRoutes from "./routes/index.js";

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
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'not set',
    frontendUrl: process.env.FRONTEND_URL || 'not set',
    nodeEnv: process.env.NODE_ENV || 'not set',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running", version: "1.0.0" });
});

// Mount all API routes at /api
app.use("/api", apiRoutes);

// Mount better-auth (should be last)
app.use(auth.handler as any);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[App] Error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: err.message,
  });
});

export default app;