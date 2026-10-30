const express = require("express");
const router = express.Router();
const vehiclePermitController = require("../../controller/vehicle_permit/vehicle_permit.controller");
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

// Create vehicle permit
router.post("/uploadPermit", uploadDoc, vehiclePermitController.createVehiclePermit);


// Get all vehicle permits (supports ?vehical_id=... or ?vehicle_id=... & ?status=...)
router.get("/getAllPermit", vehiclePermitController.getAllVehiclePermits);

// Get permits for a specific vehicle
router.get("/vehical/:vehical_id", vehiclePermitController.getPermitsByVehicleId);


// Get vehicle permit by ID
router.get("/get/:id", vehiclePermitController.getVehiclePermitById);


// Update vehicle permit
router.put("/update/:id", uploadDoc, vehiclePermitController.updateVehiclePermit);

// Delete vehicle permit
router.delete("/delete/:id", vehiclePermitController.deleteVehiclePermit);

// Toggle vehicle permit status
router.patch("/:id/toggle-status", vehiclePermitController.toggleVehiclePermitStatus);

module.exports = router;
