import { Express } from "express";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Draftly API",
    version: "1.0.0",
    description: "Backend APIs for Draftly Email Builder",
  },
  servers: process.env.API_BASE_URL ? [{ url: process.env.API_BASE_URL }] : [],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "user@mail.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "User registered" },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login user",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/templates/create": {
      post: {
        summary: "Create template",
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "htmlBody"],
                properties: {
                  name: { type: "string", example: "Welcome Email" },
                  subject: { type: "string", example: "Hello 👋" },
                  fromEmailUsername: { type: "string", example: "Draftly" },
                  htmlBody: { type: "string", example: "<h1>Hello</h1>" },
                  editorJson: { type: "object" },
                  isComponent: {
                    type: "boolean",
                    example: false,
                    description:
                      "If true, template is a reusable component/block",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Template created" },
        },
      },
    },

    "/templates/list": {
      post: {
        summary: "List templates or components (paginated)",
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  page: { type: "integer", example: 1 },
                  limit: { type: "integer", example: 5 },
                  query: { type: "string", example: "welcome" },
                  isComponent: { type: "boolean", example: false },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Paginated templates list" },
        },
      },
    },
    "/templates/details/{id}": {
      get: {
        summary: "Get template details by id",
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Template id (Mongo ObjectId or numeric local id)",
          },
        ],
        responses: {
          "200": {
            description: "Template details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "404": { description: "Template not found" },
        },
      },
    },
    "/templates/details/list/{id}": {
      get: {
        summary: "List templates by id (paginated)",
        tags: ["Templates"],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "User id to list templates for",
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 5 },
            description: "Items per page",
          },
        ],
        responses: {
          "200": { description: "Paginated template details list" },
          "500": { description: "Server error" },
        },
      },
    },

    "/files/upload": {
      post: {
        summary: "Upload file",
        tags: ["Files"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "File uploaded" },
        },
      },
    },
  },
};

export default function setupSwagger(app: Express) {
  app.get("/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  const swaggerHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Draftly API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      html, body {
        margin: 0;
        padding: 0;
      }
      #swagger-ui {
        max-width: 1200px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/docs.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "BaseLayout"
        });
      };
    </script>
  </body>
</html>`;

  app.get("/docs", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(swaggerHtml);
  });

  app.get("/docs/", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(swaggerHtml);
  });
}
