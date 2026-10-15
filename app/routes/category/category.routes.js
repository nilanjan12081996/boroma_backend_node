const express = require("express");
const router = express.Router();
const categoryController = require("../../controller/category/category.controller");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

// Create category
router.post("/save", categoryController.createCategory);

router.get("/get", categoryController.getAllCategory);

router.get("/get/:id", categoryController.getCategoryById);

router.put("/update/:id", categoryController.updateCategory);

router.delete("/delete/:id", categoryController.deleteCategory);

router.patch("/:id/toggle-status", categoryController.toggleCategory);

module.exports = router;
