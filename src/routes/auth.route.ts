import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "Invalid payload",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      message: "Invalid email address",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  res.json({ message: "Registered successfully" });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: "1h",
  });

  res.json({
    accessToken: token,
  });
});

export default router;
