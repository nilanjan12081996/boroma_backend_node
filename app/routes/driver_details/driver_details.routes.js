const express = require("express");
const router = express.Router();
const driverDetailsController = require("../../controller/driver_details/driver_details.controller");
const uploadImage = require("../../utils/multer");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

// Protect all routes with Superadmin authentication
router.use(authCheck, checkRole("SUPERADMIN"));

// Middleware for document upload (accepts doc_url, document, file, or document_url)
const uploadDoc = uploadImage.fields([
  { name: "doc_url", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "document_url", maxCount: 1 },
]);

/**
 * 1. Create or Update Driver Details (Single endpoint for both)
 * - /save (without :id) -> Create new record
 * - /save/:id (with :id) -> Update existing record
 */
router.post(["/save", "/save/:id"], uploadDoc, driverDetailsController.saveDriverDetails);
router.put("/save/:id", uploadDoc, driverDetailsController.saveDriverDetails);

/**
 * 
 * 2. Get Single or All Driver Details (Single endpoint for both)
 * - /get (without :id) -> Fetch all records (supports ?driver_id=...&doc_type=...&status=...)
 * - /get/:id (with :id) -> Fetch single record by ID
 */
router.get(["/get", "/get/:id"], driverDetailsController.getDriverDetails);

/**
 * 3. Toggle Status (1 -> 0, 0 -> 1)
 */
router.patch("/:id/toggle-status", driverDetailsController.toggleDriverDetailsStatus);

/**
 * 4. Delete Driver Details by ID
 */
router.delete("/delete/:id", driverDetailsController.deleteDriverDetails);

module.exports = router;
