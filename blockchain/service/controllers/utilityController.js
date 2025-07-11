const utilityService = require("../services/utilityService");
const { asyncHandler } = require("../middleware/errorHandler");

exports.enrollCourse = asyncHandler(async (req, res) => {
  const { courseId, student } = req.body;

  const result = await utilityService.enrollCourse(courseId, student);

  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      enrollmentData: result.enrollmentData,
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

exports.redeemReward = asyncHandler(async (req, res) => {
  const { rewardId, student } = req.body;

  const result = await utilityService.redeemReward(rewardId, student);

  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      rewardData: result.rewardData,
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

exports.joinEvent = asyncHandler(async (req, res) => {
  const { eventId, student } = req.body;

  const result = await utilityService.joinEvent(eventId, student);

  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      eventData: result.eventData,
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

exports.purchaseCertification = asyncHandler(async (req, res) => {
  const { certId, student } = req.body;

  const result = await utilityService.purchaseCertification(certId, student);

  if (result.success) {
    res.json({
      success: true,
      txHash: result.txHash,
      receipt: result.receipt,
      certificationData: result.certificationData,
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

exports.getStudentEnrollments = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await utilityService.getStudentEnrollments(address);

  if (result.success) {
    res.json({
      success: true,
      enrollments: result.enrollments,
      studentAddress: result.studentAddress,
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

exports.getStudentRewards = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await utilityService.getStudentRewards(address);

  if (result.success) {
    res.json({
      success: true,
      rewards: result.rewards,
      studentAddress: result.studentAddress,
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

exports.getStudentEvents = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await utilityService.getStudentEvents(address);

  if (result.success) {
    res.json({
      success: true,
      events: result.events,
      studentAddress: result.studentAddress,
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

exports.getStudentCertifications = asyncHandler(async (req, res) => {
  const { address } = req.params;

  const result = await utilityService.getStudentCertifications(address);

  if (result.success) {
    res.json({
      success: true,
      certifications: result.certifications,
      studentAddress: result.studentAddress,
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

exports.getCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const result = await utilityService.getCourse(courseId);

  if (result.success) {
    res.json({
      success: true,
      course: result.course,
      courseId: result.courseId,
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

exports.getReward = asyncHandler(async (req, res) => {
  const { rewardId } = req.params;

  const result = await utilityService.getReward(rewardId);

  if (result.success) {
    res.json({
      success: true,
      reward: result.reward,
      rewardId: result.rewardId,
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

exports.getEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const result = await utilityService.getEvent(eventId);

  if (result.success) {
    res.json({
      success: true,
      event: result.event,
      eventId: result.eventId,
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

exports.getCertification = asyncHandler(async (req, res) => {
  const { certId } = req.params;

  const result = await utilityService.getCertification(certId);

  if (result.success) {
    res.json({
      success: true,
      certification: result.certification,
      certId: result.certId,
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
