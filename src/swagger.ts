import swaggerUi from "swagger-ui-express";
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
  if (process.env.NODE_ENV === "production") {
    return;
  }

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
