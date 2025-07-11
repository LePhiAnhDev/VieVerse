const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");

// GET /api/token/balance/:address
router.get("/balance/:address", tokenController.getBalance);
// POST /api/token/mint
router.post("/mint", tokenController.mint);
// POST /api/token/burn
router.post("/burn", tokenController.burn);

module.exports = router;
