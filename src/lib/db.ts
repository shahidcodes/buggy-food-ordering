import mongoose from "mongoose";

// Define the cached connection type
interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global to include mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}

// A deliberately flaky connection setup for QA testing
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/food-ordering-app";

// Bug 1: Connection doesn't properly handle reconnection after timeout
// Bug 2: No proper error handling for authentication failures
const cached: MongooseConnection = global.mongoose || {
  conn: null,
  promise: null,
};

async function connectDB() {
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      // Bug 3: Short server selection timeout that might cause intermittent failures
      serverSelectionTimeoutMS:
        process.env.NODE_ENV === "production" ? 30000 : 3000,
    };

    console.log(
      "Attempting to connect to MongoDB with URI:",
      process.env.MONGODB_URI
        ? process.env.MONGODB_URI.substring(0, 20) + "..."
        : "MONGODB_URI not set"
    );

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error details:", error);
        // Bug 4: Even after error we still return a seemingly successful connection
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
