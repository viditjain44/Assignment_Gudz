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
  console.error("❌ MONGODB_URI environment variable is not set");
}

if (!BETTER_AUTH_SECRET) {
  console.error("❌ BETTER_AUTH_SECRET environment variable is not set");
}

// ⚠️ CRITICAL: Don't create client here - it will auto-connect on first use
// This was causing the timeout!
let mongoClient: MongoClient | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

function getOrCreateClient(): MongoClient {
  if (!mongoClient && MONGODB_URI) {
    console.log('[Auth] Creating MongoDB client (not connecting yet)');
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
  }
  return mongoClient!;
}

// This function ensures connection before use
export async function connectAuthDB(): Promise<Db | null> {
  if (!MONGODB_URI) {
    console.error('[Auth] Cannot connect: MONGODB_URI not set');
    return null;
  }

  // If already connecting, wait for it
  if (connectionPromise) {
    console.log('[Auth] Waiting for existing connection...');
    const client = await connectionPromise;
    return client.db("technician-booking");
  }

  const client = getOrCreateClient();
  
  // Check if already connected
  try {
    await client.db("admin").command({ ping: 1 });
    console.log('[Auth] ✅ Already connected');
    return client.db("technician-booking");
  } catch (e) {
    // Not connected, need to connect
    console.log('[Auth] Connecting to MongoDB...');
    
    connectionPromise = client.connect()
      .then((connectedClient) => {
        console.log('[Auth] ✅ MongoDB connected');
        connectionPromise = null;
        return connectedClient;
      })
      .catch((error) => {
        console.error('[Auth] ❌ Connection failed:', error);
        connectionPromise = null;
        throw error;
      });

    const connectedClient = await connectionPromise;
    return connectedClient.db("technician-booking");
  }
}

// Create auth with LAZY database connection
// The client is created but NOT connected until Better Auth actually uses it
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

  // Pass client.db() - connection happens lazily on first use
  database: mongodbAdapter(getOrCreateClient().db("technician-booking")),

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
}) : null;

if (auth) {
  console.log('✅ Better Auth initialized (connection will happen on first use)');
} else {
  console.error('❌ Better Auth not initialized - missing environment variables');
}