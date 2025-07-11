const studentService = require("../services/studentService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.getReputation = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await studentService.getReputation(address);

  if (result.success) {
    res.json({
      success: true,
      address: result.address,
      reputation: result.reputation,
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
