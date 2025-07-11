const PinataSDK = require("@pinata/sdk");
const fs = require("fs");
const config = require("../../config/config");
const { retry } = require("../utils/retry");
const {
  validateFile,
  validateJSON,
  validateString,
} = require("../utils/validation");
const { ValidationError, NetworkError } = require("../middleware/errorHandler");

const pinata = new PinataSDK({
  pinataApiKey: config.pinataApiKey,
  pinataSecretApiKey: config.pinataApiSecret,
});

class IpfsService {
  async uploadFile(buffer, filename) {
    try {
      // Validate inputs
      if (buffer) {
        // If buffer is provided, validate it
        if (!Buffer.isBuffer(buffer)) {
          throw new ValidationError("Buffer must be a valid Buffer");
        }
      } else if (filename) {
        // If filename is provided, validate file exists
        if (!fs.existsSync(filename)) {
          throw new ValidationError("File does not exist");
        }
        validateFile(
          { size: fs.statSync(filename).size },
          "file",
          50 * 1024 * 1024
        ); // 50MB max
      } else {
        throw new ValidationError("Either buffer or filename must be provided");
      }

      // Create readable stream
      const readableStream = buffer
        ? require("stream").Readable.from(buffer)
        : fs.createReadStream(filename);

      // Prepare metadata
      const metadata = {
        name: filename ? require("path").basename(filename) : "uploaded_file",
        keyvalues: {
          uploadedAt: new Date().toISOString()
        }
      };

      // Execute upload with retry
      const result = await retry(() => pinata.pinFileToIPFS(readableStream, {
        pinataMetadata: metadata
      }), {
        maxAttempts: 3,
        baseDelay: 2000,
      });

      return {
        success: true,
        hash: result.IpfsHash,
        size: result.PinSize,
        timestamp: result.Timestamp,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        return { success: false, error: "IPFS network error", type: "network" };
      }
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("api key")
      ) {
        return {
          success: false,
          error: "IPFS authentication failed",
          type: "auth",
        };
      }
      return { success: false, error: error.message, type: "ipfs" };
    }
  }

  async uploadJSON(json) {
    try {
      // Validate inputs
      const validatedJSON = validateJSON(json, "JSON data");

      // Execute upload with retry
      const result = await retry(() => pinata.pinJSONToIPFS(validatedJSON), {
        maxAttempts: 3,
        baseDelay: 2000,
      });

      return {
        success: true,
        hash: result.IpfsHash,
        size: result.PinSize,
        timestamp: result.Timestamp,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        return { success: false, error: "IPFS network error", type: "network" };
      }
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("api key")
      ) {
        return {
          success: false,
          error: "IPFS authentication failed",
          type: "auth",
        };
      }
      return { success: false, error: error.message, type: "ipfs" };
    }
  }

  async getFileByHash(hash) {
    try {
      // Validate inputs
      const validatedHash = validateString(hash, "IPFS hash", 1, 100);

      // Check if hash is valid IPFS hash format
      if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(validatedHash)) {
        throw new ValidationError("Invalid IPFS hash format");
      }

      // Trả về URL public gateway
      const url = `https://gateway.pinata.cloud/ipfs/${validatedHash}`;

      return {
        success: true,
        url,
        hash: validatedHash,
        gateway: "pinata",
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "ipfs" };
    }
  }

  async getFileMetadata(hash) {
    try {
      // Validate inputs
      const validatedHash = validateString(hash, "IPFS hash", 1, 100);

      // Check if hash is valid IPFS hash format
      if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(validatedHash)) {
        throw new ValidationError("Invalid IPFS hash format");
      }

      // Execute metadata retrieval with retry
      const result = await retry(() => pinata.getFileMetadata(validatedHash), {
        maxAttempts: 3,
        baseDelay: 2000,
      });

      return {
        success: true,
        metadata: result,
        hash: validatedHash,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("not found")) {
        return {
          success: false,
          error: "IPFS file not found",
          type: "not_found",
        };
      }
      if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        return { success: false, error: "IPFS network error", type: "network" };
      }
      return { success: false, error: error.message, type: "ipfs" };
    }
  }

  async unpinFile(hash) {
    try {
      // Validate inputs
      const validatedHash = validateString(hash, "IPFS hash", 1, 100);

      // Check if hash is valid IPFS hash format
      if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(validatedHash)) {
        throw new ValidationError("Invalid IPFS hash format");
      }

      // Execute unpin with retry
      const result = await retry(() => pinata.unpin(validatedHash), {
        maxAttempts: 3,
        baseDelay: 2000,
      });

      return {
        success: true,
        result,
        hash: validatedHash,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("not found")) {
        return {
          success: false,
          error: "IPFS file not found",
          type: "not_found",
        };
      }
      if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        return { success: false, error: "IPFS network error", type: "network" };
      }
      return { success: false, error: error.message, type: "ipfs" };
    }
  }

  async testConnection() {
    try {
      // Test IPFS connection
      const result = await retry(() => pinata.testAuthentication(), {
        maxAttempts: 2,
        baseDelay: 1000,
      });

      return {
        success: true,
        message: "IPFS connection successful",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error.message.includes("unauthorized") ||
        error.message.includes("api key")
      ) {
        return {
          success: false,
          error: "IPFS authentication failed",
          type: "auth",
        };
      }
      if (
        error.message.includes("network") ||
        error.message.includes("connection")
      ) {
        return { success: false, error: "IPFS network error", type: "network" };
      }
      return { success: false, error: error.message, type: "ipfs" };
    }
  }
}

module.exports = new IpfsService();
