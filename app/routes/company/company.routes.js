const express = require("express");
const router = express.Router();
const companyController = require("../../controller/company/company.controller");
const authCheck = require("../../middleware/authCheck");
const checkRole = require("../../middleware/checkRole");

router.use(authCheck, checkRole("SUPERADMIN"));

router.post("/create", companyController.createCompany);
router.get("/get-all", companyController.getAllCompany);
router.get("/get-by-id/:id", companyController.getCompanyById);
router.put("/update/:id", companyController.updateCompany);
router.delete("/delete/:id", companyController.deleteCompany);
router.put("/toggle-status/:id", companyController.toggleCompanyStatus);

module.exports = router;
