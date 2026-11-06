const express = require("express");
const router = express.Router();
const driverController = require("../../controller/driver/driver.controller");
const uploadImage = require("../../utils/multer");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

// Middleware to handle profile image uploads (supports profile_img, image, or file)
const uploadProfileImg = uploadImage.fields([
  { name: "profile_img", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

// Create / Register Driver
router.post("/register", uploadProfileImg, driverController.createDriver);
router.post("/save", uploadProfileImg, driverController.createDriver);

// Get All Drivers (?status=...&search=...)
router.get("/getAll", driverController.getAllDrivers);
router.get("/get", driverController.getAllDrivers);

// Get Driver by ID
router.get("/get/:id", driverController.getDriverById);

// Update Driver
router.put("/update/:id", uploadProfileImg, driverController.updateDriver);
router.patch("/update/:id", uploadProfileImg, driverController.updateDriver);

// Toggle Driver Status
router.patch("/:id/toggle-status", driverController.toggleDriverStatus);
router.patch("/toggle-status/:id", driverController.toggleDriverStatus);

// Delete Driver
router.delete("/delete/:id", driverController.deleteDriver);

module.exports = router;
