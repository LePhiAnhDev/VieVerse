const { ethers } = require("ethers");
const { tokenContract } = require("./contractService");

// Validate contract is available
if (!tokenContract) {
  throw new Error("Token contract not available");
}

const {
  retryTransaction,
  retryCall,
  retryTransactionWithGasOptimization,
} = require("../utils/retry");
const { validateAddress, validateAmount } = require("../utils/validation");
const {
  ValidationError,
  BlockchainError,
} = require("../middleware/errorHandler");
const GasUtils = require("../utils/gasUtils");

class TokenService {
  async getBalance(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "address");

      // Execute call with retry
      const balance = await retryCall(() =>
        tokenContract.balanceOf(validatedAddress)
      );

      return {
        success: true,
        balance: balance.toString(),
        address: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("invalid address")) {
        return {
          success: false,
          error: "Invalid address format",
          type: "validation",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async mint(to, amount) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(to, "recipient");
      const validatedAmount = validateAmount(amount, "amount");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        tokenContract,
        "mint",
        [validatedAddress, validatedAmount]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        mintData: {
          to: validatedAddress,
          amount: validatedAmount,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Mint operation failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async burn(from, amount) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(from, "from");
      const validatedAmount = validateAmount(amount, "amount");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        tokenContract,
        "burn",
        [validatedAmount]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        burnData: {
          from: validatedAddress,
          amount: validatedAmount,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("insufficient balance")) {
        return {
          success: false,
          error: "Insufficient balance to burn",
          type: "contract",
        };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Burn operation failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getTotalSupply() {
    try {
      // Execute call with retry
      const totalSupply = await retryCall(() => tokenContract.totalSupply());

      return {
        success: true,
        totalSupply: totalSupply.toString(),
      };
    } catch (error) {
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getTokenInfo() {
    try {
      // Execute calls with retry
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        retryCall(() => tokenContract.name()),
        retryCall(() => tokenContract.symbol()),
        retryCall(() => tokenContract.decimals()),
        retryCall(() => tokenContract.totalSupply()),
      ]);

      return {
        success: true,
        tokenInfo: {
          name,
          symbol,
          decimals: decimals.toString(),
          totalSupply: totalSupply.toString(),
          address: tokenContract.target || tokenContract.address,
        },
      };
    } catch (error) {
      return { success: false, error: error.message, type: "blockchain" };
    }
  }
}

module.exports = new TokenService();
