const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// GET /api/student/:address
router.get("/:address", studentController.getStudent);

module.exports = router;
