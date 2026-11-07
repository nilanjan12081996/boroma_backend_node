const express = require("express");
const router = express.Router();
const companyOperatorController = require("../../controller/company_operator/company_operator.controller");
const authCheck = require("../../middleware/authCheck");

// ----------------------------------------------------
// CREATE / REGISTER OPERATOR
// ----------------------------------------------------
router.post("/create", companyOperatorController.createCompanyOperator);


// ----------------------------------------------------
// READ / GET OPERATORS
// ----------------------------------------------------
// Get All Operators (?search=...&is_active=...&is_approved=...&page=...&limit=...)

router.get("/get-all", companyOperatorController.getAllCompanyOperators);


// Get Operator By ID
router.get("/get/:id", companyOperatorController.getCompanyOperatorById);

// ----------------------------------------------------
// UPDATE OPERATOR
// ----------------------------------------------------

router.patch("/update/:id", companyOperatorController.updateCompanyOperator);

// Toggle Status (is_active 1 <-> 0)
router.patch("/toggle-status/:id", companyOperatorController.toggleCompanyOperatorStatus);


// Toggle Approval (is_approved 1 <-> 0)
router.patch("/toggle-approval/:id", companyOperatorController.toggleCompanyOperatorApproval);


// ----------------------------------------------------
// DELETE OPERATOR
// ----------------------------------------------------
router.delete("/delete/:id", companyOperatorController.deleteCompanyOperator);




module.exports = router;
