const express = require("express");
const router = express.Router();
const companyOperatorController = require("../../controller/company_operator/company_operator.controller");
const authCheck = require("../../middleware/authCheck");

// ----------------------------------------------------
// CREATE / REGISTER OPERATOR
// ----------------------------------------------------
router.post("/create", companyOperatorController.createCompanyOperator);
router.post("/add", companyOperatorController.createCompanyOperator);
router.post("/register", companyOperatorController.createCompanyOperator);

// ----------------------------------------------------
// READ / GET OPERATORS
// ----------------------------------------------------
// Get All Operators (?search=...&is_active=...&is_approved=...&page=...&limit=...)
router.get("/getAll", companyOperatorController.getAllCompanyOperators);
router.get("/get-all", companyOperatorController.getAllCompanyOperators);
router.get("/", companyOperatorController.getAllCompanyOperators);

// Get Operator By ID
router.get("/get/:id", companyOperatorController.getCompanyOperatorById);
router.get("/get-by-id/:id", companyOperatorController.getCompanyOperatorById);
router.get("/:id", companyOperatorController.getCompanyOperatorById);

// ----------------------------------------------------
// UPDATE OPERATOR
// ----------------------------------------------------
router.put("/update/:id", companyOperatorController.updateCompanyOperator);
router.patch("/update/:id", companyOperatorController.updateCompanyOperator);

// Toggle Status (is_active 1 <-> 0)
router.patch("/toggle-status/:id", companyOperatorController.toggleCompanyOperatorStatus);
router.put("/toggle-status/:id", companyOperatorController.toggleCompanyOperatorStatus);

// Toggle Approval (is_approved 1 <-> 0)
router.patch("/toggle-approval/:id", companyOperatorController.toggleCompanyOperatorApproval);
router.put("/toggle-approval/:id", companyOperatorController.toggleCompanyOperatorApproval);

// ----------------------------------------------------
// DELETE OPERATOR
// ----------------------------------------------------
router.delete("/delete/:id", companyOperatorController.deleteCompanyOperator);
router.delete("/:id", companyOperatorController.deleteCompanyOperator);



module.exports = router;
