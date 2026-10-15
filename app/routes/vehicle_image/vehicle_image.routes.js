const express = require("express");
const router = express.Router();
const vehicleImageController = require("../../controller/vehicle_image/vehicle_image.controller");

const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

// Create vehicle image
router.post("/save", vehicleImageController.createVehicleImage);

// Get all vehicle images (optional query: ?vehicle_id=1)
router.get("/get", vehicleImageController.getAllVehicleImages);

// Get vehicle images by vehicle_id
router.get("/vehicle/:vehicle_id", vehicleImageController.getImagesByVehicleId);

// Get vehicle image by ID
router.get("/get/:id", vehicleImageController.getVehicleImageById);

// Update vehicle image
router.put("/update/:id", vehicleImageController.updateVehicleImage);

// Delete vehicle image
router.delete("/delete/:id", vehicleImageController.deleteVehicleImage);

// Toggle vehicle image status
router.patch(
  "/:id/toggle-status",
  vehicleImageController.toggleVehicleImageStatus
);

module.exports = router;
