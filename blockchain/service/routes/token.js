const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");

// GET /api/token/balance/:address
router.get("/balance/:address", tokenController.getBalance);
// POST /api/token/mint
router.post("/mint", tokenController.mint);
// POST /api/token/burn
router.post("/burn", tokenController.burn);
// GET /api/token/supply
router.get("/supply", tokenController.getTotalSupply);
// GET /api/token/info
router.get("/info", tokenController.getTokenInfo);

module.exports = router;
