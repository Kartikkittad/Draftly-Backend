import { Router } from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary";
import { authMiddleware } from "../middleware/auth";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only images allowed" });
      }

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "draftly",
              resource_type: "image",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        public_url: result.secure_url,
      });
    } catch (err) {
      console.error("Upload failed:", err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

export default router;
