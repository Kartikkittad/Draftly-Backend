import mongoose from "mongoose";

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI is not defined");
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  }
}
