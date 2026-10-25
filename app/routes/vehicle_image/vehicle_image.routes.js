const express = require("express");
const router = express.Router();
const vehicleImageController = require("../../controller/vehicle_image/vehicle_image.controller");
const uploadImage = require("../../utils/multer");

const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

// Middleware to handle image uploads cleanly (supports 'images', 'image', or any field name)
// const handleUpload = (req, res, next) => {
//   uploadImage.any()(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({
//         success: false,
//         message: err.message || "Failed to upload image",
//       });
//     }
//     next();
//   });
// };

router.post(
  "/save",
  uploadImage.fields([
    { name: "images", maxCount: 20 },
    { name: "image", maxCount: 20 },
  ]),
  vehicleImageController.createVehicleImage
);

// Get all vehicle images (optional query: ?vehicle_id=1)
router.get("/get", vehicleImageController.getAllVehicleImages);

// Get vehicle images by vehicle_id
router.get("/vehicle/:vehicle_id", vehicleImageController.getImagesByVehicleId);

// Get vehicle image by ID
router.get("/get/:id", vehicleImageController.getVehicleImageById);

// Update vehicle image
router.put("/update/:id", uploadImage.single("image"), vehicleImageController.updateVehicleImage);

// Delete vehicle image
router.delete("/delete/:id", vehicleImageController.deleteVehicleImage);

// Toggle vehicle image status
router.patch(
  "/:id/toggle-status",
  vehicleImageController.toggleVehicleImageStatus
);

module.exports = router;
