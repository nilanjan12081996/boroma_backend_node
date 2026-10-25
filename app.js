const express = require("express");
const path = require("path");
const { connectDB } = require("./app/config/db");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./app/docs/swagger");
const routes = require("./app/routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Swagger UI Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Boroma Fleet API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  })
);
app.use("/docs", (req, res) => res.redirect("/api-docs"));

// Raw OpenAPI 3.0 specification JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});

// API Root Info
app.get("/", (req, res) => {
  res.json({
    message: "Boroma Vehicle Fleet Management Backend API is active",
    documentation_ui: "/api-docs",
    openapi_json: "/api-docs.json",
    version: "1.0.0",
  });
});

app.use("/api", routes);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger documentation: http://localhost:${PORT}/api-docs`);
    console.log(`Swagger JSON schema: http://localhost:${PORT}/api-docs.json`);
  });
};

startServer();