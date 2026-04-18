import app from "../src/app";
import { connectDB } from "../src/db";

let isConnected = false;

export default async function handler(req: any, res: any) {
  try {
    const requestPath = req?.url || "";
    const isDocsRequest =
      requestPath === "/docs" ||
      requestPath.startsWith("/docs/") ||
      requestPath.startsWith("/docs?") ||
      requestPath === "/docs.json" ||
      requestPath.startsWith("/docs.json?");

    // Swagger docs should stay available even if DB is unavailable.
    if (!isDocsRequest && !isConnected) {
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
