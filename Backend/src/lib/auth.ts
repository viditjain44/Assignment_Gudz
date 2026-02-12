// import { betterAuth } from "better-auth";
// import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { MongoClient } from "mongodb";

// // Get environment variables
// const MONGODB_URI =process.env.MONGODB_URI;
// const BETTER_AUTH_SECRET =process.env.BETTER_AUTH_SECRET;
// const BETTER_AUTH_URL =process.env.BETTER_AUTH_URL;

// console.log('[Auth] Environment check:');
// console.log('[Auth] MONGODB_URI:', MONGODB_URI ? 'SET' : 'NOT SET');
// console.log('[Auth] BETTER_AUTH_SECRET:', BETTER_AUTH_SECRET ? 'SET' : 'NOT SET');
// console.log('[Auth] BETTER_AUTH_URL:', BETTER_AUTH_URL || 'NOT SET');

// if (!MONGODB_URI) {
//   throw new Error("❌ MONGODB_URI environment variable is not set");
// }

// if (!BETTER_AUTH_SECRET) {
//   throw new Error("❌ BETTER_AUTH_SECRET environment variable is not set");
// }

// if (!BETTER_AUTH_URL) {
//   throw new Error("❌ BETTER_AUTH_URL environment variable is not set");
// }

// // Single MongoDB client for better-auth (lazy connection)
// const mongoClient = new MongoClient(MONGODB_URI, {
//   serverSelectionTimeoutMS: 10000,
//   connectTimeoutMS: 10000,
//   maxPoolSize: 10,
//   minPoolSize: 1,
// });

// // Create auth instance with explicit baseURL
// export const auth = betterAuth({
//   secret: BETTER_AUTH_SECRET,
//   baseURL: BETTER_AUTH_URL,
  
//   trustedOrigins: [
//     "http://localhost:5173",
//     "http://localhost:3000", 
//     "http://localhost:5000",
//     "https://assignment-gudz-53s7.vercel.app",
//     "https://assignment-gudz-oqe8.vercel.app",
//     BETTER_AUTH_URL,
//     process.env.FRONTEND_URL || ""
//   ].filter(Boolean),

//   database: mongodbAdapter(mongoClient.db("technician-booking")),

//   emailAndPassword: {
//     enabled: true,
//     minPasswordLength: 8,
//     requireEmailVerification: false,
//   },

//   session: {
//     expiresIn: 60 * 60 * 24 * 7,
//     updateAge: 60 * 60 * 24,
//     cookieCache: {
//       enabled: true,
//       maxAge: 60 * 5,
//     },
//   },

//   user: {
//     additionalFields: {
//       phone: {
//         type: "string",
//         required: false,
//       },
//       role: {
//         type: "string",
//         required: false,
//         defaultValue: "customer",
//       },
//     },
//   },
// });

// console.log('✅ Better Auth initialized with baseURL:', BETTER_AUTH_URL);

// export { mongoClient };
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;

// Dynamically determine base URL
const BASE_URL =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BETTER_AUTH_URL;

console.log("[Auth] Environment check:");
console.log("[Auth] MONGODB_URI:", MONGODB_URI ? "SET" : "NOT SET");
console.log("[Auth] BETTER_AUTH_SECRET:", BETTER_AUTH_SECRET ? "SET" : "NOT SET");
console.log("[Auth] BASE_URL:", BASE_URL || "NOT SET");

// Validate required variables
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI environment variable is not set");
}

if (!BETTER_AUTH_SECRET) {
  throw new Error("❌ BETTER_AUTH_SECRET environment variable is not set");
}

if (!BASE_URL) {
  throw new Error("❌ Base URL is not set");
}

// Mongo client
const mongoClient = new MongoClient(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  minPoolSize: 1,
});

// ✅ Define trustedOrigins OUTSIDE the object
const trustedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://assignment-gudz-53s7.vercel.app",
  process.env.FRONTEND_URL,
  BASE_URL,
].filter((origin): origin is string => Boolean(origin));

// Create auth instance
export const auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BASE_URL,
  basePath: "/api/auth",
  trustedOrigins,
  database: mongodbAdapter(mongoClient.db("technician-booking")),

  // Cross-origin cookie settings for separate frontend/backend domains
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Different domains, not subdomains
    },
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      path: "/",
    },
  },

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

console.log("✅ Better Auth initialized with baseURL:", BASE_URL);

export { mongoClient };
