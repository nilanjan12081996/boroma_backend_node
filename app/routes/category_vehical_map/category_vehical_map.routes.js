const express = require("express");
const router = express.Router();
const mappingController = require("../../controller/category_vehical_map/category_vehical_map.controller");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");


router.use(authCheck, checkRole("SUPERADMIN"));

// Map vehicle to one or multiple categories
router.post("/save", mappingController.createCategoryVehicleMap);

// Get all mappings (supports ?vehicle_id=, ?category_id=, ?status= query params)
router.get("/get", mappingController.getAllCategoryVehicleMaps);

// Get single mapping by ID
router.get("/get/:id", mappingController.getCategoryVehicleMapById);

// Get all categories mapped to a specific vehicle_id
router.get("/vehicle/:vehicle_id", mappingController.getCategoriesByVehicleId);

// Get all vehicles mapped to a specific category_id
router.get("/category/:category_id", mappingController.getVehiclesByCategoryId);

// Delete single mapping by ID
router.delete("/delete/:id", mappingController.deleteCategoryVehicleMap);

// Remove category mappings from a vehicle
router.delete("/vehicle/:vehicle_id/remove", mappingController.removeCategoriesFromVehicle);

// Toggle mapping status (Active / Inactive)
router.patch("/:id/toggle-status", mappingController.toggleCategoryVehicleMapStatus);

// Complete Listing API (includes vehicle info, all mapped categories, and images)
router.get("/vehicle-details", mappingController.getAllVehiclesFullDetails);
router.get("/vehicle-details/:vehicle_id", mappingController.getVehicleFullDetails);

// Convenient aliases: /details and /details/:id
router.get("/details", mappingController.getAllVehiclesFullDetails);
router.get("/details/:vehicle_id", mappingController.getVehicleFullDetails);

module.exports = router;
