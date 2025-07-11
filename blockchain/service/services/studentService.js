const { verificationContract } = require("./contractService");

// Validate contract is available
if (!verificationContract) {
  throw new Error("Verification contract not available");
}
const {
  retryCall,
  retryTransaction,
  retryTransactionWithGasOptimization,
} = require("../utils/retry");
const { validateAddress, validateString } = require("../utils/validation");
const {
  ValidationError,
  BlockchainError,
} = require("../middleware/errorHandler");
const GasUtils = require("../utils/gasUtils");

class StudentService {
  async getStudent(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "studentAddress");

      // Execute call with retry
      const student = await retryCall(() =>
        verificationContract.getStudent(validatedAddress)
      );

      return {
        success: true,
        student,
        address: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Student not registered")) {
        return {
          success: false,
          error: "Student not found",
          type: "not_found",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getReputation(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "studentAddress");

      // Execute call with retry
      const student = await retryCall(() =>
        verificationContract.getStudent(validatedAddress)
      );

      // student là một object/array tuple, lấy trường reputationScore
      // ethers v6 trả về object, v5 trả về array, nên kiểm tra cả hai
      let reputation;
      if (student.reputationScore !== undefined) {
        reputation = student.reputationScore;
      } else if (Array.isArray(student) && student.length >= 6) {
        reputation = student[5];
      } else {
        throw new Error("Invalid student data from contract");
      }

      return {
        success: true,
        reputation: reputation.toString(),
        address: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Student not registered")) {
        return {
          success: false,
          error: "Student not found",
          type: "not_found",
        };
      }
      if (error.message.includes("Invalid student data")) {
        return {
          success: false,
          error: "Invalid student data format",
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async registerStudent(name, skills, address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "studentAddress");
      const validatedName = validateString(name, "studentName", 1, 100);
      const validatedSkills = validateString(skills, "skills", 1, 1000);

      // Check if student is already registered
      try {
        const existingStudent = await retryCall(() =>
          verificationContract.getStudent(validatedAddress)
        );
        
        // If we get here without error, student exists
        if (existingStudent && existingStudent.name && existingStudent.name.length > 0) {
          console.log(`👤 Student already registered:`, {
            name: existingStudent.name,
            skills: existingStudent.skills,
            reputationScore: existingStudent.reputationScore.toString()
          });
          
          return {
            success: true,
            alreadyRegistered: true,
            studentData: {
              name: existingStudent.name,
              skills: existingStudent.skills,
              totalTasks: existingStudent.totalTasks.toString(),
              completedTasks: existingStudent.completedTasks.toString(),
              totalRewards: existingStudent.totalRewards.toString(),
              reputationScore: existingStudent.reputationScore.toString(),
              address: validatedAddress,
            },
            message: "Student already registered"
          };
        }
      } catch (error) {
        // Student not found, proceed with registration
        console.log(`👤 Student not registered yet, proceeding with registration...`);
      }

      // Execute transaction with gas optimization and retry
      const result = await retryTransactionWithGasOptimization(
        verificationContract,
        "registerStudent",
        [validatedName, validatedSkills]
      );

      return {
        success: true,
        txHash: result.tx.hash,
        receipt: result.receipt,
        gasUsed: result.gasUsed,
        totalCost: result.totalCost,
        studentData: {
          address: validatedAddress,
          name: validatedName,
          skills: validatedSkills,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Student already registered")) {
        return {
          success: false,
          error: "Student already registered",
          type: "already_exists",
        };
      }
      if (error.message.includes("revert")) {
        return {
          success: false,
          error: "Student registration failed: " + error.message,
          type: "contract",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentStats(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "studentAddress");

      // Get student data
      const student = await retryCall(() =>
        verificationContract.getStudent(validatedAddress)
      );

      // Get student tasks
      const tasks = await retryCall(() =>
        verificationContract.getStudentTasks(validatedAddress)
      );

      // Get reputation
      const reputation = await this.getReputation(validatedAddress);

      return {
        success: true,
        stats: {
          address: validatedAddress,
          name: student.name,
          skills: student.skills,
          totalTasks: student.totalTasks.toString(),
          completedTasks: student.completedTasks.toString(),
          totalRewards: student.totalRewards.toString(),
          reputationScore: student.reputationScore.toString(),
          lastActivityAt: student.lastActivityAt.toString(),
          taskCount: tasks.length,
          reputation: reputation.success ? reputation.reputation : "0",
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Student not registered")) {
        return {
          success: false,
          error: "Student not found",
          type: "not_found",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async getStudentActivity(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "studentAddress");

      // Get student data
      const student = await retryCall(() =>
        verificationContract.getStudent(validatedAddress)
      );

      // Get student tasks
      const tasks = await retryCall(() =>
        verificationContract.getStudentTasks(validatedAddress)
      );

      return {
        success: true,
        activity: {
          address: validatedAddress,
          lastActivityAt: student.lastActivityAt.toString(),
          totalTasks: student.totalTasks.toString(),
          completedTasks: student.completedTasks.toString(),
          activeTasks: (student.totalTasks - student.completedTasks).toString(),
          taskCount: tasks.length,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Student not registered")) {
        return {
          success: false,
          error: "Student not found",
          type: "not_found",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }

  async isStudentRegistered(address) {
    try {
      // Validate inputs
      const validatedAddress = validateAddress(address, "studentAddress");

      // Execute call with retry
      const student = await retryCall(() =>
        verificationContract.getStudent(validatedAddress)
      );

      const isRegistered = student.name && student.name.length > 0;

      return {
        success: true,
        isRegistered,
        address: validatedAddress,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return { success: false, error: error.message, type: "validation" };
      }
      if (error.message.includes("Student not registered")) {
        return {
          success: false,
          error: "Student not found",
          type: "not_found",
        };
      }
      return { success: false, error: error.message, type: "blockchain" };
    }
  }
}

module.exports = new StudentService();
