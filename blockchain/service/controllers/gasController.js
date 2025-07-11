const { ethers } = require("ethers");
const GasUtils = require("../utils/gasUtils");
const {
  verificationContract,
  tokenContract,
  utilityContract,
  provider,
} = require("../services/contractService");
const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Get current gas price analysis and recommendations
 */
exports.getGasAnalysis = asyncHandler(async (req, res) => {
  try {
    const analysis = await GasUtils.analyzeGasPrices(provider);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: "gas_analysis",
    });
  }
});

/**
 * Estimate gas for a specific contract method
 */
exports.estimateGas = asyncHandler(async (req, res) => {
  const { contract, method, args = [], options = {} } = req.body;

  try {
    let contractInstance;

    // Select contract based on parameter
    switch (contract) {
      case "verification":
        contractInstance = verificationContract;
        break;
      case "token":
        contractInstance = tokenContract;
        break;
      case "utility":
        contractInstance = utilityContract;
        break;
      default:
        return res.status(400).json({
          success: false,
          error:
            "Invalid contract type. Use 'verification', 'token', or 'utility'",
          type: "validation",
        });
    }

    // Validate method exists
    if (
      !contractInstance[method] ||
      typeof contractInstance[method] !== "function"
    ) {
      return res.status(400).json({
        success: false,
        error: `Method '${method}' not found on contract`,
        type: "validation",
      });
    }

    // Estimate gas with strict validation
    let gasLimit;
    try {
      gasLimit = await GasUtils.estimateGas(
        contractInstance,
        method,
        args,
        { ...options, strict: true } // Enable strict mode for validation
      );
    } catch (error) {
      // If estimation fails with invalid args, return validation error
      if (
        error.message.includes("invalid") ||
        error.message.includes("revert") ||
        error.message.includes("execution reverted")
      ) {
        return res.status(400).json({
          success: false,
          error: `Invalid arguments for method '${method}': ${error.message}`,
          type: "validation",
        });
      }
      throw error; // Re-throw other errors
    }

    // Get gas price info
    const gasPriceConfig = await GasUtils.getOptimizedGasPrice(
      provider,
      options
    );

    // Calculate estimated cost
    const estimatedCost = GasUtils.calculateTransactionCost(
      gasLimit,
      gasPriceConfig.gasPrice || gasPriceConfig.maxFeePerGas
    );

    res.json({
      success: true,
      estimation: {
        contract,
        method,
        args,
        gasLimit: gasLimit.toString(),
        gasPrice: gasPriceConfig,
        estimatedCost,
        defaultGasForMethod: GasUtils.getDefaultGasForMethod(method).toString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: "gas_estimation",
    });
  }
});

/**
 * Get default gas limits for all methods
 */
exports.getDefaultGasLimits = asyncHandler(async (req, res) => {
  try {
    const methods = [
      // Token operations
      "mint",
      "burn",
      "transfer",
      "approve",
      // Task operations
      "createTask",
      "acceptTask",
      "submitTask",
      "verifyTask",
      // Registration operations
      "registerCompany",
      "registerStudent",
      "verifyCompany",
      // Utility operations
      "enrollCourse",
      "redeemReward",
      "joinEvent",
      "purchaseCertification",
      // Admin operations
      "addModerator",
      "removeModerator",
      "updateSecuritySettings",
      "activateEmergencyStop",
      "deactivateEmergencyStop",
    ];

    const gasLimits = {};

    methods.forEach((method) => {
      gasLimits[method] = GasUtils.getDefaultGasForMethod(method).toString();
    });

    res.json({
      success: true,
      defaultGasLimits: gasLimits,
      config: GasUtils.DEFAULT_GAS_CONFIG,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: "gas_limits",
    });
  }
});

/**
 * Prepare transaction configuration with gas estimation
 */
exports.prepareTransaction = asyncHandler(async (req, res) => {
  const { contract, method, args = [], options = {} } = req.body;

  try {
    let contractInstance;

    // Select contract based on parameter
    switch (contract) {
      case "verification":
        contractInstance = verificationContract;
        break;
      case "token":
        contractInstance = tokenContract;
        break;
      case "utility":
        contractInstance = utilityContract;
        break;
      default:
        return res.status(400).json({
          success: false,
          error:
            "Invalid contract type. Use 'verification', 'token', or 'utility'",
          type: "validation",
        });
    }

    // Validate method exists
    if (
      !contractInstance[method] ||
      typeof contractInstance[method] !== "function"
    ) {
      return res.status(400).json({
        success: false,
        error: `Method '${method}' not found on contract`,
        type: "validation",
      });
    }

    // Prepare transaction
    const txConfig = await GasUtils.prepareTransaction(
      contractInstance,
      method,
      args,
      options
    );

    res.json({
      success: true,
      transactionConfig: {
        contract,
        method,
        args,
        ...txConfig,
        gasLimit: txConfig.gasLimit.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: "transaction_preparation",
    });
  }
});

/**
 * Get gas price in different units
 */
exports.formatGasPrice = asyncHandler(async (req, res) => {
  const { gasPrice } = req.body;

  try {
    if (!gasPrice) {
      return res.status(400).json({
        success: false,
        error: "Gas price is required",
        type: "validation",
      });
    }

    const formatted = GasUtils.formatGasPrice(ethers.BigNumber.from(gasPrice));

    res.json({
      success: true,
      formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      type: "gas_formatting",
    });
  }
});

/**
 * Validate gas configuration
 */
exports.validateGasConfig = asyncHandler(async (req, res) => {
  const { config } = req.body;

  try {
    if (!config) {
      return res.status(400).json({
        success: false,
        error: "Gas configuration is required",
        type: "validation",
      });
    }

    const isValid = GasUtils.validateGasConfig(config);

    res.json({
      success: true,
      isValid,
      message: "Gas configuration is valid",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      type: "validation",
    });
  }
});
