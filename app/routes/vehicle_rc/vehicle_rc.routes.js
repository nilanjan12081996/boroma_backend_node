const express = require("express");
const router = express.Router();
const vehicleRCController = require("../../controller/vehicle_rc/vehicle_rc.controller");
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

// 1. Create vehicle RC
router.post("/uploadRC", uploadDoc, vehicleRCController.createVehicleRC);
router.post("/save", uploadDoc, vehicleRCController.createVehicleRC);
router.post("/create", uploadDoc, vehicleRCController.createVehicleRC);

// 2. Get all vehicle RC records (supports ?vehical_id=... & ?status=...)
router.get("/getAllRC", vehicleRCController.getAllVehicleRC);
router.get("/getAll", vehicleRCController.getAllVehicleRC);
router.get("/get", vehicleRCController.getAllVehicleRC);

// 3. Get RC records for a specific vehicle
router.get("/vehical/:vehical_id", vehicleRCController.getRCByVehicleId);
router.get("/vehicle/:vehicle_id", vehicleRCController.getRCByVehicleId);

// 4. Get vehicle RC by ID
router.get("/get/:id", vehicleRCController.getVehicleRCById);

// 5. Update vehicle RC
router.put("/update/:id", uploadDoc, vehicleRCController.updateVehicleRC);

// 6. Delete vehicle RC
router.delete("/delete/:id", vehicleRCController.deleteVehicleRC);

// 7. Toggle vehicle RC status
router.patch("/:id/toggle-status", vehicleRCController.toggleVehicleRCStatus);
router.patch("/toggle-status/:id", vehicleRCController.toggleVehicleRCStatus);

module.exports = router;

