const { verificationContract } = require("./contractService");

class TaskService {
  async createTask(title, description, reward, deadline) {
    try {
      const tx = await verificationContract.createTask(
        title,
        description,
        reward,
        deadline
      );
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async acceptTask(taskId) {
    try {
      const tx = await verificationContract.acceptTask(taskId);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async submitTask(taskId, submissionHash) {
    try {
      const tx = await verificationContract.submitTask(taskId, submissionHash);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTask(taskId) {
    try {
      const task = await verificationContract.getTask(taskId);
      return { success: true, task };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCompanyTasks(address) {
    try {
      const tasks = await verificationContract.getCompanyTasks(address);
      return { success: true, tasks };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStudentTasks(address) {
    try {
      const tasks = await verificationContract.getStudentTasks(address);
      return { success: true, tasks };
    } catch (error) {
      return { success: false, error: error.message };
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
      const tx = await verificationContract.verifyTask(
        taskId,
        qualityScore,
        deadlineScore,
        attitudeScore,
        feedback
      );
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new TaskService();
