const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

// GET /api/company/:address
router.get("/:address", companyController.getCompany);

module.exports = router;
