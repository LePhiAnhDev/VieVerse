const { ValidationError } = require("../middleware/errorHandler");

// Address validation
const validateAddress = (address, fieldName = "address") => {
  if (!address) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new ValidationError(`${fieldName} must be a valid Ethereum address`);
  }
  return address;
};

// Amount validation
const validateAmount = (amount, fieldName = "amount") => {
  if (!amount) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
  return amount;
};

// String validation
const validateString = (
  str,
  fieldName = "string",
  minLength = 1,
  maxLength = 1000
) => {
  if (!str) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (typeof str !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }
  if (str.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters`
    );
  }
  if (str.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters`
    );
  }
  return str;
};

// ID validation
const validateId = (id, fieldName = "id") => {
  if (typeof id === "undefined" || id === null) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (isNaN(id) || Number(id) < 0) {
    throw new ValidationError(`${fieldName} must be a positive number`);
  }
  return Number(id);
};

// Deadline validation
const validateDeadline = (deadline) => {
  if (!deadline) {
    throw new ValidationError("Deadline is required");
  }
  const deadlineTime = new Date(deadline).getTime();
  const now = Date.now();
  const minDeadline = now + 60 * 60 * 1000; // 1 hour from now
  const maxDeadline = now + 30 * 24 * 60 * 60 * 1000; // 30 days from now

  if (deadlineTime < minDeadline) {
    throw new ValidationError("Deadline must be at least 1 hour from now");
  }
  if (deadlineTime > maxDeadline) {
    throw new ValidationError("Deadline cannot be more than 30 days from now");
  }
  return deadlineTime;
};

// Score validation
const validateScore = (score, fieldName = "score") => {
  if (typeof score === "undefined" || score === null) {
    throw new ValidationError(`${fieldName} is required`);
  }
  const numScore = Number(score);
  if (isNaN(numScore) || numScore < 0 || numScore > 100) {
    throw new ValidationError(`${fieldName} must be between 0 and 100`);
  }
  return numScore;
};

// File validation
const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  // 10MB default
  if (!file) {
    throw new ValidationError("File is required");
  }
  if (file.size > maxSize) {
    throw new ValidationError(
      `File size must be less than ${maxSize / (1024 * 1024)}MB`
    );
  }
  return file;
};

// JSON validation
const validateJSON = (json, fieldName = "JSON") => {
  if (json === null || json === undefined) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (typeof json !== "object") {
    throw new ValidationError(`${fieldName} must be a valid object or array`);
  }

  // Check for circular references by trying to stringify
  try {
    JSON.stringify(json);
  } catch (error) {
    if (
      error.message.includes("circular") ||
      error.message.includes("call stack")
    ) {
      throw new ValidationError(`${fieldName} contains circular references`);
    }
    throw new ValidationError(
      `${fieldName} is not valid JSON: ${error.message}`
    );
  }

  return json;
};

// Pagination validation
const validatePagination = (page = 1, limit = 10) => {
  const pageNum = Number(page);
  const limitNum = Number(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError("Page must be a positive number");
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError("Limit must be between 1 and 100");
  }

  return { page: pageNum, limit: limitNum };
};

module.exports = {
  validateAddress,
  validateAmount,
  validateString,
  validateId,
  validateDeadline,
  validateScore,
  validateFile,
  validateJSON,
  validatePagination,
};
