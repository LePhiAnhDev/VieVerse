const chalk = require("chalk");

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class BlockchainError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "BlockchainError";
    this.statusCode = 500;
    this.originalError = originalError;
  }
}

class ContractError extends Error {
  constructor(message, contractAddress = null) {
    super(message);
    this.name = "ContractError";
    this.statusCode = 500;
    this.contractAddress = contractAddress;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = 503;
  }
}

// Error classification function
const classifyError = (error) => {
  if (error.message.includes("insufficient funds")) {
    return new BlockchainError("Insufficient funds for transaction", error);
  }
  if (error.message.includes("nonce")) {
    return new BlockchainError("Transaction nonce error", error);
  }
  if (error.message.includes("gas")) {
    return new BlockchainError("Gas estimation failed", error);
  }
  if (
    error.message.includes("network") ||
    error.message.includes("connection")
  ) {
    return new NetworkError("Network connection error");
  }
  if (error.message.includes("contract") || error.message.includes("revert")) {
    return new ContractError("Smart contract execution failed");
  }
  return error;
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Classify and enhance error
  const classifiedError = classifyError(err);

  // Log error with context
  console.error(chalk.red(`[ERROR] ${new Date().toISOString()}`));
  console.error(chalk.red(`Method: ${req.method}`));
  console.error(chalk.red(`URL: ${req.originalUrl}`));
  console.error(chalk.red(`Error: ${classifiedError.message}`));
  if (classifiedError.originalError) {
    console.error(
      chalk.red(`Original Error: ${classifiedError.originalError.message}`)
    );
  }
  console.error(chalk.red(`Stack: ${classifiedError.stack}`));

  // Determine status code
  const statusCode = classifiedError.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: classifiedError.message,
      type: classifiedError.name,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
    },
  };

  // Add additional context for specific error types
  if (
    classifiedError instanceof ContractError &&
    classifiedError.contractAddress
  ) {
    errorResponse.error.contractAddress = classifiedError.contractAddress;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    errorResponse.error.message = "Internal server error";
    delete errorResponse.error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
  ValidationError,
  BlockchainError,
  ContractError,
  NetworkError,
  classifyError,
};
