import mongoose from "mongoose";
import dns from "dns";

// Fix Node.js 18+ DNS resolution preference for IPv6 which causes querySrv ECONNREFUSED in MongoDB Atlas
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/employee-management";

if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not defined in the environment. Falling back to local MongoDB default connection.");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Assign guaranteed type-safe object
const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Successfully connected to MongoDB.");
      return mongooseInstance;
    }).catch((err) => {
      console.error("Mongoose connection error:", err);
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

