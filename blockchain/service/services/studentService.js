const { verificationContract } = require("./contractService");

class StudentService {
  async getStudent(address) {
    try {
      const student = await verificationContract.getStudent(address);
      return { success: true, student };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getReputation(address) {
    try {
      const student = await verificationContract.getStudent(address);
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
      return { success: true, reputation: reputation.toString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StudentService();
