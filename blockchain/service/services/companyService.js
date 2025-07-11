const { verificationContract } = require("./contractService");

class CompanyService {
  async getCompany(address) {
    try {
      const company = await verificationContract.getCompany(address);
      return { success: true, company };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CompanyService();
