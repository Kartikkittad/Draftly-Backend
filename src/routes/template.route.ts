import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

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
