import type { NextApiRequest, NextApiResponse } from "next";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("Debug: Checking database connection");
    await connectDB();

    const dbStats = {
      isConnected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      dbName: mongoose.connection.db?.databaseName || "Not connected",
      models: Object.keys(mongoose.models),
      connectionURI: process.env.MONGODB_URI
        ? `${process.env.MONGODB_URI.substring(0, 20)}...`
        : "MONGODB_URI not set",
    };

    console.log("Debug: Database connection status:", dbStats);

    return res.status(200).json({
      status: "success",
      message: "Database connection checked",
      data: dbStats,
    });
  } catch (error) {
    console.error("Debug: Database connection error:", error);
    return res.status(500).json({
      status: "error",
      message: "Error checking database connection",
      error: String(error),
    });
  }
}
