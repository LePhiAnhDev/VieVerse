const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

// GET /api/company/:address
router.get("/:address", companyController.getCompany);
// POST /api/company/register
router.post("/register", companyController.registerCompany);

module.exports = router;
