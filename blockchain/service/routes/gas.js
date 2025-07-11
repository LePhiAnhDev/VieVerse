const express = require("express");
const router = express.Router();
const gasController = require("../controllers/gasController");

/**
 * @route   GET /gas/analysis
 * @desc    Get current gas price analysis and recommendations
 * @access  Public
 */
router.get("/analysis", gasController.getGasAnalysis);

/**
 * @route   POST /gas/estimate
 * @desc    Estimate gas for a specific contract method
 * @access  Public
 */
router.post("/estimate", gasController.estimateGas);

/**
 * @route   GET /gas/defaults
 * @desc    Get default gas limits for all methods
 * @access  Public
 */
router.get("/defaults", gasController.getDefaultGasLimits);

/**
 * @route   POST /gas/prepare
 * @desc    Prepare transaction configuration with gas estimation
 * @access  Public
 */
router.post("/prepare", gasController.prepareTransaction);

/**
 * @route   POST /gas/format
 * @desc    Format gas price in different units
 * @access  Public
 */
router.post("/format", gasController.formatGasPrice);

/**
 * @route   POST /gas/validate
 * @desc    Validate gas configuration
 * @access  Public
 */
router.post("/validate", gasController.validateGasConfig);

module.exports = router;
