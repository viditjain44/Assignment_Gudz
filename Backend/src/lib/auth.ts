import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Validate required environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI environment variable is not set");
}

if (!BETTER_AUTH_SECRET) {
  throw new Error("❌ BETTER_AUTH_SECRET environment variable is not set");
}

// Single MongoDB client for better-auth (lazy connection)
const mongoClient = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
});

// Create auth instance
export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL || "http://localhost:5000",
  basePath: "/api/auth",
  
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://assignment-gudz-53s7.vercel.app",
    process.env.FRONTEND_URL || ""
  ].filter(Boolean),

  database: mongodbAdapter(mongoClient.db("technician-booking")),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  user: {
    additionalFields: {
      phone: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
    },
  },
});

console.log('✅ Better Auth initialized');

// Export the client for connection testing if needed
export { mongoClient };