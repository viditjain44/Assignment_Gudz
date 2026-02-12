// import dotenv from "dotenv";

// dotenv.config();

// let app: any = null;
// let serverless: any = null;
// let initError: Error | null = null;
// let isConnected = false;

// // Lazy initialization to catch errors
// async function initializeApp() {
//   if (app) return;
//   if (initError) throw initError;
  
//   try {
//     const serverlessModule = await import("serverless-http");
//     serverless = serverlessModule.default;
    
//     const appModule = await import("./app.js");
//     app = appModule.default;
    
//     const dbModule = await import("./config/db.js");
//     await dbModule.connectDB();
    
//     const authModule = await import("./lib/auth.js");
//     if (authModule.connectAuthDB) {
//       await authModule.connectAuthDB();
//     }
    
//     isConnected = true;
//   } catch (error) {
//     initError = error as Error;
//     throw error;
//   }
// }

// // Export for Vercel serverless
// export default async (req: any, res: any) => {
//   // Debug endpoint - doesn't need initialization
//   if (req.url === '/debug-env') {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({
//       hasMongoUri: !!process.env.MONGODB_URI,
//       hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
//       betterAuthUrl: process.env.BETTER_AUTH_URL,
//       frontendUrl: process.env.FRONTEND_URL,
//       nodeEnv: process.env.NODE_ENV,
//     }));
//     return;
//   }

//   // Health check
//   if (req.url === '/health-check') {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ status: 'ok', initialized: !!app, connected: isConnected }));
//     return;
//   }

//   // Test initialization steps
//   if (req.url === '/test-init') {
//     const steps: string[] = [];
//     try {
//       steps.push('Starting...');
      
//       const { MongoClient } = await import('mongodb');
//       steps.push('MongoDB module loaded');
      
//       const mongoose = await import('mongoose');
//       steps.push('Mongoose module loaded');
      
//       await mongoose.default.connect(process.env.MONGODB_URI as string, {
//         serverSelectionTimeoutMS: 3000,
//         connectTimeoutMS: 3000,
//       });
//       steps.push('Mongoose connected');
      
//       const authModule = await import('./lib/auth.js');
//       steps.push('Auth module loaded');
//       steps.push('Auth exists: ' + !!authModule.auth);
      
//       const appModule = await import('./app.js');
//       steps.push('App module loaded');
      
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({ status: 'ok', steps }));
//     } catch (error: any) {
//       res.statusCode = 500;
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({ status: 'error', steps, error: error.message }));
//     }
//     return;
//   }

//   // Test DB connection with short timeout
//   if (req.url === '/test-db') {
//     try {
//       const { MongoClient } = await import('mongodb');
//       const client = new MongoClient(process.env.MONGODB_URI as string, {
//         serverSelectionTimeoutMS: 3000,
//         connectTimeoutMS: 3000,
//       });
//       await client.connect();
//       await client.db('technician-booking').command({ ping: 1 });
//       await client.close();
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({ status: 'ok', message: 'MongoDB connected successfully' }));
//     } catch (error: any) {
//       res.statusCode = 500;
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({ status: 'error', message: error.message }));
//     }
//     return;
//   }

//   try {
//     await initializeApp();
//   } catch (error: any) {
//     res.statusCode = 503;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       error: 'Initialization failed', 
//       message: error.message,
//       stack: error.stack 
//     }));
//     return;
//   }
  
//   const handler = serverless(app);
//   return handler(req, res);
// };

// import dotenv from "dotenv";

// dotenv.config();

// // Global cache - reuse across invocations
// let app: any = null;
// let serverlessHandler: any = null;
// let initPromise: Promise<void> | null = null;
// let initError: Error | null = null;

// // Lazy initialization with proper caching
// async function initializeApp() {
//   // If already initialized, return immediately
//   if (app && serverlessHandler) {
//     return;
//   }

//   // If initialization failed before, throw the error
//   if (initError) {
//     throw initError;
//   }

//   // If already initializing, wait for it
//   if (initPromise) {
//     return initPromise;
//   }

//   // Start initialization
//   initPromise = (async () => {
//     try {
//       console.log('[Init] Starting initialization...');
//       const startTime = Date.now();

//       // 1. Load serverless-http
//       console.log('[Init] Loading serverless-http...');
//       const serverlessModule = await import("serverless-http");
//       const serverless = serverlessModule.default;

//       // 2. Load app module
//       console.log('[Init] Loading app module...');
//       const appModule = await import("./app.js");
//       app = appModule.default;

//       // 3. Connect to MongoDB with timeout
//       console.log('[Init] Connecting to MongoDB...');
//       const dbModule = await import("./config/db.js");
      
//       // Add timeout to DB connection
//       const dbConnectPromise = dbModule.connectDB();
//       const timeoutPromise = new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
//       );
      
//       await Promise.race([dbConnectPromise, timeoutPromise]);
//       console.log('[Init] MongoDB connected');

//       // 4. Connect to Better Auth DB with timeout
//       console.log('[Init] Loading auth module...');
//       const authModule = await import("./lib/auth.js");
      
//       if (authModule.connectAuthDB) {
//         console.log('[Init] Connecting to Auth DB...');
//         const authConnectPromise = authModule.connectAuthDB();
//         const authTimeoutPromise = new Promise((_, reject) => 
//           setTimeout(() => reject(new Error('Auth DB connection timeout')), 10000)
//         );
        
//         await Promise.race([authConnectPromise, authTimeoutPromise]);
//         console.log('[Init] Auth DB connected');
//       }

//       // 5. Create serverless handler
//       serverlessHandler = serverless(app);

//       const elapsed = Date.now() - startTime;
//       console.log(`[Init] Initialization complete in ${elapsed}ms`);

//     } catch (error) {
//       initError = error as Error;
//       console.error('[Init] Initialization failed:', error);
//       throw error;
//     }
//   })();

//   return initPromise;
// }

// // Export for Vercel serverless
// export default async (req: any, res: any) => {
//   // Set CORS headers immediately
//   res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://assignment-gudz-53s7.vercel.app');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//   // Handle OPTIONS requests immediately
//   if (req.method === 'OPTIONS') {
//     res.statusCode = 204;
//     res.end();
//     return;
//   }

//   // Debug endpoint - doesn't need initialization
//   if (req.url === '/debug-env') {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({
//       hasMongoUri: !!process.env.MONGODB_URI,
//       hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
//       betterAuthUrl: process.env.BETTER_AUTH_URL,
//       frontendUrl: process.env.FRONTEND_URL,
//       nodeEnv: process.env.NODE_ENV,
//     }));
//     return;
//   }

//   // Health check - quick response
//   if (req.url === '/health' || req.url === '/health-check') {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       status: 'ok', 
//       initialized: !!app,
//       timestamp: new Date().toISOString()
//     }));
//     return;
//   }

//   // Test DB connection with short timeout
//   if (req.url === '/test-db') {
//     try {
//       const { MongoClient } = await import('mongodb');
//       const client = new MongoClient(process.env.MONGODB_URI as string, {
//         serverSelectionTimeoutMS: 5000,
//         connectTimeoutMS: 5000,
//       });
      
//       await Promise.race([
//         client.connect(),
//         new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
//       ]);
      
//       await client.db('technician-booking').command({ ping: 1 });
//       await client.close();
      
//       res.statusCode = 200;
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({ status: 'ok', message: 'MongoDB connected successfully' }));
//     } catch (error: any) {
//       res.statusCode = 500;
//       res.setHeader('Content-Type', 'application/json');
//       res.end(JSON.stringify({ status: 'error', message: error.message }));
//     }
//     return;
//   }

//   // Initialize app with timeout (15 seconds max)
//   try {
//     const initTimeout = new Promise((_, reject) => 
//       setTimeout(() => reject(new Error('Initialization timeout - took longer than 15 seconds')), 15000)
//     );

//     await Promise.race([initializeApp(), initTimeout]);
//   } catch (error: any) {
//     console.error('[Handler] Initialization failed:', error);
//     res.statusCode = 503;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       error: 'Service initialization failed', 
//       message: error.message,
//       details: 'Please check Vercel logs for more information'
//     }));
//     return;
//   }

//   // Handle request
//   try {
//     return serverlessHandler(req, res);
//   } catch (error: any) {
//     console.error('[Handler] Request handling failed:', error);
//     res.statusCode = 500;
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify({ 
//       error: 'Internal server error',
//       message: error.message 
//     }));
//   }
// };


import dotenv from "dotenv";

dotenv.config();

let app: any = null;
let serverlessHandler: any = null;
let initPromise: Promise<void> | null = null;
let initError: Error | null = null;

// Lazy initialization with aggressive timeouts
async function initializeApp() {
  // If already initialized, return immediately
  if (app && serverlessHandler) {
    console.log('[Init] Using cached app');
    return;
  }

  // If initialization failed before, throw the error
  if (initError) {
    console.error('[Init] Previous init failed, throwing cached error');
    throw initError;
  }

  // If already initializing, wait for it
  if (initPromise) {
    console.log('[Init] Waiting for existing initialization');
    return initPromise;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      console.log('[Init] ===== STARTING INITIALIZATION =====');
      console.log('[Init] Timestamp:', new Date().toISOString());
      const startTime = Date.now();

      // 1. Load serverless-http
      console.log('[Init] Step 1: Loading serverless-http...');
      const serverlessModule = await Promise.race([
        import("serverless-http"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('serverless-http import timeout')), 5000)
        )
      ]) as any;
      const serverless = serverlessModule.default;
      console.log('[Init] ✅ serverless-http loaded');

      // 2. Load app module FIRST (don't connect DB yet)
      console.log('[Init] Step 2: Loading app module...');
      const appModule = await Promise.race([
        import("./app.js"),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('app.js import timeout')), 5000)
        )
      ]) as any;
      app = appModule.default;
      console.log('[Init] ✅ App module loaded');

      // 3. Create serverless handler (BEFORE connecting DB)
      serverlessHandler = serverless(app);
      console.log('[Init] ✅ Serverless handler created');

      // 4. Connect to MongoDB (with short timeout)
      console.log('[Init] Step 3: Connecting to main database...');
      try {
        const dbModule = await import("./config/db.js");
        
        const dbConnectPromise = dbModule.connectDB();
        const dbTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Main DB connection timeout (10s)')), 10000)
        );
        
        await Promise.race([dbConnectPromise, dbTimeoutPromise]);
        console.log('[Init] ✅ Main database connected');
      } catch (dbError: any) {
        console.error('[Init] ⚠️ Main DB connection failed:', dbError.message);
        console.log('[Init] Continuing without main DB connection...');
      }

      // 5. Connect Better Auth MongoDB (with short timeout)
      console.log('[Init] Step 4: Connecting Better Auth database...');
      try {
        const authModule = await import("./lib/auth.js");
        
        if (authModule.connectAuthDB) {
          const authConnectPromise = authModule.connectAuthDB();
          const authTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth DB connection timeout (10s)')), 10000)
          );
          
          await Promise.race([authConnectPromise, authTimeoutPromise]);
          console.log('[Init] ✅ Better Auth database connected');
        }
      } catch (authError: any) {
        console.error('[Init] ⚠️ Auth DB connection failed:', authError.message);
        console.log('[Init] Continuing without auth DB pre-connection...');
        // Don't throw - Better Auth will connect on first use
      }

      const elapsed = Date.now() - startTime;
      console.log(`[Init] ===== INITIALIZATION COMPLETE in ${elapsed}ms =====`);

    } catch (error) {
      initError = error as Error;
      console.error('[Init] ===== INITIALIZATION FAILED =====');
      console.error('[Init] Error:', error);
      throw error;
    }
  })();

  return initPromise;
}

// Export for Vercel serverless
export default async (req: any, res: any) => {
  const requestStart = Date.now();
  console.log(`[Request] ${req.method} ${req.url} - Started at ${new Date().toISOString()}`);

  // Set CORS headers immediately
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://assignment-gudz-53s7.vercel.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log('[Request] OPTIONS request - responding immediately');
    res.statusCode = 204;
    res.end();
    return;
  }

  // Debug endpoint - doesn't need initialization
  if (req.url === '/debug-env') {
    console.log('[Request] Debug endpoint');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      hasMongoUri: !!process.env.MONGODB_URI,
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      betterAuthUrl: process.env.BETTER_AUTH_URL,
      frontendUrl: process.env.FRONTEND_URL,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Health check - quick response
  if (req.url === '/health' || req.url === '/health-check') {
    console.log('[Request] Health check endpoint');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      status: 'ok', 
      initialized: !!app,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Initialize app with aggressive timeout (15 seconds max)
  try {
    console.log('[Request] Starting initialization...');
    const initTimeout = new Promise((_, reject) => 
      setTimeout(() => {
        console.error('[Request] INITIALIZATION TIMEOUT - took longer than 15 seconds');
        reject(new Error('Initialization timeout - took longer than 15 seconds'));
      }, 15000)
    );

    await Promise.race([initializeApp(), initTimeout]);
    console.log('[Request] Initialization complete, handling request...');
  } catch (error: any) {
    const elapsed = Date.now() - requestStart;
    console.error(`[Request] Initialization failed after ${elapsed}ms:`, error);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Service initialization failed', 
      message: error.message,
      elapsed: `${elapsed}ms`,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle request
  try {
    console.log('[Request] Passing to Express handler...');
    const result = await serverlessHandler(req, res);
    const elapsed = Date.now() - requestStart;
    console.log(`[Request] Completed in ${elapsed}ms`);
    return result;
  } catch (error: any) {
    const elapsed = Date.now() - requestStart;
    console.error(`[Request] Handler failed after ${elapsed}ms:`, error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message,
      elapsed: `${elapsed}ms`
    }));
  }
};