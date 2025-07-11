const express = require("express");
const router = express.Router();
const reputationController = require("../controllers/reputationController");

// GET /api/reputation/:address
router.get("/:address", reputationController.getReputation);

module.exports = router;
