const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");

// GET /api/tokens/balance/:address
router.get("/balance/:address", tokenController.getBalance);

// POST /api/tokens/mint
router.post("/mint", tokenController.mintTokens);

// POST /api/tokens/burn
router.post("/burn", tokenController.burnTokens);

// GET /api/tokens/supply
router.get("/supply", tokenController.getTotalSupply);

// GET /api/tokens/info
router.get("/info", tokenController.getTokenInfo);

// POST /api/tokens/transfer
router.post("/transfer", tokenController.transferTokens);

// POST /api/tokens/approve
router.post("/approve", tokenController.approveTokens);

// POST /api/tokens/transferFrom
router.post("/transferFrom", tokenController.transferFrom);

// GET /api/tokens/allowance/:owner/:spender
router.get("/allowance/:owner/:spender", tokenController.getAllowance);

module.exports = router;
