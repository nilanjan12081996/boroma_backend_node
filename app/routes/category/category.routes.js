const express = require("express");
const router = express.Router();
const categoryController = require("../../controller/category/category.controller");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

// Create category
router.post("/save", categoryController.createCategory);

router.get("/get", categoryController.getAllCategory);

router.get("/get/:id", categoryController.getCategoryById);

router.put("/update/:id", categoryController.updateCategory);

router.delete("/delete/:id", categoryController.deleteCategory);

router.patch("/:id/toggle-status", categoryController.toggleCategory);

// Allowed short name list
router.get("/allowed-short-names", categoryController.getAllowedShortNames);

// Single API to fetch categories short_name wise (all grouped or by specific short_name)
// Examples:
// GET /api/category/by-short-name
// GET /api/category/by-short-name/:short_name (e.g. /by-short-name/Transport_Type)
router.get("/by-short-name", categoryController.getCategoriesByShortName);
router.get("/by-short-name/:short_name", categoryController.getCategoriesByShortName);
router.get("/get-by-short-name", categoryController.getCategoriesByShortName);
router.get("/get-by-short-name/:short_name", categoryController.getCategoriesByShortName);

/*
// =========================================================================
// OLD DROPDOWN ROUTES (COMMENTED OUT AS PER REQUIREMENT)
// Replaced by: /api/category/by-short-name
// =========================================================================
router.get("/transport-types", categoryController.getTransportTypes);
router.get("/car-types", categoryController.getCarTypes);
router.get("/bus-types", categoryController.getBusTypes);
router.get("/fuel-types", categoryController.getFuelTypes);
router.get("/bus-model", categoryController.getBusModel);
router.get("/car-model", categoryController.getCarModel);
router.get("/frequency-types", categoryController.getFrequencyTypes);
*/

module.exports = router;
