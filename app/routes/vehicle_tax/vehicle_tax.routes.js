const express = require("express");
const router = express.Router();
const vehicleTaxController = require("../../controller/vehicle_tax/vehicle_tax.controller");
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

// Create vehicle tax
router.post("/uploadTax", uploadDoc, vehicleTaxController.createVehicleTax);

// Get all vehicle taxes (supports ?vehical_id=... & ?status=...)
router.get("/getAllTax", vehicleTaxController.getAllVehicleTaxes);

// Get taxes for a specific vehicle
router.get("/vehical/:vehical_id", vehicleTaxController.getTaxesByVehicleId);

// Get vehicle tax by ID
router.get("/get/:id", vehicleTaxController.getVehicleTaxById);

// Update vehicle tax
router.put("/update/:id", uploadDoc, vehicleTaxController.updateVehicleTax);

// Delete vehicle tax
router.delete("/delete/:id", vehicleTaxController.deleteVehicleTax);

// Toggle vehicle tax status
router.patch("/:id/toggle-status", vehicleTaxController.toggleVehicleTaxStatus);

module.exports = router;
