const express = require("express");
const router = express.Router();
const vehicleInfoController = require("../../controller/vehicle_info/vehicle_info.controller");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

const mappingController = require("../../controller/category_vehical_map/category_vehical_map.controller");

// Create vehicle info
router.post("/save", vehicleInfoController.createVehicleInfo);

// Get complete details of vehicles (includes categories + images)
router.get("/details", mappingController.getAllVehiclesFullDetails);
router.get("/details/:id", mappingController.getVehicleFullDetails);

// Get all vehicle info
router.get("/get", vehicleInfoController.getAllVehicleInfo);

// Get vehicle info by ID
router.get("/get/:id", vehicleInfoController.getVehicleInfoById);

// Update vehicle info
router.put("/update/:id", vehicleInfoController.updateVehicleInfo);

// Delete vehicle info
router.delete("/delete/:id", vehicleInfoController.deleteVehicleInfo);

// Toggle vehicle status
router.patch(
  "/:id/toggle-status",
  vehicleInfoController.toggleVehicleInfoStatus,
);

module.exports = router;
