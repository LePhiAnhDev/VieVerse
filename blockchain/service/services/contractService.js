const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load contract ABI và address
const contracts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../../deployed-contracts.json"))
);

// Khởi tạo provider và signer
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Khởi tạo contract instances
const verificationContract = new ethers.Contract(
  contracts.VieVerseTaskVerification.address,
  contracts.VieVerseTaskVerification.abi,
  signer
);

const tokenContract = new ethers.Contract(
  contracts.VieVerseToken.address,
  contracts.VieVerseToken.abi,
  signer
);

const utilityContract = new ethers.Contract(
  contracts.VieVerseTokenUtility.address,
  contracts.VieVerseTokenUtility.abi,
  signer
);

module.exports = {
  verificationContract,
  tokenContract,
  utilityContract,
  provider,
  signer,
};
