const ipfsService = require("../services/ipfsService");
const { asyncHandler } = require("../middleware/errorHandler");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

exports.uploadFile = [
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
        type: "validation",
      });
    }

    const result = await ipfsService.uploadFile(null, req.file.path);

    // Xóa file tạm sau khi upload
    try {
      fs.unlinkSync(req.file.path);
    } catch (error) {
      console.warn("Failed to delete temporary file:", error.message);
    }

    if (result.success) {
      res.json({
        success: true,
        hash: result.hash,
        size: result.size,
        timestamp: result.timestamp,
      });
    } else {
      const statusCode =
        result.type === "validation"
          ? 400
          : result.type === "auth"
          ? 401
          : result.type === "network"
          ? 503
          : 500;
      res.status(statusCode).json({
        success: false,
        error: result.error,
        type: result.type,
      });
    }
  }),
];

exports.uploadJSON = asyncHandler(async (req, res) => {
  const json = req.body;

  const result = await ipfsService.uploadJSON(json);

  if (result.success) {
    res.json({
      success: true,
      hash: result.hash,
      size: result.size,
      timestamp: result.timestamp,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "auth"
        ? 401
        : result.type === "network"
        ? 503
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.getFileByHash = asyncHandler(async (req, res) => {
  const { hash } = req.params;

  const result = await ipfsService.getFileByHash(hash);

  if (result.success) {
    res.json({
      success: true,
      url: result.url,
      hash: result.hash,
      gateway: result.gateway,
    });
  } else {
    const statusCode = result.type === "validation" ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.getFileMetadata = asyncHandler(async (req, res) => {
  const { hash } = req.params;

  const result = await ipfsService.getFileMetadata(hash);

  if (result.success) {
    res.json({
      success: true,
      metadata: result.metadata,
      hash: result.hash,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "not_found"
        ? 404
        : result.type === "network"
        ? 503
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.unpinFile = asyncHandler(async (req, res) => {
  const { hash } = req.params;

  const result = await ipfsService.unpinFile(hash);

  if (result.success) {
    res.json({
      success: true,
      result: result.result,
      hash: result.hash,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "not_found"
        ? 404
        : result.type === "network"
        ? 503
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.testConnection = asyncHandler(async (req, res) => {
  const result = await ipfsService.testConnection();

  if (result.success) {
    res.json({
      success: true,
      message: result.message,
      timestamp: result.timestamp,
    });
  } else {
    const statusCode =
      result.type === "auth" ? 401 : result.type === "network" ? 503 : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});
