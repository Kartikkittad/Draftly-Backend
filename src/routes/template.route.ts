import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import Template from "../models/Template";
import mongoose from "mongoose";

const router = Router();

router.post("/create", authMiddleware, async (req, res) => {
  const {
    name,
    subject,
    htmlBody,
    editorJson,
    fromEmailUsername,
    isComponent = false,
  } = req.body;

  const userId = (req as any)?.user?.userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const normalizedName = String(name || "").trim();
    if (!normalizedName) {
      return res.status(400).json({ message: "Template name is required" });
    }

    const existingTemplate = await Template.findOne({
      userId,
      name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    }).lean();

    if (existingTemplate) {
      return res.status(409).json({
        message: "Template with this name already exists",
      });
    }

    await Template.create({
      name: normalizedName,
      subject,
      htmlBody,
      editorJson,
      fromEmailUsername,
      isComponent: Boolean(isComponent),
      userId,
    });

    return res.status(201).json({
      message: "Template created successfully",
    });
  } catch (error) {
    console.error("Failed to create template", error);
    return res.status(500).json({ message: "Failed to create template" });
  }
});

router.post("/list", authMiddleware, async (req, res) => {
  let { page = 1, limit = 5, isComponent, query } = req.body;
  const userId = (req as any)?.user?.userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  page = Number(page);
  limit = Number(limit);
  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 5;

  try {
    const filter: any = { userId };

    if (typeof isComponent === "boolean") {
      filter.isComponent = isComponent;
    }

    if (query && typeof query === "string") {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { subject: { $regex: query, $options: "i" } },
      ];
    }

    const total = await Template.countDocuments(filter);
    const templates = await Template.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      data: templates,
      count: total,
      page,
      limit,
      query: query || "",
    });
  } catch (error) {
    console.error("Failed to list templates", error);
    return res.status(500).json({ message: "Failed to list templates" });
  }
});

router.get("/details/:id", authMiddleware, async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const userId = (req as any)?.user?.userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid template id" });
    }

    const template = await Template.findOne({ _id: id, userId }).lean();

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json({ data: template });
  } catch (error) {
    console.error("Failed to fetch template details", error);
    return res.status(500).json({ message: "Failed to fetch template details" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const userId = (req as any)?.user?.userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid template id" });
  }

  try {
    const template = await Template.findOne({ _id: id, userId }).lean();

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json({
      data: template,
    });
  } catch (error) {
    console.error("Failed to get template", error);
    return res.status(500).json({ message: "Failed to get template" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const userId = (req as any)?.user?.userId;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid template id" });
  }

  try {
    const updatedTemplate = await Template.findOneAndUpdate(
      { _id: id, userId },
      {
        ...req.body,
        ...(typeof req.body.isComponent === "boolean"
          ? { isComponent: req.body.isComponent }
          : {}),
      },
      { new: true }
    ).lean();

    if (!updatedTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.json({
      data: updatedTemplate,
    });
  } catch (error) {
    console.error("Failed to update template", error);
    return res.status(500).json({ message: "Failed to update template" });
  }
});

export default router;
