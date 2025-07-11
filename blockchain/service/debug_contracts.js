const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { ethers } = require("ethers");
const fs = require("fs");

// Load contracts
const contractsPath = path.resolve(__dirname, "../deployed-contracts.json");
const contracts = JSON.parse(fs.readFileSync(contractsPath));

console.log("🔧 Environment Check:");
console.log("SEPOLIA_URL:", process.env.SEPOLIA_URL ? "Set" : "Not set");
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Set" : "Not set");

// Use same config as service
const config = require("../config/config.js");

console.log("🔧 Config loaded:");
console.log("- RPC URL:", config.rpcUrl ? "Set" : "NOT SET");
console.log("- Private Key:", config.privateKey ? "Set" : "NOT SET");
console.log(
  "- Internal Service Key:",
  config.internalServiceKey ? "Set" : "NOT SET"
);
console.log("- Pinata API Key:", config.pinataApiKey ? "Set" : "NOT SET");

// Initialize provider and signer
console.log("🔧 Connecting to:", config.rpcUrl);
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const signer = new ethers.Wallet(config.privateKey, provider);

// Initialize contract instances
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

async function debugContractState() {
  try {
    console.log("🔍 Debugging Contract State...");
    console.log("=====================================");

    // Check signer address
    const signerAddress = await signer.getAddress();
    console.log("📍 Signer Address:", signerAddress);

    // Check network
    const network = await provider.getNetwork();
    console.log(
      "🌐 Network:",
      network.name,
      "Chain ID:",
      network.chainId.toString()
    );

    // Check signer balance
    const signerBalance = await provider.getBalance(signerAddress);
    console.log(
      "💰 Signer ETH Balance:",
      ethers.formatEther(signerBalance),
      "ETH"
    );

    // Check token balance
    const tokenBalance = await tokenContract.balanceOf(signerAddress);
    console.log(
      "🪙 Signer Token Balance:",
      ethers.formatEther(tokenBalance),
      "VVT"
    );

    console.log("\n🏢 Contract Information:");
    console.log("=====================================");
    console.log(
      "Verification Contract:",
      contracts.VieVerseTaskVerification.address
    );
    console.log("Token Contract:", contracts.VieVerseToken.address);
    console.log("Utility Contract:", contracts.VieVerseTokenUtility.address);

    console.log("\n🔐 Contract Ownership & Permissions:");
    console.log("=====================================");

    // Check contract owner
    const contractOwner = await verificationContract.owner();
    console.log("Contract Owner:", contractOwner);
    console.log(
      "Is Signer Owner:",
      contractOwner.toLowerCase() === signerAddress.toLowerCase()
    );

    // Check if signer is moderator
    const isModerator = await verificationContract.isModerator(signerAddress);
    console.log("Is Signer Moderator:", isModerator);

    // Check emergency stop
    const emergencyStop = await verificationContract.emergencyStop();
    console.log("Emergency Stop Active:", emergencyStop);

    // Check if contract is paused
    const isPaused = await verificationContract.paused();
    console.log("Contract Paused:", isPaused);

    console.log("\n👤 User Registration Status:");
    console.log("=====================================");

    // Check if signer is registered as company
    try {
      const company = await verificationContract.getCompany(signerAddress);
      console.log("Company Registration:", {
        name: company.name,
        isVerified: company.isVerified,
        totalTasks: company.totalTasks.toString(),
      });
    } catch (error) {
      console.log("Company Registration: Not registered");
    }

    // Check if signer is registered as student
    try {
      const student = await verificationContract.getStudent(signerAddress);
      console.log("Student Registration:", {
        name: student.name,
        skills: student.skills,
        totalTasks: student.totalTasks.toString(),
        reputationScore: student.reputationScore.toString(),
      });
    } catch (error) {
      console.log("Student Registration: Not registered");
    }

    console.log("\n⚙️ Contract Settings:");
    console.log("=====================================");

    const minTaskReward = await verificationContract.minTaskReward();
    const maxTaskReward = await verificationContract.maxTaskReward();
    const platformFee = await verificationContract.platformFee();

    console.log("Min Task Reward:", ethers.formatEther(minTaskReward), "VVT");
    console.log("Max Task Reward:", ethers.formatEther(maxTaskReward), "VVT");
    console.log("Platform Fee:", platformFee.toString(), "%");

    console.log("\n🧪 Testing Basic Contract Calls:");
    console.log("=====================================");

    // Test token contract calls
    console.log("Token Name:", await tokenContract.name());
    console.log("Token Symbol:", await tokenContract.symbol());
    console.log("Token Decimals:", await tokenContract.decimals());
    console.log(
      "Token Total Supply:",
      ethers.formatEther(await tokenContract.totalSupply()),
      "VVT"
    );

    // Test if we can estimate gas for registration
    console.log("\n⛽ Gas Estimation Tests:");
    console.log("=====================================");

    try {
      const registerCompanyGas =
        await verificationContract.registerCompany.estimateGas(
          "Test Company",
          "Test Description"
        );
      console.log(
        "Register Company Gas Estimate:",
        registerCompanyGas.toString()
      );
    } catch (error) {
      console.log("Register Company Gas Estimation Failed:", error.message);
    }

    try {
      const registerStudentGas =
        await verificationContract.registerStudent.estimateGas(
          "Test Student",
          "Test Skills"
        );
      console.log(
        "Register Student Gas Estimate:",
        registerStudentGas.toString()
      );
    } catch (error) {
      console.log("Register Student Gas Estimation Failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

async function testSimpleTransaction() {
  try {
    console.log("\n🧪 Testing Simple Transaction:");
    console.log("=====================================");

    const signerAddress = await signer.getAddress();

    // Test a simple token transfer to self (should work)
    const tokenBalance = await tokenContract.balanceOf(signerAddress);
    console.log("Current token balance:", ethers.formatEther(tokenBalance));

    if (tokenBalance > 0n) {
      console.log("Testing token transfer to self...");

      const transferAmount = ethers.parseEther("1"); // 1 token
      const tx = await tokenContract.transfer(signerAddress, transferAmount, {
        gasLimit: 100000,
        gasPrice: ethers.parseUnits("20", "gwei"),
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log(
        "Transaction confirmed:",
        receipt.status === 1 ? "SUCCESS" : "FAILED"
      );
      console.log("Gas used:", receipt.gasUsed.toString());
    } else {
      console.log("No tokens to transfer, minting some first...");

      // Try to mint tokens to ourselves
      const mintAmount = ethers.parseEther("1000"); // 1000 tokens
      const tx = await tokenContract.mint(signerAddress, mintAmount, {
        gasLimit: 200000,
        gasPrice: ethers.parseUnits("20", "gwei"),
      });

      console.log("Mint transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log(
        "Mint transaction confirmed:",
        receipt.status === 1 ? "SUCCESS" : "FAILED"
      );
      console.log("Gas used:", receipt.gasUsed.toString());
    }
  } catch (error) {
    console.error("❌ Simple transaction test failed:", error);
  }
}

async function main() {
  await debugContractState();
  await testSimpleTransaction();

  console.log("\n✅ Debug completed!");
  process.exit(0);
}

main().catch(console.error);
