const express = require("express");
const router = express.Router();
const driverController = require("../../controller/driver/driver.controller");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

// Create / Register Driver
router.post("/register", driverController.createDriver);
router.post("/save", driverController.createDriver);

// Get All Drivers (?status=...&search=...)
router.get("/getAll", driverController.getAllDrivers);
router.get("/get", driverController.getAllDrivers);

// Get Driver by ID
router.get("/get/:id", driverController.getDriverById);

// Update Driver
router.put("/update/:id", driverController.updateDriver);

// Toggle Driver Status
router.patch("/:id/toggle-status", driverController.toggleDriverStatus);
router.patch("/toggle-status/:id", driverController.toggleDriverStatus);

// Delete Driver
router.delete("/delete/:id", driverController.deleteDriver);

module.exports = router;
