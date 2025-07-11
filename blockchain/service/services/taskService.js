const { verificationContract } = require("./contractService");
const {
  retryTransaction,
  retryCall,
  retryTransactionWithGasOptimization,
} = require("../utils/retry");
const {
  validateString,
  validateId,
  validateDeadline,
  validateScore,
  validateAmount,
  validateAddress,
} = require("../utils/validation");
const {
  ValidationError,
  BlockchainError,
  ContractError,
} = require("../middleware/errorHandler");
const GasUtils = require("../utils/gasUtils");

class TaskService {
  async createTask(title, description, reward, deadline) {
    try {
      // Validate inputs
      const validatedTitle = validateString(title, "title", 1, 200);
      const validatedDescription = validateString(
        description,
        "description",
        1,
        2000
      );
      const validatedReward = validateAmount(reward, "reward");
      const validatedDeadline = validateDeadline(deadline);

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        verificationContract,
        "createTask",
        [
          validatedTitle,
          validatedDescription,
          validatedReward,
          validatedDeadline,
        ]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        taskData: {
          title: validatedTitle,
          description: validatedDescription,
          reward: validatedReward,
          deadline: validatedDeadline,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Contract execution failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async acceptTask(taskId) {
    try {
      // Validate inputs
      const validatedTaskId = validateId(taskId, "taskId");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        verificationContract,
        "acceptTask",
        [validatedTaskId]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        taskId: validatedTaskId,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Contract execution failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async submitTask(taskId, submissionHash) {
    try {
      // Validate inputs
      const validatedTaskId = validateId(taskId, "taskId");
      const validatedHash = validateString(
        submissionHash,
        "submissionHash",
        1,
        100
      );

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        verificationContract,
        "submitTask",
        [validatedTaskId, validatedHash]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        taskId: validatedTaskId,
        submissionHash: validatedHash,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Contract execution failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async verifyTask(
    taskId,
    qualityScore,
    deadlineScore,
    attitudeScore,
    feedback
  ) {
    try {
      // Validate inputs
      const validatedTaskId = validateId(taskId, "taskId");
      const validatedQualityScore = validateScore(qualityScore, "qualityScore");
      const validatedDeadlineScore = validateScore(
        deadlineScore,
        "deadlineScore"
      );
      const validatedAttitudeScore = validateScore(
        attitudeScore,
        "attitudeScore"
      );
      const validatedFeedback = validateString(feedback, "feedback", 1, 1000);

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        verificationContract,
        "verifyTask",
        [
          validatedTaskId,
          validatedQualityScore,
          validatedDeadlineScore,
          validatedAttitudeScore,
          validatedFeedback,
        ]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        taskId: validatedTaskId,
        scores: {
          quality: validatedQualityScore,
          deadline: validatedDeadlineScore,
          attitude: validatedAttitudeScore,
        },
        feedback: validatedFeedback,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Contract execution failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getTask(taskId) {
    try {
      // Validate inputs
      const validatedTaskId = validateId(taskId, "taskId");

      // Execute call with retry
      const task = await retryCall(() =>
        verificationContract.getTask(validatedTaskId)
      );

      return { success: true, task, taskId: validatedTaskId };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Task does not exist")) {
        return { success: false, error: "Task not found", type: "not_found" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getCompanyTasks(companyAddress) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(
        companyAddress,
        "companyAddress"
      );

      // Execute call with retry
      const tasks = await retryCall(() =>
        verificationContract.getCompanyTasks(validatedAddress)
      );

      return { success: true, tasks, companyAddress: validatedAddress };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentTasks(studentAddress) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(
        studentAddress,
        "studentAddress"
      );

      // Execute call with retry
      const tasks = await retryCall(() =>
        verificationContract.getStudentTasks(validatedAddress)
      );

      return { success: true, tasks, studentAddress: validatedAddress };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }
}

module.exports = new TaskService();
