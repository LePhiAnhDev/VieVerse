const studentService = require("../services/studentService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.getStudent = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await studentService.getStudent(address);

  if (result.success) {
    res.json({
      success: true,
      address: result.address,
      student: result.student,
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

exports.registerStudent = asyncHandler(async (req, res) => {
  const { name, skills, address } = req.body;

  const result = await studentService.registerStudent(name, skills, address);

  if (result.success) {
    if (result.alreadyRegistered) {
      res.json({
        success: true,
        alreadyRegistered: true,
        message: result.message,
        studentData: result.studentData,
      });
    } else {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
        studentData: result.studentData,
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

exports.getStudentStats = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await studentService.getStudentStats(address);

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

exports.getStudentActivity = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await studentService.getStudentActivity(address);

  if (result.success) {
    res.json({
      success: true,
      activity: result.activity,
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

exports.isStudentRegistered = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await studentService.isStudentRegistered(address);

  if (result.success) {
    res.json({
      success: true,
      isRegistered: result.isRegistered,
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
