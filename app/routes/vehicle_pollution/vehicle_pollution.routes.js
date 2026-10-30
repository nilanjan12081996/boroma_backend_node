const express = require("express");
const router = express.Router();
const vehiclePollutionController = require("../../controller/vehicle_pollution/vehicle_pollution.controller");
const uploadImage = require("../../utils/multer");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");


router.use(authCheck, checkRole("SUPERADMIN"));

// Middleware for document upload (accepts 'document', 'file', or 'document_url' fields)
const uploadDoc = uploadImage.fields([
  { name: "document", maxCount: 1 },
  { name: "document_url", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Create vehicle pollution
router.post("/uploadPollution", uploadDoc, vehiclePollutionController.createVehiclePollution);

// Get all vehicle pollutions (supports ?vehical_id=... & ?status=...)
router.get("/getAllPollution", vehiclePollutionController.getAllVehiclePollutions);

// Get pollutions for a specific vehicle
router.get("/vehical/:vehical_id", vehiclePollutionController.getPollutionsByVehicleId);

// Get vehicle pollution by ID
router.get("/get/:id", vehiclePollutionController.getVehiclePollutionById);

// Update vehicle pollution
router.put("/update/:id", uploadDoc, vehiclePollutionController.updateVehiclePollution);

// Delete vehicle pollution
router.delete("/delete/:id", vehiclePollutionController.deleteVehiclePollution);

// Toggle vehicle pollution status
router.patch("/:id/toggle-status", vehiclePollutionController.toggleVehiclePollutionStatus);

module.exports = router;
