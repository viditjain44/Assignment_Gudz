import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
}

if (!BETTER_AUTH_SECRET) {
  console.error("BETTER_AUTH_SECRET environment variable is not set");
}

// Single MongoDB client for serverless - reused across requests
let mongoClient: MongoClient | null = null;
let isConnected = false;

function getMongoClient(): MongoClient {
  if (!mongoClient && MONGODB_URI) {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
  }
  return mongoClient!;
}

export async function connectAuthDB(): Promise<Db | null> {
  if (!MONGODB_URI) return null;
  
  const client = getMongoClient();
  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }
  return client.db("technician-booking");
}

// Create auth only if we have required env vars
export const auth = MONGODB_URI && BETTER_AUTH_SECRET ? betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL || "http://localhost:5000",
  basePath: "/api/auth",
  
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://assignment-gudz-53s7.vercel.app",
    process.env.FRONTEND_URL || ""
  ].filter(Boolean),

  database: mongodbAdapter(getMongoClient().db("technician-booking")),

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
}) : null;
