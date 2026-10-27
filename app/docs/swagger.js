/**
 * OpenAPI 3.0.3 Specification for Boroma Fleet & Vehicle Management Backend API
 */

const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "Boroma Fleet & Vehicle Management API",
    version: "1.0.0",
    description: `## Boroma Vehicle Management Backend API Documentation

This API powers the vehicle fleet, category management, vehicle-to-category mapping, and vehicle gallery image uploads for Boroma.

### 🔑 Authentication Guide
Most endpoints in this API require authentication and authorization:
1. All protected endpoints require a JWT Bearer Token in the HTTP request header:
   \`Authorization: Bearer <YOUR_JWT_TOKEN>\`
2. The user role inside the token MUST be **SUPERADMIN** (\`role: "SUPERADMIN"\`).
3. **Frontend Testing Helper**: If you do not have a login endpoint token yet, you can instantly generate a valid 30-day SUPERADMIN test token using the **Admin -> POST /api/admin/generate-token** endpoint!
4. Click the green **Authorize 🔓** button at the top right of this page and enter:
   \`Bearer <token>\` or just \`<token>\` to authorize all requests directly in Swagger!

### 🖼️ Media & Uploads
Uploaded images are stored on the server under \`/uploads\`. The full URL can be formed as:
\`http://<HOST>:<PORT>/uploads/<filename>\` (e.g. \`http://localhost:5000/uploads/1740000000000-image.png\`).
`,
    contact: {
      name: "Boroma Engineering Team",
      email: "admin@boroma.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
    {
      url: "/",
      description: "Current Host Server",
    },
  ],
  tags: [
    {
      name: "Admin & Auth",
      description: "Admin user listings and JWT token generator for testing",
    },
    {
      name: "Category",
      description: "Vehicle category management (Create, Read, Update, Delete, Toggle Status)",
    },
    {
      name: "Vehicle Info",
      description: "Vehicle fleet registration, specifications, and complete master details",
    },
    {
      name: "Company",
      description: "Company management (Create, Read, Update, Delete, Toggle Status)",
    },
    {
      name: "Vehicle Image",
      description: "Vehicle image gallery uploads (multipart/form-data), single/bulk images, deletion & status",
    },
    {
      name: "Category Vehicle Map",
      description: "Mapping vehicles to single or multiple categories, and master listing with relations",
    },
    {
      name: "Company Car Map",
      description: "Mapping vehicles to companies (Create, Read, Delete, Toggle Status, List by Company)",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token with role 'SUPERADMIN'. Example: Bearer eyJhbGciOi...",
      },
    },
    schemas: {
      StandardSuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
        },
      },
      StandardErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message describing what went wrong" },
          error: { type: "string", example: "Detailed error message (if available)" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          category_name: { type: "string", example: "SUV" },
          short_name: { type: "string", example: "suv" },
          status: { type: "integer", example: 1, description: "1 for Active, 0 for Inactive" },
        },
      },
      CreateCategoryPayload: {
        type: "object",
        required: ["category_name", "short_name"],
        properties: {
          category_name: { type: "string", example: "SUV", description: "Display name of category" },
          short_name: { type: "string", example: "suv", description: "URL slug or identifier" },
        },
      },
      UpdateCategoryPayload: {
        type: "object",
        required: ["category_name", "short_name"],
        properties: {
          category_name: { type: "string", example: "Luxury SUV" },
          short_name: { type: "string", example: "lux-suv" },
        },
      },
      Company: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          company_name: { type: "string", example: "Tata Motors Ltd" },
          company_email: { type: "string", format: "email", example: "contact@tatamotors.com" },
          status: { type: "integer", example: 1, description: "1 for Active, 0 for Inactive (Default: 1)" },
        },
      },
      CreateCompanyPayload: {
        type: "object",
        required: ["company_name", "company_email"],
        properties: {
          company_name: { type: "string", example: "Tata Motors Ltd", description: "Name of the company" },
          company_email: { type: "string", format: "email", example: "contact@tatamotors.com", description: "Unique email of the company" },
        },
      },
      UpdateCompanyPayload: {
        type: "object",
        properties: {
          company_name: { type: "string", example: "Tata Motors Updated Ltd", description: "Updated company name" },
          company_email: { type: "string", format: "email", example: "updated@tatamotors.com", description: "Updated company email" },
        },
      },
      VehicleInfo: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          vehicle_no: { type: "string", example: "WB02AK1234" },
          no_of_seat: { type: "integer", example: 5 },
          status: { type: "integer", example: 1, description: "1 for Active, 0 for Inactive" },
        },
      },
      CreateVehicleInfoPayload: {
        type: "object",
        required: ["vehicle_no"],
        properties: {
          vehicle_no: { type: "string", example: "WB02AK1234", description: "Unique registration plate number" },
          no_of_seat: { type: "integer", example: 5, description: "Seating capacity of vehicle" },
          status: { type: "integer", example: 1, description: "1 for Active, 0 for Inactive (Default: 1)" },
        },
      },
      UpdateVehicleInfoPayload: {
        type: "object",
        properties: {
          vehicle_no: { type: "string", example: "WB02AK9999" },
          no_of_seat: { type: "integer", example: 7 },
          status: { type: "integer", example: 1 },
        },
      },
      VehicleImage: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          vehicle_id: { type: "integer", example: 1 },
          image: { type: "string", example: "1740000000000-car.png" },
          status: { type: "integer", example: 1 },
        },
      },
      CategoryVehicleMap: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          vehicle_id: { type: "integer", example: 1 },
          category_id: { type: "integer", example: 2 },
          status: { type: "integer", example: 1 },
          category: { $ref: "#/components/schemas/Category" },
          vehicle: { $ref: "#/components/schemas/VehicleInfo" },
        },
      },
      CreateCategoryVehicleMapPayload: {
        type: "object",
        required: ["vehicle_id", "category_id"],
        properties: {
          vehicle_id: { type: "integer", example: 1, description: "ID of the vehicle to map" },
          category_id: {
            oneOf: [
              {
                type: "array",
                items: { type: "integer" },
                example: [1, 2, 3],
                description: "Array of category IDs",
              },
              {
                type: "string",
                example: "1,2,3",
                description: "Comma separated category IDs",
              },
              {
                type: "integer",
                example: 1,
                description: "Single category ID",
              },
            ],
          },
          status: { type: "integer", example: 1, description: "Status of mapping (1: Active, 0: Inactive)" },
          replace: {
            type: "boolean",
            example: false,
            description: "If true, clears previous category mappings for this vehicle and replaces with the provided ones.",
          },
        },
      },
      RemoveCategoryFromVehiclePayload: {
        type: "object",
        properties: {
          category_id: {
            oneOf: [
              { type: "integer", example: 2 },
              { type: "array", items: { type: "integer" }, example: [2, 3] },
            ],
            description: "Category ID(s) to remove from vehicle. If left empty, all category mappings for this vehicle are removed.",
          },
        },
      },
      CompanyCarMap: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          company_id: { type: "integer", example: 1 },
          vehicle_id: { type: "integer", example: 2 },
          status: { type: "integer", example: 1, description: "1 for Active, 0 for Inactive" },
          company: { $ref: "#/components/schemas/Company" },
          vehicle: { $ref: "#/components/schemas/VehicleInfo" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CreateCompanyCarMapPayload: {
        type: "object",
        required: ["company_id"],
        properties: {
          company_id: {
            type: "integer",
            example: 1,
            description: "ID of the company to map vehicles to",
          },
          vehicle_id: {
            type: "integer",
            example: 2,
            description: "Single vehicle ID (used when mapping one vehicle)",
          },
          vehicle_ids: {
            oneOf: [
              {
                type: "array",
                items: { type: "integer" },
                example: [1, 2, 3],
                description: "Array of vehicle IDs",
              },
              {
                type: "string",
                example: "1,2,3",
                description: "Comma-separated vehicle IDs",
              },
            ],
            description: "Multiple vehicle IDs to map to the company",
          },
          status: {
            type: "integer",
            example: 1,
            description: "Status of mapping (1: Active, 0: Inactive)",
          },
          replace: {
            type: "boolean",
            example: false,
            description: "If true, clears previous mappings for this company before creating new ones",
          },
        },
      },
      VehicleFullDetails: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          vehicle_no: { type: "string", example: "WB02AK1234" },
          no_of_seat: { type: "integer", example: 5 },
          status: { type: "integer", example: 1 },
          total_categories: { type: "integer", example: 2 },
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer", example: 1 },
                category_name: { type: "string", example: "SUV" },
                short_name: { type: "string", example: "suv" },
                status: { type: "integer", example: 1 },
                mapping_id: { type: "integer", example: 10 },
                map_status: { type: "integer", example: 1 },
              },
            },
          },
          total_images: { type: "integer", example: 2 },
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer", example: 5 },
                image: { type: "string", example: "1740000000000-front.png" },
                image_url: { type: "string", example: "http://localhost:5000/uploads/1740000000000-front.png" },
                status: { type: "integer", example: 1 },
              },
            },
          },
        },
      },
      Admin: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          full_name: { type: "string", example: "John Doe" },
          email: { type: "string", example: "admin@boroma.com" },
          role_id: { type: "integer", example: 1 },
          mobile: { type: "string", example: "9876543210" },
          avatar: { type: "string", example: "avatar.jpg" },
          status_id: { type: "integer", example: 1 },
          is_active: { type: "integer", example: 1 },
          otp_verified: { type: "integer", example: 1 },
          is_verified: { type: "integer", example: 1 },
        },
      },
    },
  },
  paths: {
    // ----------------------------------------------------
    // ADMIN & DEV TOKEN
    // ----------------------------------------------------
    "/api/admin/admins": {
      get: {
        tags: ["Admin & Auth"],
        summary: "Get all admins",
        description: "Fetch all registered admins excluding password, otp, and oauth credentials.",
        responses: {
          200: {
            description: "Admins fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Admins fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Admin" },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal Server Error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/generate-token": {
      post: {
        tags: ["Admin & Auth"],
        summary: "Generate SUPERADMIN JWT token for testing",
        description: "Creates a signed JWT with `role: 'SUPERADMIN'` that satisfies `authCheck` and `checkRole('SUPERADMIN')` middlewares. Use this token in the Swagger Authorize button or in your frontend HTTP client.",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: { type: "string", example: "SUPERADMIN", default: "SUPERADMIN" },
                  email: { type: "string", example: "admin@boroma.com", default: "admin@boroma.com" },
                  id: { type: "integer", example: 1, default: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Token generated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "SUPERADMIN test token generated successfully" },
                    token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    authorization_header: { type: "string", example: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                    decoded_payload: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        email: { type: "string", example: "admin@boroma.com" },
                        role: { type: "string", example: "SUPERADMIN" },
                        expiresIn: { type: "string", example: "30 days" },
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

    // ----------------------------------------------------
    // CATEGORY
    // ----------------------------------------------------
    "/api/category/save": {
      post: {
        tags: ["Category"],
        summary: "Create a new category",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCategoryPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Category created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Category created Successfully" },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing required fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "All fields Are required" },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/category/get": {
      get: {
        tags: ["Category"],
        summary: "Get all categories",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of categories fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Categories fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category/get/{id}": {
      get: {
        tags: ["Category"],
        summary: "Get category by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Category ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Category details fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Categories fetched successfully" },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          400: {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Category Not Found" },
              },
            },
          },
        },
      },
    },
    "/api/category/update/{id}": {
      put: {
        tags: ["Category"],
        summary: "Update category by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Category ID to update",
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCategoryPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Category updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Category updated successfully" },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          404: {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Category not found" },
              },
            },
          },
        },
      },
    },
    "/api/category/delete/{id}": {
      delete: {
        tags: ["Category"],
        summary: "Delete category by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Category ID to delete",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Category deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                example: { success: true, message: "Category deleted successfully" },
              },
            },
          },
          404: {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Category not found" },
              },
            },
          },
        },
      },
    },
    "/api/category/{id}/toggle-status": {
      patch: {
        tags: ["Category"],
        summary: "Toggle category status (Active 1 <-> Inactive 0)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Category ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Category status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Category status updated Successfully" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        category_name: { type: "string", example: "SUV" },
                        status: { type: "integer", example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Category not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Category not found" },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // VEHICLE INFO
    // ----------------------------------------------------
    "/api/vehicle-info/save": {
      post: {
        tags: ["Vehicle Info"],
        summary: "Create vehicle info",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateVehicleInfoPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Vehicle info created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle info created successfully" },
                    data: { $ref: "#/components/schemas/VehicleInfo" },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing required vehicle_no",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle number is required" },
              },
            },
          },
          409: {
            description: "Duplicate vehicle number conflict",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle with this vehicle number already exists" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/get": {
      get: {
        tags: ["Vehicle Info"],
        summary: "Get all vehicle info list",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Vehicles fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicles fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VehicleInfo" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/get/{id}": {
      get: {
        tags: ["Vehicle Info"],
        summary: "Get vehicle info by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle fetched successfully" },
                    data: { $ref: "#/components/schemas/VehicleInfo" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle not found" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/update/{id}": {
      put: {
        tags: ["Vehicle Info"],
        summary: "Update vehicle info",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateVehicleInfoPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Vehicle info updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle info updated successfully" },
                    data: { $ref: "#/components/schemas/VehicleInfo" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle not found" },
              },
            },
          },
          409: {
            description: "Vehicle number already exists on another vehicle",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle number already exists" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/delete/{id}": {
      delete: {
        tags: ["Vehicle Info"],
        summary: "Delete vehicle info",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                example: { success: true, message: "Vehicle info deleted successfully" },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle not found" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/toggle-status/{id}": {
      patch: {
        tags: ["Vehicle Info"],
        summary: "Toggle vehicle status (Active 1 <-> Inactive 0)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle status updated successfully" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        vehicle_no: { type: "string", example: "WB02AK1234" },
                        status: { type: "integer", example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle not found" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/details": {
      get: {
        tags: ["Vehicle Info"],
        summary: "Master Listing API: Get all vehicles with categories & images",
        description: "Returns full listing of vehicles, populated with all mapped categories and image URLs with full domain paths. Supports searching and filtering.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search filter on vehicle_no (partial match)",
            example: "WB",
          },
          {
            name: "category_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter vehicles by specific category ID",
            example: 1,
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by vehicle status (1: Active, 0: Inactive)",
            example: 1,
          },
          {
            name: "vehicle_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Return single vehicle details if passed in query",
          },
        ],
        responses: {
          200: {
            description: "Vehicles listing fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicles listing fetched successfully" },
                    total: { type: "integer", example: 1 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VehicleFullDetails" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-info/details/{id}": {
      get: {
        tags: ["Vehicle Info"],
        summary: "Get complete details for a single vehicle by ID",
        description: "Returns vehicle info, all mapped categories with mapping status, and full image URLs.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle details fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle details fetched successfully" },
                    data: { $ref: "#/components/schemas/VehicleFullDetails" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle not found with the provided vehicle_id" },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // COMPANY
    // ----------------------------------------------------
    "/api/company/create": {
      post: {
        tags: ["Company"],
        summary: "Create a new company",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCompanyPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Company created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "company created successfully" },
                    data: { $ref: "#/components/schemas/Company" },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error - missing required fields",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "company name and email is required" },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          409: {
            description: "Conflict - company already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "company already exists" },
              },
            },
          },
          500: {
            description: "Failed to create company",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company/get-all": {
      get: {
        tags: ["Company"],
        summary: "Get all companies",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Companies fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Companies fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Company" },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          500: {
            description: "Failed to fetch companies",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company/get-by-id/{id}": {
      get: {
        tags: ["Company"],
        summary: "Get company by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Company ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Company fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company fetched successfully" },
                    data: { $ref: "#/components/schemas/Company" },
                  },
                },
              },
            },
          },
          400: {
            description: "Company is inactive",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "company is not active" },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          404: {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Company not found" },
              },
            },
          },
          500: {
            description: "Failed to fetch company",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company/update/{id}": {
      put: {
        tags: ["Company"],
        summary: "Update company by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Company ID to update",
            example: 1,
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCompanyPayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Company updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company updated successfully" },
                    data: { $ref: "#/components/schemas/Company" },
                  },
                },
              },
            },
          },
          400: {
            description: "Company is inactive",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "company is not active" },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          404: {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Company not found" },
              },
            },
          },
          500: {
            description: "Failed to update company",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company/delete/{id}": {
      delete: {
        tags: ["Company"],
        summary: "Delete company by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Company ID to delete",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Company deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                example: { success: true, message: "Company deleted successfully" },
              },
            },
          },
          400: {
            description: "Company is inactive",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "company is not active" },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          404: {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Company not found" },
              },
            },
          },
          500: {
            description: "Failed to delete company",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company/toggle-status/{id}": {
      put: {
        tags: ["Company"],
        summary: "Toggle company status (Active 1 <-> Inactive 0)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Company ID to toggle status",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Company status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company status updated successfully" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        status: { type: "integer", example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized (Token missing or invalid)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          403: {
            description: "Forbidden (SUPERADMIN role required)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          404: {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Company not found" },
              },
            },
          },
          500: {
            description: "Failed to toggle company status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // VEHICLE IMAGE
    // ----------------------------------------------------
    "/api/vehicle-image/save": {
      post: {
        tags: ["Vehicle Image"],
        summary: "Upload vehicle images (Single or Multiple)",
        description: "Uploads up to 20 images using `multipart/form-data`. You can send files under field name `images` or `image`.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["vehicle_id"],
                properties: {
                  vehicle_id: {
                    type: "integer",
                    example: 1,
                    description: "ID of the vehicle these images belong to",
                  },
                  images: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "binary",
                    },
                    description: "Select one or more image files (jpg, jpeg, png, webp)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Vehicle images created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle images created successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VehicleImage" },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Missing images or vehicle_id",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "At least one image is required" },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle not found with the provided vehicle_id" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-image/get": {
      get: {
        tags: ["Vehicle Image"],
        summary: "Get all vehicle images",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "vehicle_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Optional vehicle_id to filter images",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle images fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle images fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VehicleImage" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-image/vehicle/{vehicle_id}": {
      get: {
        tags: ["Vehicle Image"],
        summary: "Get images for a specific vehicle",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "vehicle_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Images for vehicle fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle images fetched successfully" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VehicleImage" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-image/get/{id}": {
      get: {
        tags: ["Vehicle Image"],
        summary: "Get single vehicle image by record ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle Image record ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle image fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle image fetched successfully" },
                    data: { $ref: "#/components/schemas/VehicleImage" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle image not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle image not found" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-image/update/{id}": {
      put: {
        tags: ["Vehicle Image"],
        summary: "Update vehicle image record",
        description: "Replaces image file or updates vehicle_id or status.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle Image record ID",
            example: 1,
          },
        ],
        requestBody: {
          required: false,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Replacement image file",
                  },
                  vehicle_id: { type: "integer", example: 1 },
                  status: { type: "integer", example: 1, description: "1 for Active, 0 for Inactive" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Vehicle image updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle image updated successfully" },
                    data: { $ref: "#/components/schemas/VehicleImage" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle image not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-image/delete/{id}": {
      delete: {
        tags: ["Vehicle Image"],
        summary: "Delete vehicle image",
        description: "Deletes the record from database and permanently removes the image file from server storage.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle Image ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle image deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                example: { success: true, message: "Vehicle image deleted successfully" },
              },
            },
          },
          404: {
            description: "Vehicle image not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Vehicle image not found" },
              },
            },
          },
        },
      },
    },
    "/api/vehicle-image/{id}/toggle-status": {
      patch: {
        tags: ["Vehicle Image"],
        summary: "Toggle vehicle image status (1 <-> 0)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle Image ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle image status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle image status updated successfully" },
                    data: { $ref: "#/components/schemas/VehicleImage" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle image not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORY VEHICLE MAP
    // ----------------------------------------------------
    "/api/category-vehicle-map/save": {
      post: {
        tags: ["Category Vehicle Map"],
        summary: "Map vehicle to single or multiple categories",
        description: `Maps a vehicle to one or more category IDs.
- **category_id** can be passed as:
  - An array: \`[1, 2, 3]\`
  - A comma separated string: \`"1, 2, 3"\`
  - A single number: \`1\`
- Set **replace: true** if you want to replace all existing category mappings for this vehicle.`,
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCategoryVehicleMapPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Vehicle and categories mapped successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle and categories mapped successfully" },
                    created_count: { type: "integer", example: 2 },
                    already_mapped_category_ids: { type: "array", items: { type: "integer" }, example: [] },
                    missing_category_ids: { type: "array", items: { type: "integer" }, example: [] },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 1 },
                          vehicle_id: { type: "integer", example: 1 },
                          category_id: { type: "integer", example: 2 },
                          status: { type: "integer", example: 1 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error (missing vehicle_id or category_id)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          404: {
            description: "Vehicle or Category not found in database",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
          409: {
            description: "All provided categories are already mapped to this vehicle",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "All provided categories are already mapped to this vehicle" },
                    already_mapped_category_ids: { type: "array", items: { type: "integer" }, example: [1, 2] },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/get": {
      get: {
        tags: ["Category Vehicle Map"],
        summary: "Get all category-vehicle mappings",
        description: "Returns mappings with embedded Category and Vehicle models. Supports query filtering.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "vehicle_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by vehicle ID",
            example: 1,
          },
          {
            name: "category_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by category ID",
            example: 2,
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by mapping status (1: Active, 0: Inactive)",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Category vehicle mappings fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Category vehicle mappings fetched successfully" },
                    total: { type: "integer", example: 1 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CategoryVehicleMap" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/get/{id}": {
      get: {
        tags: ["Category Vehicle Map"],
        summary: "Get single mapping by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Mapping ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mapping fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Mapping fetched successfully" },
                    data: { $ref: "#/components/schemas/CategoryVehicleMap" },
                  },
                },
              },
            },
          },
          404: {
            description: "Mapping not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/vehicle/{vehicle_id}": {
      get: {
        tags: ["Category Vehicle Map"],
        summary: "Get all categories mapped to a specific vehicle",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "vehicle_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Categories for vehicle fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Categories for vehicle fetched successfully" },
                    total: { type: "integer", example: 2 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CategoryVehicleMap" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/category/{category_id}": {
      get: {
        tags: ["Category Vehicle Map"],
        summary: "Get all vehicles mapped to a specific category",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "category_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Category ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicles for category fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicles for category fetched successfully" },
                    total: { type: "integer", example: 3 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CategoryVehicleMap" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/delete/{id}": {
      delete: {
        tags: ["Category Vehicle Map"],
        summary: "Delete a single mapping by ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Mapping ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mapping deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                example: { success: true, message: "Mapping deleted successfully" },
              },
            },
          },
          404: {
            description: "Mapping not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/vehicle/{vehicle_id}/remove": {
      delete: {
        tags: ["Category Vehicle Map"],
        summary: "Remove categories from a vehicle",
        description: "Specify `category_id` in the request body to remove specific mapped categories. If request body is empty, removes ALL mapped categories from this vehicle.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "vehicle_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RemoveCategoryFromVehiclePayload" },
            },
          },
        },
        responses: {
          200: {
            description: "Mappings removed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "2 mapping(s) removed successfully" },
                    deleted_count: { type: "integer", example: 2 },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/{id}/toggle-status": {
      patch: {
        tags: ["Category Vehicle Map"],
        summary: "Toggle mapping status (1 <-> 0)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Mapping ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mapping status updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Mapping status updated successfully" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        vehicle_id: { type: "integer", example: 1 },
                        category_id: { type: "integer", example: 2 },
                        status: { type: "integer", example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Mapping not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/vehicle-details": {
      get: {
        tags: ["Category Vehicle Map"],
        summary: "Master Listing API: All vehicles with categories and full image URLs",
        description: "Returns all vehicles with full details. Aliased also at `/api/category-vehicle-map/details`.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter vehicle_no by text",
            example: "WB",
          },
          {
            name: "category_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by category ID",
            example: 1,
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by status (1: Active, 0: Inactive)",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicles listing fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicles listing fetched successfully" },
                    total: { type: "integer", example: 1 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/VehicleFullDetails" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/category-vehicle-map/vehicle-details/{vehicle_id}": {
      get: {
        tags: ["Category Vehicle Map"],
        summary: "Master Details API: Single vehicle full details",
        description: "Returns single vehicle with complete categories and image URLs. Aliased also at `/api/category-vehicle-map/details/{vehicle_id}`.",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "vehicle_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Vehicle ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicle details fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicle details fetched successfully" },
                    data: { $ref: "#/components/schemas/VehicleFullDetails" },
                  },
                },
              },
            },
          },
          404: {
            description: "Vehicle not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ----------------------------------------------------
    // COMPANY CAR MAP
    // ----------------------------------------------------
    "/api/company-car-map/create": {
      post: {
        tags: ["Company Car Map"],
        summary: "Create company-vehicle mapping (single or multiple vehicles)",
        description: "Map one or multiple vehicles to a company. Provide either `vehicle_id` (single) or `vehicle_ids` (array or comma-separated string). Optionally pass `replace: true` to clear previous mappings for this company.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCompanyCarMapPayload" },
            },
          },
        },
        responses: {
          201: {
            description: "Company-vehicle mappings created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Company‑vehicle mappings created" },
                    created_count: { type: "integer", example: 2 },
                    missing_vehicle_ids: {
                      type: "array",
                      items: { type: "integer" },
                      example: [],
                    },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CompanyCarMap" },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error (missing company_id or vehicle_id)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "company_id is required" },
              },
            },
          },
          404: {
            description: "Company not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Company not found" },
              },
            },
          },
          409: {
            description: "Conflict: all provided vehicles are already mapped",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: false },
                    message: { type: "string", example: "All provided vehicles are already mapped" },
                    already_mapped_vehicle_ids: {
                      type: "array",
                      items: { type: "integer" },
                      example: [1],
                    },
                    missing_vehicle_ids: {
                      type: "array",
                      items: { type: "integer" },
                      example: [],
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company-car-map/getAll": {
      get: {
        tags: ["Company Car Map"],
        summary: "Get all company-vehicle mappings with optional filters",
        description: "Fetches company-vehicle mappings with associated company and vehicle relations. Supports optional filtering by `company_id`, `vehicle_id`, and `status`.",
        parameters: [
          {
            name: "company_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by Company ID",
            example: 1,
          },
          {
            name: "vehicle_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by Vehicle ID",
            example: 2,
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by Status (1: Active, 0: Inactive)",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mappings fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Mappings fetched" },
                    total: { type: "integer", example: 5 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CompanyCarMap" },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company-car-map/company/{company_id}/vehicles": {
      get: {
        tags: ["Company Car Map"],
        summary: "Get all vehicles mapped to a specific company",
        description: "Returns all mapped vehicle records for the given company_id with vehicle details included.",
        parameters: [
          {
            name: "company_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Company ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Vehicles for company fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Vehicles for company fetched" },
                    total: { type: "integer", example: 3 },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CompanyCarMap" },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company-car-map/{id}": {
      get: {
        tags: ["Company Car Map"],
        summary: "Get single company-vehicle mapping by ID",
        description: "Fetches details of a single mapping record by primary key with company and vehicle included.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Mapping ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mapping fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Mapping fetched" },
                    data: { $ref: "#/components/schemas/CompanyCarMap" },
                  },
                },
              },
            },
          },
          404: {
            description: "Mapping not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Mapping not found" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Company Car Map"],
        summary: "Delete company-vehicle mapping by ID",
        description: "Permanently removes a company-vehicle mapping entry by its ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Mapping ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mapping deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardSuccessResponse" },
                example: { success: true, message: "Mapping deleted" },
              },
            },
          },
          404: {
            description: "Mapping not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Mapping not found" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/company-car-map/{id}/status": {
      patch: {
        tags: ["Company Car Map"],
        summary: "Toggle mapping status (Active 1 <-> Inactive 0)",
        description: "Switches the mapping status between Active (1) and Inactive (0).",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Mapping ID",
            example: 1,
          },
        ],
        responses: {
          200: {
            description: "Mapping status toggled successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Mapping status updated" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 1 },
                        status: { type: "integer", example: 0 },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Mapping not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
                example: { success: false, message: "Mapping not found" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
