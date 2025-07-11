const { BlockchainError, NetworkError } = require("../middleware/errorHandler");
const GasUtils = require("./gasUtils");

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    "nonce too low",
    "network error",
    "connection error",
    "timeout",
    "gas estimation failed",
    "insufficient funds",
    "gas limit exceeded",
    "out of gas",
  ],
};

// Exponential backoff delay
const calculateDelay = (attempt, config) => {
  const delay =
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// Check if error is retryable
const isRetryableError = (error, config) => {
  const errorMessage = error.message.toLowerCase();
  return config.retryableErrors.some((retryableError) =>
    errorMessage.includes(retryableError.toLowerCase())
  );
};

// Retry function with exponential backoff
const retry = async (operation, config = {}) => {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt or error is not retryable
      if (
        attempt === retryConfig.maxAttempts ||
        !isRetryableError(error, retryConfig)
      ) {
        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, retryConfig);

      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Retry with timeout
const retryWithTimeout = async (operation, timeoutMs = 30000, config = {}) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new NetworkError("Operation timeout")), timeoutMs);
  });

  const operationPromise = retry(operation, config);

  return Promise.race([operationPromise, timeoutPromise]);
};

// Specific retry functions for common blockchain operations
const retryTransaction = async (txFunction, config = {}) => {
  return retryWithTimeout(
    async () => {
      const tx = await txFunction();
      const receipt = await tx.wait();
      return { tx, receipt };
    },
    60000,
    config
  ); // 60 second timeout for transactions
};

// Enhanced retry transaction with gas optimization
const retryTransactionWithGasOptimization = async (
  contract,
  method,
  args = [],
  config = {}
) => {
  return retryWithTimeout(
    async () => {
      return await GasUtils.executeTransaction(contract, method, args, config);
    },
    60000,
    config
  ); // 60 second timeout for transactions
};

const retryCall = async (callFunction, config = {}) => {
  return retryWithTimeout(
    async () => {
      return await callFunction();
    },
    10000,
    config
  ); // 10 second timeout for calls
};

module.exports = {
  retry,
  retryWithTimeout,
  retryTransaction,
  retryTransactionWithGasOptimization,
  retryCall,
  isRetryableError,
  DEFAULT_RETRY_CONFIG,
};
