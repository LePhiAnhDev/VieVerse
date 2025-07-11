const companyService = require("../services/companyService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.getCompany = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await companyService.getCompany(address);

  if (result.success) {
    res.json({
      success: true,
      address: result.address,
      company: result.company,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "not_found"
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.registerCompany = asyncHandler(async (req, res) => {
  const { name, description, address } = req.body;

  const result = await companyService.registerCompany(
    name,
    description,
    address
  );

  if (result.success) {
    if (result.alreadyRegistered) {
      res.json({
        success: true,
        alreadyRegistered: true,
        message: result.message,
        companyData: result.companyData,
      });
    } else {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
        companyData: result.companyData,
      });
    }
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "already_exists"
        ? 409
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.verifyCompany = asyncHandler(async (req, res) => {
  const { companyAddress } = req.body;

  const result = await companyService.verifyCompany(companyAddress);

  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      companyAddress: result.companyAddress,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "not_found"
        ? 404
        : result.type === "auth"
        ? 401
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.getCompanyStats = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await companyService.getCompanyStats(address);

  if (result.success) {
    res.json({
      success: true,
      stats: result.stats,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "not_found"
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});

exports.isCompanyVerified = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await companyService.isCompanyVerified(address);

  if (result.success) {
    res.json({
      success: true,
      isVerified: result.isVerified,
      address: result.address,
    });
  } else {
    const statusCode =
      result.type === "validation"
        ? 400
        : result.type === "not_found"
        ? 404
        : 500;
    res.status(statusCode).json({
      success: false,
      error: result.error,
      type: result.type,
    });
  }
});
