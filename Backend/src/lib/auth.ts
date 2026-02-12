import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set");
}

if (!BETTER_AUTH_SECRET) {
  console.error("❌ BETTER_AUTH_SECRET environment variable is not set");
}

let mongoClient: MongoClient | null = null;

function getMongoClient(): MongoClient {
  if (!mongoClient && MONGODB_URI) {
    console.log('[Auth] Creating MongoDB client');
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
  }
  return mongoClient!;
}

export async function connectAuthDB(): Promise<Db | null> {
  if (!MONGODB_URI) {
    console.error('[Auth] Cannot connect: MONGODB_URI not set');
    return null;
  }
  
  try {
    const client = getMongoClient();
    console.log('[Auth] Connecting to MongoDB...');
    await client.connect();
    console.log('[Auth] ✅ MongoDB connected successfully');
    return client.db("technician-booking");
  } catch (error) {
    console.error('[Auth] ❌ MongoDB connection failed:', error);
    throw error;
  }
}

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

  // ✅ Pass Db object directly - NO async function
  database: mongodbAdapter(getMongoClient().db("technician-booking")),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false, // Important for Vercel
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
}) : null;

if (auth) {
  console.log('✅ Better Auth initialized successfully');
} else {
  console.error('❌ Better Auth not initialized');
}