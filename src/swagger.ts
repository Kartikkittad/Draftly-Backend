import swaggerUi from "swagger-ui-express";

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Draftly API",
    version: "1.0.0",
    description: "Backend APIs for Draftly Email Builder",
  },
  servers: [
    {
      url: "http://localhost:4000",
    },
  ],
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
          "200": {
            description: "Template created",
          },
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
                  page: {
                    type: "integer",
                    example: 1,
                    description: "Page number (default: 1)",
                  },
                  limit: {
                    type: "integer",
                    example: 5,
                    description: "Items per page (default: 5)",
                  },
                  query: {
                    type: "string",
                    example: "welcome",
                    description: "Search by template name or subject",
                  },
                  isComponent: {
                    type: "boolean",
                    example: false,
                    description:
                      "false = templates, true = components, omit = all",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Paginated templates list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { type: "object" },
                        },
                        count: {
                          type: "integer",
                          example: 25,
                        },
                        page: {
                          type: "integer",
                          example: 1,
                        },
                        limit: {
                          type: "integer",
                          example: 5,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
          "200": {
            description: "File uploaded",
          },
        },
      },
    },
  },
};

export default function setupSwagger(app: any) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
