/**
 * Utility functions for handling BigInt and BigNumber serialization
 */

/**
 * Convert BigInt/BigNumber values to strings for JSON serialization
 * @param {any} obj - Object to process
 * @returns {any} Object with BigInt/BigNumber converted to strings
 */
function bigIntToString(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (typeof obj === "object" && obj._isBigNumber) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(bigIntToString);
  }

  if (typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = bigIntToString(value);
    }
    return result;
  }

  return obj;
}

/**
 * Middleware to automatically convert BigInt/BigNumber in response
 * @param {Object} data - Response data
 * @returns {Object} Processed data
 */
function processResponseData(data) {
  return bigIntToString(data);
}

module.exports = {
  bigIntToString,
  processResponseData,
};
