const { ethers } = require("ethers");
const { BlockchainError, NetworkError } = require("../middleware/errorHandler");

/**
 * Gas Utilities for blockchain transactions
 * Provides gas estimation, gas price optimization, and gas limit management
 */
class GasUtils {
  /**
   * Default gas configurations
   */
  static DEFAULT_GAS_CONFIG = {
    bufferPercentage: 20, // 20% buffer for gas estimation
    maxGasLimit: BigInt(5000000), // 5M gas limit
    minGasLimit: BigInt(21000), // Minimum gas limit
    maxPriorityFee: BigInt("2000000000"), // 2 gwei max priority fee
    maxFeePerGas: BigInt("50000000000"), // 50 gwei max fee per gas
  };

  /**
   * Ensure value is BigInt (Ethers v6)
   * @param {any} value - Value to convert
   * @returns {bigint} BigInt instance
   */
  static toBigNumber(value) {
    if (typeof value === "bigint") {
      return value;
    }
    if (typeof value === "string" || typeof value === "number") {
      return BigInt(value);
    }
    if (value && typeof value === "object" && value.toString) {
      return BigInt(value.toString());
    }
    return BigInt(0);
  }

  /**
   * Estimate gas for a contract method
   * @param {ethers.Contract} contract - Contract instance
   * @param {string} method - Method name
   * @param {Array} args - Method arguments
   * @param {Object} options - Additional options
   * @returns {Promise<ethers.BigNumber>} Estimated gas with buffer
   */
  static async estimateGas(contract, method, args = [], options = {}) {
    try {
      const config = { ...this.DEFAULT_GAS_CONFIG, ...options };

      console.log(`🔧 Estimating gas for ${method}`);

      // Estimate gas for the method (Ethers v6 approach)
      let gasEstimate;
      try {
        // Check if method exists and has estimateGas
        if (!contract[method]) {
          throw new Error(`Method ${method} not found on contract`);
        }

        // Try different approaches for gas estimation
        if (contract[method].estimateGas) {
          // Ethers v6: contract[method].estimateGas(...args)
          gasEstimate = await contract[method].estimateGas(...args);
        } else if (contract.estimateGas && contract.estimateGas[method]) {
          // Alternative approach: contract.estimateGas[method](...args)
          gasEstimate = await contract.estimateGas[method](...args);
        } else {
          // Fallback: use provider estimateGas with encoded data
          const data = contract.interface.encodeFunctionData(method, args);
          gasEstimate = await contract.provider.estimateGas({
            to: contract.target || contract.address,
            data: data,
          });
        }

        console.log(`✅ Gas estimation successful: ${gasEstimate.toString()}`);
      } catch (error) {
        console.log(`Gas estimation failed: ${error.message}`);

        // In strict mode, throw the error instead of using default
        if (config.strict) {
          throw error;
        }

        console.log(`Using default gas for ${method}...`);
        // Use default gas if estimation fails
        const defaultGas = this.getDefaultGasForMethod(method);
        console.log(`Default gas for ${method}: ${defaultGas.toString()}`);
        return defaultGas;
      }

      const gasEstimateBN = this.toBigNumber(gasEstimate);

      // Add buffer to the estimate (using BigInt operations)
      const bufferMultiplier = BigInt(100 + config.bufferPercentage);
      const gasWithBuffer = (gasEstimateBN * bufferMultiplier) / BigInt(100);

      // Ensure gas limit is within bounds
      const finalGasLimit = this.clampGasLimit(gasWithBuffer, config);

      console.log(
        `Gas estimation for ${method}: ${gasEstimateBN.toString()} + ${
          config.bufferPercentage
        }% buffer = ${finalGasLimit.toString()}`
      );

      return finalGasLimit;
    } catch (error) {
      console.warn(`Gas estimation failed for ${method}:`, error.message);

      // In strict mode, throw the error instead of using default
      if (options.strict) {
        throw error;
      }

      // Return default gas limit based on method type
      const defaultGas = this.getDefaultGasForMethod(method);
      console.log(
        `Using default gas limit for ${method}: ${defaultGas.toString()}`
      );

      return defaultGas;
    }
  }

  /**
   * Get optimized gas price for current network conditions
   * @param {ethers.Provider} provider - Ethers provider
   * @param {Object} options - Gas price options
   * @returns {Promise<Object>} Gas price configuration
   */
  static async getOptimizedGasPrice(provider, options = {}) {
    try {
      const config = { ...this.DEFAULT_GAS_CONFIG, ...options };

      // Check if provider exists and has getFeeData
      if (!provider || typeof provider.getFeeData !== "function") {
        console.warn(
          "Provider not available or getFeeData not supported, using default gas price"
        );
        return {
          gasPrice: ethers.parseUnits("20", "gwei"),
          type: 0,
        };
      }

      // Get current network fee data
      const feeData = await provider.getFeeData();

      // Use EIP-1559 gas pricing if available
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        const maxFeePerGas =
          (this.toBigNumber(feeData.maxFeePerGas) * BigInt(120)) / BigInt(100); // 20% buffer
        const maxPriorityFeePerGas =
          (this.toBigNumber(feeData.maxPriorityFeePerGas) * BigInt(120)) /
          BigInt(100);

        return {
          maxFeePerGas:
            maxFeePerGas > config.maxFeePerGas
              ? config.maxFeePerGas
              : maxFeePerGas,
          maxPriorityFeePerGas:
            maxPriorityFeePerGas > config.maxPriorityFeePerGas
              ? config.maxPriorityFeePerGas
              : maxPriorityFeePerGas,
          type: 2, // EIP-1559 transaction
        };
      }

      // Fallback to legacy gas price
      if (feeData.gasPrice) {
        const gasPrice =
          (this.toBigNumber(feeData.gasPrice) * BigInt(120)) / BigInt(100); // 20% buffer

        return {
          gasPrice:
            gasPrice > config.maxFeePerGas ? config.maxFeePerGas : gasPrice,
          type: 0, // Legacy transaction
        };
      }

      // Final fallback
      return {
        gasPrice: ethers.parseUnits("20", "gwei"),
        type: 0,
      };
    } catch (error) {
      console.warn("Failed to get optimized gas price:", error.message);

      // Return conservative default values
      return {
        gasPrice: ethers.parseUnits("20", "gwei"),
        type: 0,
      };
    }
  }

  /**
   * Prepare transaction with gas estimation and optimization
   * @param {ethers.Contract} contract - Contract instance
   * @param {string} method - Method name
   * @param {Array} args - Method arguments
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction configuration
   */
  static async prepareTransaction(contract, method, args = [], options = {}) {
    try {
      // Estimate gas
      const gasLimit = await this.estimateGas(contract, method, args, options);

      // Get optimized gas price
      const gasPriceConfig = await this.getOptimizedGasPrice(
        contract.provider || contract.runner?.provider,
        options
      );

      // Combine with user options
      const txConfig = {
        gasLimit,
        ...gasPriceConfig,
        ...options,
      };

      console.log(`Transaction prepared for ${method}:`, {
        gasLimit: gasLimit.toString(),
        ...gasPriceConfig,
      });

      return txConfig;
    } catch (error) {
      throw new BlockchainError(
        `Failed to prepare transaction for ${method}: ${error.message}`
      );
    }
  }

  /**
   * Execute transaction with gas optimization
   * @param {ethers.Contract} contract - Contract instance
   * @param {string} method - Method name
   * @param {Array} args - Method arguments
   * @param {Object} options - Transaction options
   * @returns {Promise<Object>} Transaction result
   */
  static async executeTransaction(contract, method, args = [], options = {}) {
    try {
      console.log(`🔧 Executing transaction: ${method}`);
      console.log(`Contract type:`, typeof contract);
      console.log(`Method exists:`, typeof contract[method]);
      console.log(`Method:`, method);
      console.log(`Args:`, args);

      // Prepare transaction with gas estimation
      const txConfig = await this.prepareTransaction(
        contract,
        method,
        args,
        options
      );

      console.log(`Transaction config:`, {
        gasLimit: txConfig.gasLimit.toString(),
        gasPrice: txConfig.gasPrice ? txConfig.gasPrice.toString() : "N/A",
        maxFeePerGas: txConfig.maxFeePerGas
          ? txConfig.maxFeePerGas.toString()
          : "N/A",
        type: txConfig.type,
      });

      // Execute transaction
      const tx = await contract[method](...args, txConfig);
      console.log(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Transaction confirmed: ${receipt.hash}`);

      const gasUsed = receipt.gasUsed ? receipt.gasUsed.toString() : "0";
      const effectiveGasPrice = receipt.effectiveGasPrice
        ? receipt.effectiveGasPrice.toString()
        : receipt.gasPrice
        ? receipt.gasPrice.toString()
        : "0";

      return {
        tx,
        receipt,
        gasUsed,
        effectiveGasPrice,
        totalCost: this.calculateTransactionCost(gasUsed, effectiveGasPrice),
      };
    } catch (error) {
      console.error(`Transaction execution failed for ${method}:`, error);
      throw new BlockchainError(
        `Transaction execution failed for ${method}: ${error.message}`
      );
    }
  }

  /**
   * Get default gas limit for specific method types
   * @param {string} method - Method name
   * @returns {ethers.BigNumber} Default gas limit
   */
  static getDefaultGasForMethod(method) {
    const methodGasDefaults = {
      // Token operations
      mint: BigInt(100000),
      burn: BigInt(80000),
      transfer: BigInt(65000),
      approve: BigInt(46000),

      // Task operations
      createTask: BigInt(200000),
      acceptTask: BigInt(120000),
      submitTask: BigInt(100000),
      verifyTask: BigInt(150000),

      // Registration operations
      registerCompany: BigInt(150000),
      registerStudent: BigInt(150000),
      verifyCompany: BigInt(80000),

      // Utility operations
      enrollCourse: BigInt(120000),
      redeemReward: BigInt(100000),
      joinEvent: BigInt(100000),
      purchaseCertification: BigInt(100000),

      // Admin operations
      addModerator: BigInt(80000),
      removeModerator: BigInt(80000),
      updateSecuritySettings: BigInt(120000),
      activateEmergencyStop: BigInt(60000),
      deactivateEmergencyStop: BigInt(60000),
    };

    return methodGasDefaults[method] || BigInt(200000);
  }

  /**
   * Clamp gas limit to valid range
   * @param {ethers.BigNumber} gasLimit - Gas limit to clamp
   * @param {Object} config - Gas configuration
   * @returns {ethers.BigNumber} Clamped gas limit
   */
  static clampGasLimit(gasLimit, config = {}) {
    const { minGasLimit, maxGasLimit } = {
      ...this.DEFAULT_GAS_CONFIG,
      ...config,
    };

    const gasLimitBN = this.toBigNumber(gasLimit);
    const minGasLimitBN = this.toBigNumber(minGasLimit);
    const maxGasLimitBN = this.toBigNumber(maxGasLimit);

    if (gasLimitBN < minGasLimitBN) {
      return minGasLimitBN;
    }

    if (gasLimitBN > maxGasLimitBN) {
      return maxGasLimitBN;
    }

    return gasLimitBN;
  }

  /**
   * Calculate transaction cost in ETH
   * @param {ethers.BigNumber} gasUsed - Gas used
   * @param {ethers.BigNumber} gasPrice - Gas price
   * @returns {string} Cost in ETH
   */
  static calculateTransactionCost(gasUsed, gasPrice) {
    const cost = this.toBigNumber(gasUsed) * this.toBigNumber(gasPrice);
    return ethers.formatEther(cost);
  }

  /**
   * Get gas price in human readable format
   * @param {ethers.BigNumber} gasPrice - Gas price in wei
   * @returns {Object} Gas price in different units
   */
  static formatGasPrice(gasPrice) {
    const gasPriceBN = this.toBigNumber(gasPrice);
    return {
      wei: gasPriceBN.toString(),
      gwei: ethers.formatUnits(gasPriceBN, "gwei"),
      eth: ethers.formatEther(gasPriceBN),
    };
  }

  /**
   * Monitor gas prices and suggest optimal timing
   * @param {ethers.Provider} provider - Ethers provider
   * @returns {Promise<Object>} Gas price analysis
   */
  static async analyzeGasPrices(provider) {
    try {
      const feeData = await provider.getFeeData();

      const analysis = {
        current: {
          gasPrice: feeData.gasPrice
            ? this.formatGasPrice(feeData.gasPrice)
            : null,
          maxFeePerGas: feeData.maxFeePerGas
            ? this.formatGasPrice(feeData.maxFeePerGas)
            : null,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
            ? this.formatGasPrice(feeData.maxPriorityFeePerGas)
            : null,
        },
        recommendation: this.getGasPriceRecommendation(feeData),
        timestamp: Date.now(),
      };

      return analysis;
    } catch (error) {
      throw new NetworkError(`Failed to analyze gas prices: ${error.message}`);
    }
  }

  /**
   * Get gas price recommendation based on current network conditions
   * @param {Object} feeData - Fee data from provider
   * @returns {string} Recommendation
   */
  static getGasPriceRecommendation(feeData) {
    if (!feeData.gasPrice) {
      return "Unable to determine current gas price";
    }

    const gasPriceGwei = parseFloat(
      ethers.formatUnits(feeData.gasPrice, "gwei")
    );

    if (gasPriceGwei < 10) {
      return "Low gas prices - Good time for transactions";
    } else if (gasPriceGwei < 30) {
      return "Moderate gas prices - Normal transaction conditions";
    } else if (gasPriceGwei < 50) {
      return "High gas prices - Consider waiting or using higher priority";
    } else {
      return "Very high gas prices - Consider waiting for better conditions";
    }
  }

  /**
   * Validate gas configuration
   * @param {Object} config - Gas configuration to validate
   * @returns {boolean} True if valid
   */
  static validateGasConfig(config) {
    const requiredFields = ["bufferPercentage", "maxGasLimit", "minGasLimit"];

    for (const field of requiredFields) {
      if (config[field] === undefined || config[field] === null) {
        throw new Error(`Missing required gas config field: ${field}`);
      }
    }

    if (config.bufferPercentage < 0 || config.bufferPercentage > 100) {
      throw new Error("Buffer percentage must be between 0 and 100");
    }

    if (config.minGasLimit >= config.maxGasLimit) {
      throw new Error("Min gas limit must be less than max gas limit");
    }

    return true;
  }
}

module.exports = GasUtils;
