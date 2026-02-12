// import app from "./app.js";
// import { connectDB } from "./config/db.js";
// import dotenv from "dotenv";

// dotenv.config();

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`📚 API docs: http://localhost:${PORT}/api`);
//       console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
//     });

//   } catch (error) {
//     console.error("Server failed to start:", error);
//     process.exit(1);
//   }
// };

// startServer();

// import app from "./app.js";
// import { connectDB } from "./config/db.js";
// import dotenv from "dotenv";

// dotenv.config();

// let isConnected = false;

// async function init() {
//   if (!isConnected) {
//     await connectDB();
//     isConnected = true;
//   }
// }

// export default async function handler(req: any, res: any) {
//   await init();
//   return app(req, res);
// }

// import dotenv from "dotenv";
// dotenv.config();

// import app from "./app.js";
// import { connectDB } from "./config/db.js";
// import { connectAuthDB } from "./lib/auth.js";

// const PORT = process.env.PORT || 5000;

// async function startServer() {
//   try {
//     // Connect to MongoDB
//     console.log('[Server] Connecting to databases...');
//     await connectDB();
//     console.log('[Server] Main database connected');
    
//     await connectAuthDB();
//     console.log('[Server] Auth database connected');

//     // Start Express server
//     app.listen(PORT, () => {
//       console.log(`[Server] ✅ Server running on http://localhost:${PORT}`);
//       console.log(`[Server] Health check: http://localhost:${PORT}/health`);
//       console.log(`[Server] Auth endpoint: http://localhost:${PORT}/api/auth`);
//     });
//   } catch (error) {
//     console.error('[Server] Failed to start:', error);
//     process.exit(1);
//   }
// }

// startServer();
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectAuthDB } from "./lib/auth.js";

let isConnected = false;

async function init() {
  if (isConnected) return;

  console.log("[Server] Connecting to databases...");
  await connectDB();
  await connectAuthDB();
  console.log("[Server] Databases connected");

  isConnected = true;
}

await init();

export default app;
