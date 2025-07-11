const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class TokenService {
  constructor() {
    const contracts = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../deployed-contracts.json"))
    );
    this.tokenAbi = contracts.VieVerseToken.abi;
    this.tokenAddress = contracts.VieVerseToken.address;
    this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    this.ownerSigner = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      this.provider
    );
    this.token = new ethers.Contract(
      this.tokenAddress,
      this.tokenAbi,
      this.ownerSigner
    );
  }

  async getBalance(address) {
    try {
      const balance = await this.token.balanceOf(address);
      return { success: true, balance: balance.toString() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async mint(to, amount) {
    try {
      const tx = await this.token.mint(to, amount);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async burn(from, amount) {
    try {
      // Burn phải dùng signer là from (user tự burn)
      const userSigner = new ethers.Wallet(
        process.env.PRIVATE_KEY,
        this.provider
      );
      const userToken = this.token.connect(userSigner);
      const tx = await userToken.burn(amount);
      const receipt = await tx.wait();
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new TokenService();
