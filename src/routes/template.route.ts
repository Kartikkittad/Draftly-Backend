import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import Template from "../models/Template";
import mongoose from "mongoose";

const router = Router();
const templates: any[] = [];

router.post("/create", authMiddleware, (req, res) => {
  const {
    name,
    subject,
    htmlBody,
    editorJson,
    fromEmailUsername,
    isComponent = false,
  } = req.body;

  const template = {
    id: Date.now(),
    name,
    subject,
    htmlBody,
    editorJson,
    fromEmailUsername,
    isComponent: Boolean(isComponent),
    createdAt: new Date(),
  };

  templates.push(template);

  res.json({
    data: template,
  });
});

router.post("/list", authMiddleware, (req, res) => {
  let { page = 1, limit = 5, isComponent, query } = req.body;

  page = Number(page);
  limit = Number(limit);

  let result = templates;

  if (typeof isComponent === "boolean") {
    result = result.filter((t) => t.isComponent === isComponent);
  }

  if (query && typeof query === "string") {
    const q = query.toLowerCase();
    result = result.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
    );
  }

  const total = result.length;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedData = result.slice(startIndex, endIndex);

  res.json({
    data: {
      data: paginatedData,
      count: total,
      page,
      limit,
      query: query || "",
    },
  });
});

router.get("/details/:id", authMiddleware, async (req, res) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  let page = Number(req.query.page ?? 1);
  let limit = Number(req.query.limit ?? 5);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 5;

  try {
    // DB-backed paginated list by userId.
    if (mongoose.Types.ObjectId.isValid(id)) {
      const filter = { userId: id } as any;
      const total = await Template.countDocuments(filter);
      const data = await Template.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return res.json({
        data: {
          data,
          count: total,
          page,
          limit,
          id,
        },
      });
    }

    // Fallback for in-memory local templates.
    const numericId = Number(id);
    const filtered =
      Number.isNaN(numericId) === false
        ? templates.filter((t) => t.userId === numericId || t.id === numericId)
        : [];

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return res.json({
      data: {
        data: paginatedData,
        count: total,
        page,
        limit,
        id,
      },
    });
  } catch (error) {
    console.error("Failed to fetch template details", error);
    return res.status(500).json({ message: "Failed to fetch template details" });
  }
});

router.get("/:id", authMiddleware, (req, res) => {
  const template = templates.find((t) => t.id === Number(req.params.id));

  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  res.json({
    data: template,
  });
});

router.put("/:id", authMiddleware, (req, res) => {
  const index = templates.findIndex((t) => t.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: "Template not found" });
  }

  templates[index] = {
    ...templates[index],
    ...req.body,
    isComponent:
      typeof req.body.isComponent === "boolean"
        ? req.body.isComponent
        : templates[index].isComponent,
    updatedAt: new Date(),
  };

  res.json({
    data: templates[index],
  });
});

export default router;
