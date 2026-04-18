import app from "../src/app";
import { connectDB } from "../src/db";

let isConnected = false;

export default async function handler(req: any, res: any) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    return app(req, res);
  } catch (err: any) {
    console.error("Serverless handler error", err);
    return res.status(500).json({
      ok: false,
      error: err?.message ?? "Internal Server Error",
    });
  }
}
