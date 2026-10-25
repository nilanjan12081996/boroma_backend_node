const express = require("express");
const AdminController = require("../../controller/admin/admin.controller");
const router = express.Router();

router.get("/admins", AdminController.getAdmins);
router.get("/generate-token", AdminController.generateTestToken);
router.post("/generate-token", AdminController.generateTestToken);

module.exports = router;