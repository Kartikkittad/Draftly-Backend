import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

router.post("/send", async (req, res) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        message:
          "Server is missing Gmail credentials in .env file (SMTP_USER, SMTP_PASSWORD).",
      });
    }

    const transporter = nodemailer.createTransport({
      pool: true, // Use a connection pool to avoid opening 500 simultaneous connections
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    const { emails, subject, html, text } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res
        .status(400)
        .json({ message: "Emails array is required and cannot be empty." });
    }

    if (emails.length > 500) {
      return res
        .status(400)
        .json({ message: "Cannot send to more than 500 emails at a time." });
    }

    if (!subject || (!html && !text)) {
      return res.status(400).json({
        message: "Subject and either html or text content are required.",
      });
    }

    const sendPromises = emails.map((email: string) => {
      return transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        text,
        html,
      });
    });

    const results = await Promise.allSettled(sendPromises);

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    res.status(200).json({
      message: "Emails processing completed",
      successful,
      failed,
    });
  } catch (error: any) {
    console.error("Error sending emails:", error);
    res
      .status(500)
      .json({ message: "Failed to send emails", error: error.message });
  }
});

export default router;
