const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// GET /api/student/:address
router.get("/:address", studentController.getStudent);
// POST /api/student/register
router.post("/register", studentController.registerStudent);
// GET /api/student/reputation/:address (for tests compatibility)
router.get("/reputation/:address", studentController.getReputation);

module.exports = router;
