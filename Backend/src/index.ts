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

import app from "./app.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

async function init() {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
}

export default async function handler(req: any, res: any) {
  await init();
  return app(req, res);
}
