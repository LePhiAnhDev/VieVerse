const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class UtilityService {
  constructor() {
    const contracts = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../deployed-contracts.json"))
    );
    this.utilityAbi = contracts.VieVerseTokenUtility.abi;
    this.utilityAddress = contracts.VieVerseTokenUtility.address;
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.utility = new ethers.Contract(
      this.utilityAddress,
      this.utilityAbi,
      this.signer
    );
  }

  async enrollCourse(courseId, student) {
    try {
      // Cần connect contract với signer của student nếu muốn thực hiện đúng quyền
      const tx = await this.utility.enrollCourse(courseId);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async redeemReward(rewardId, student) {
    try {
      const tx = await this.utility.redeemReward(rewardId);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async joinEvent(eventId, student) {
    try {
      const tx = await this.utility.joinEvent(eventId);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async purchaseCertification(certId, student) {
    try {
      const tx = await this.utility.purchaseCertification(certId);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStudentEnrollments(address) {
    try {
      const enrollments = await this.utility.getStudentEnrollments(address);
      return { success: true, enrollments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStudentRewards(address) {
    try {
      const rewards = await this.utility.getStudentRewards(address);
      return { success: true, rewards };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStudentEvents(address) {
    try {
      const events = await this.utility.getStudentEvents(address);
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStudentCertifications(address) {
    try {
      const certifications = await this.utility.getStudentCertifications(
        address
      );
      return { success: true, certifications };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UtilityService();
