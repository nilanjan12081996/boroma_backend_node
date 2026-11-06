const express = require("express");
const router = express.Router();
const vehicleInsuranceController = require("../../controller/vehicle_insurance/vehicle_insurance.controller");
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

// 1. Create vehicle insurance
router.post("/uploadInsurance", uploadDoc, vehicleInsuranceController.createVehicleInsurance);
router.post("/save", uploadDoc, vehicleInsuranceController.createVehicleInsurance);
router.post("/create", uploadDoc, vehicleInsuranceController.createVehicleInsurance);

// 2. Get all vehicle insurance records (supports ?vehical_id=... & ?status=...)
router.get("/getAllInsurance", vehicleInsuranceController.getAllVehicleInsurance);
router.get("/getAll", vehicleInsuranceController.getAllVehicleInsurance);
router.get("/get", vehicleInsuranceController.getAllVehicleInsurance);

// 3. Get insurance records for a specific vehicle
router.get("/vehical/:vehical_id", vehicleInsuranceController.getInsuranceByVehicleId);
router.get("/vehicle/:vehicle_id", vehicleInsuranceController.getInsuranceByVehicleId);

// 4. Get vehicle insurance by ID
router.get("/get/:id", vehicleInsuranceController.getVehicleInsuranceById);

// 5. Update vehicle insurance
router.put("/update/:id", uploadDoc, vehicleInsuranceController.updateVehicleInsurance);

// 6. Delete vehicle insurance
router.delete("/delete/:id", vehicleInsuranceController.deleteVehicleInsurance);

// 7. Toggle vehicle insurance status
router.patch("/:id/toggle-status", vehicleInsuranceController.toggleVehicleInsuranceStatus);
router.patch("/toggle-status/:id", vehicleInsuranceController.toggleVehicleInsuranceStatus);

module.exports = router;

