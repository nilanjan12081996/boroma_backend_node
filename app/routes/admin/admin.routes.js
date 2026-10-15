const express = require("express");
const AdminController = require("../../controller/admin/admin.controller");
const router = express.Router();

router.get("/admins", AdminController.getAdmins);

module.exports= router