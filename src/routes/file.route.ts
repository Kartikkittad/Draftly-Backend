import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  res.json({
    public_url: `http://localhost:4000/uploads/${req.file?.filename}`,
  });
});

export default router;
