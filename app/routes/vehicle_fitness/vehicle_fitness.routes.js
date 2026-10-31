const express = require("express");
const router = express.Router();
const vehicleFitnessController = require("../../controller/vehicle_fitness/vehicle_fitness.controller");
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

// Create vehicle fitness
router.post("/uploadFitness", uploadDoc, vehicleFitnessController.createVehicleFitness);


// Get all vehicle fitness records (supports ?vehical_id=... or ?vehicle_id=... & ?status=...)
router.get("/getAllFitness", vehicleFitnessController.getAllVehicleFitness);


// Get fitness records for a specific vehicle
router.get("/vehical/:vehical_id", vehicleFitnessController.getFitnessByVehicleId);


// Get vehicle fitness by ID
router.get("/get/:id", vehicleFitnessController.getVehicleFitnessById);


// Update vehicle fitness
router.put("/update/:id", uploadDoc, vehicleFitnessController.updateVehicleFitness);

// Delete vehicle fitness
router.delete("/delete/:id", vehicleFitnessController.deleteVehicleFitness);

// Toggle vehicle fitness status
router.patch("/:id/toggle-status", vehicleFitnessController.toggleVehicleFitnessStatus);

module.exports = router;

