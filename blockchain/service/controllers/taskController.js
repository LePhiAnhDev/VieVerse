const taskService = require("../services/taskService");
const { asyncHandler } = require("../middleware/errorHandler");
const {
    validateString,
    validateId,
    validateAmount,
    validateDeadline,
    validateScore,
} = require("../utils/validation");

exports.createTask = asyncHandler(async (req, res) => {
    const { title, description, reward, deadline } = req.body;

    const result = await taskService.createTask(
        title,
        description,
        reward,
        deadline
    );

    if (result.success) {
        res.json({
            success: true,
            txHash: result.txHash,
            receipt: result.receipt,
            taskData: result.taskData,
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

exports.acceptTask = asyncHandler(async (req, res) => {
    const { taskId } = req.body;

    const result = await taskService.acceptTask(taskId);

    if (result.success) {
        res.json({
            success: true,
            txHash: result.txHash,
            receipt: result.receipt,
            taskId: result.taskId,
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

exports.submitTask = asyncHandler(async (req, res) => {
    const { taskId, submissionHash } = req.body;

    const result = await taskService.submitTask(taskId, submissionHash);

    if (result.success) {
        res.json({
            success: true,
            txHash: result.txHash,
            receipt: result.receipt,
            taskId: result.taskId,
            submissionHash: result.submissionHash,
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

exports.verifyTask = asyncHandler(async (req, res) => {
    const { taskId, qualityScore, deadlineScore, attitudeScore, feedback } =
        req.body;

    const result = await taskService.verifyTask(
        taskId,
        qualityScore,
        deadlineScore,
        attitudeScore,
        feedback
    );

    if (result.success) {
        res.json({
            success: true,
            txHash: result.txHash,
            receipt: result.receipt,
            taskId: result.taskId,
            scores: result.scores,
            feedback: result.feedback,
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

exports.getTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const result = await taskService.getTask(taskId);

    if (result.success) {
        res.json({
            success: true,
            task: result.task,
            taskId: result.taskId,
        });
    } else {
        const statusCode =
            result.type === "not_found"
                ? 404
                : result.type === "validation"
                    ? 400
                    : 500;
        res.status(statusCode).json({
            success: false,
            error: result.error,
            type: result.type,
        });
    }
});

exports.getCompanyTasks = asyncHandler(async (req, res) => {
    const { address } = req.params;

    const result = await taskService.getCompanyTasks(address);

    if (result.success) {
        res.json({
            success: true,
            tasks: result.tasks,
            companyAddress: result.companyAddress,
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

exports.getStudentTasks = asyncHandler(async (req, res) => {
    const { address } = req.params;

    const result = await taskService.getStudentTasks(address);

    if (result.success) {
        res.json({
            success: true,
            tasks: result.tasks,
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
