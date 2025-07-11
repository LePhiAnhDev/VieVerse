const { ethers } = require("ethers");
const { utilityContract } = require("./contractService");

// Validate contract is available
if (!utilityContract) {
  throw new Error("Utility contract not available");
}

const {
  retryTransaction,
  retryCall,
  retryTransactionWithGasOptimization,
} = require("../utils/retry");
const { validateId, validateAddress } = require("../utils/validation");
const {
  ValidationError,
  BlockchainError,
} = require("../middleware/errorHandler");
const GasUtils = require("../utils/gasUtils");

class UtilityService {
  async enrollCourse(courseId, student) {
    try {
      // Validate inputs
      const validatedCourseId = validateId(courseId, "courseId");
      const validatedStudent = validateAddress(student, "student");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        utilityContract,
        "enrollCourse",
        [validatedCourseId]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        enrollmentData: {
          courseId: validatedCourseId,
          student: validatedStudent,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Course does not exist")) {
        return { success: false, error: "Course not found", type: "not_found" };
      }
      if (error.message.includes("Already enrolled")) {
        return {
          success: false,
          error: "Already enrolled in this course",
          type: "contract",
        };
      }
      if (error.message.includes("Course is full")) {
        return { success: false, error: "Course is full", type: "contract" };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Enrollment failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async redeemReward(rewardId, student) {
    try {
      // Validate inputs
      const validatedRewardId = validateId(rewardId, "rewardId");
      const validatedStudent = validateAddress(student, "student");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        utilityContract,
        "redeemReward",
        [validatedRewardId]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        rewardData: {
          rewardId: validatedRewardId,
          student: validatedStudent,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Reward does not exist")) {
        return { success: false, error: "Reward not found", type: "not_found" };
      }
      if (error.message.includes("Reward out of stock")) {
        return {
          success: false,
          error: "Reward out of stock",
          type: "contract",
        };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Reward redemption failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async joinEvent(eventId, student) {
    try {
      // Validate inputs
      const validatedEventId = validateId(eventId, "eventId");
      const validatedStudent = validateAddress(student, "student");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        utilityContract,
        "joinEvent",
        [validatedEventId]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        eventData: {
          eventId: validatedEventId,
          student: validatedStudent,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Event does not exist")) {
        return { success: false, error: "Event not found", type: "not_found" };
      }
      if (error.message.includes("Already joined event")) {
        return {
          success: false,
          error: "Already joined this event",
          type: "contract",
        };
      }
      if (error.message.includes("Event is full")) {
        return { success: false, error: "Event is full", type: "contract" };
      }
      if (error.message.includes("Event has passed")) {
        return {
          success: false,
          error: "Event has already passed",
          type: "contract",
        };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Event join failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async purchaseCertification(certId, student) {
    try {
      // Validate inputs
      const validatedCertId = validateId(certId, "certId");
      const validatedStudent = validateAddress(student, "student");

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        utilityContract,
        "purchaseCertification",
        [validatedCertId]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        certificationData: {
          certId: validatedCertId,
          student: validatedStudent,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Certification does not exist")) {
        return {
          success: false,
          error: "Certification not found",
          type: "not_found",
        };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Certification purchase failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentEnrollments(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "address");

      // Execute call with retry
      const enrollments = await retryCall(() =>
        utilityContract.getStudentEnrollments(validatedAddress)
      );

      return {
        success: true,
        enrollments,
        studentAddress: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentRewards(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "address");

      // Execute call with retry
      const rewards = await retryCall(() =>
        utilityContract.getStudentRewards(validatedAddress)
      );

      return {
        success: true,
        rewards,
        studentAddress: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentEvents(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "address");

      // Execute call with retry
      const events = await retryCall(() =>
        utilityContract.getStudentEvents(validatedAddress)
      );

      return {
        success: true,
        events,
        studentAddress: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentCertifications(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "address");

      // Execute call with retry
      const certifications = await retryCall(() =>
        utilityContract.getStudentCertifications(validatedAddress)
      );

      return {
        success: true,
        certifications,
        studentAddress: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getCourse(courseId) {
    try {
      // Validate inputs
      const validatedCourseId = validateId(courseId, "courseId");

      // Execute call with retry
      const course = await retryCall(() =>
        utilityContract.courses(validatedCourseId)
      );

      return {
        success: true,
        course,
        courseId: validatedCourseId,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getReward(rewardId) {
    try {
      // Validate inputs
      const validatedRewardId = validateId(rewardId, "rewardId");

      // Execute call with retry
      const reward = await retryCall(() =>
        utilityContract.rewards(validatedRewardId)
      );

      return {
        success: true,
        reward,
        rewardId: validatedRewardId,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getEvent(eventId) {
    try {
      // Validate inputs
      const validatedEventId = validateId(eventId, "eventId");

      // Execute call with retry
      const event = await retryCall(() =>
        utilityContract.events(validatedEventId)
      );

      return {
        success: true,
        event,
        eventId: validatedEventId,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getCertification(certId) {
    try {
      // Validate inputs
      const validatedCertId = validateId(certId, "certId");

      // Execute call with retry
      const certification = await retryCall(() =>
        utilityContract.certifications(validatedCertId)
      );

      return {
        success: true,
        certification,
        certId: validatedCertId,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }
}

module.exports = new UtilityService();
