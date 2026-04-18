import mongoose from "mongoose";

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined");
  }

  try {
    // Reuse existing connection in serverless / warm starts.
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    // Never terminate the process in a serverless runtime.
    throw err;
  }
}
