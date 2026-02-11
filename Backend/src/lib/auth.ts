import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Cached MongoDB client for serverless
let cachedClient: MongoClient | null = null;

function getMongoClient(): MongoClient {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
  }
  return cachedClient;
}

const mongoClient = getMongoClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET as string,
  baseURL: process.env.BETTER_AUTH_URL as string,
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
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
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
