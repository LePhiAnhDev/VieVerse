const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const config = require("../../config/config.js");

// Debug config loading
console.log("🔧 Config loaded:");
console.log("- RPC URL:", config.rpcUrl ? "Set" : "NOT SET");
if (config.rpcUrl) {
  console.log("  RPC URL value:", config.rpcUrl.substring(0, 20) + "...");
}
console.log("- Private Key:", config.privateKey ? "Set" : "NOT SET");
if (config.privateKey) {
  console.log(
    "  Private Key value:",
    config.privateKey.substring(0, 10) + "..."
  );
}
console.log(
  "- Internal Service Key:",
  config.internalServiceKey ? "Set" : "NOT SET"
);
console.log("- Pinata API Key:", config.pinataApiKey ? "Set" : "NOT SET");

// Load contract ABI và address
console.log("🔧 Loading deployed contracts...");
const contractsPath = path.resolve(__dirname, "../../deployed-contracts.json");
console.log("Contracts path:", contractsPath);
console.log("File exists:", fs.existsSync(contractsPath));

const contracts = JSON.parse(fs.readFileSync(contractsPath));

console.log("✅ Contracts loaded successfully");
console.log("Available contracts:", Object.keys(contracts));
console.log(
  "VieVerseTaskVerification address:",
  contracts.VieVerseTaskVerification?.address
);
console.log("VieVerseToken address:", contracts.VieVerseToken?.address);
console.log(
  "VieVerseTokenUtility address:",
  contracts.VieVerseTokenUtility?.address
);

// Khởi tạo provider và signer synchronously
console.log("🔧 Initializing provider and signer...");

// Khởi tạo provider
console.log("🔧 Creating provider...");
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
console.log("✅ Provider created successfully");

// Khởi tạo signer
console.log("🔧 Creating signer...");
const signer = new ethers.Wallet(config.privateKey, provider);
console.log("✅ Signer created successfully");

// Khởi tạo contract instances synchronously
console.log("🔧 Initializing contracts...");

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

console.log("✅ Contracts initialized successfully");
console.log(
  "Verification Contract:",
  contracts.VieVerseTaskVerification.address
);
console.log("Token Contract:", contracts.VieVerseToken.address);
console.log("Utility Contract:", contracts.VieVerseTokenUtility.address);

// Test provider connection asynchronously (don't block initialization)
provider
  .getNetwork()
  .then((network) => {
    console.log("✅ Provider connected to network:", network.name);
  })
  .catch((error) => {
    console.warn(
      "⚠️ Warning: Could not verify network connection:",
      error.message
    );
  });

// Test signer address asynchronously
signer
  .getAddress()
  .then((address) => {
    console.log("✅ Signer address:", address);
  })
  .catch((error) => {
    console.warn("⚠️ Warning: Could not get signer address:", error.message);
  });

// Export contracts directly
module.exports = {
  verificationContract,
  tokenContract,
  utilityContract,
  provider,
  signer,
};
