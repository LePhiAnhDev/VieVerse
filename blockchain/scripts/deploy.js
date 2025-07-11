const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log(
    "Deploying VieVerseToken, VieVerseTaskVerification, and VieVerseTokenUtility contracts..."
  );

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // Deploy VieVerseToken
  const VieVerseToken = await ethers.getContractFactory("VieVerseToken");
  const vieVerseToken = await VieVerseToken.deploy(
    "VieVerse Token",
    "VVT",
    deployer.address
  );
  await vieVerseToken.waitForDeployment();
  const vieVerseTokenAddress = await vieVerseToken.getAddress();
  console.log("VieVerseToken deployed to:", vieVerseTokenAddress);

  // Deploy VieVerseTaskVerification
  const VieVerseTaskVerification = await ethers.getContractFactory(
    "VieVerseTaskVerification"
  );
  const taskVerification = await VieVerseTaskVerification.deploy(
    vieVerseTokenAddress,
    deployer.address
  );
  await taskVerification.waitForDeployment();
  const taskVerificationAddress = await taskVerification.getAddress();
  console.log("VieVerseTaskVerification deployed to:", taskVerificationAddress);

  // Deploy VieVerseTokenUtility
  const VieVerseTokenUtility = await ethers.getContractFactory(
    "VieVerseTokenUtility"
  );
  const tokenUtility = await VieVerseTokenUtility.deploy(
    vieVerseTokenAddress,
    deployer.address
  );
  await tokenUtility.waitForDeployment();
  const tokenUtilityAddress = await tokenUtility.getAddress();
  console.log("VieVerseTokenUtility deployed to:", tokenUtilityAddress);

  // Transfer tokens to task verification contract for rewards
  await vieVerseToken.transfer(
    taskVerificationAddress,
    ethers.parseEther("10000")
  );
  console.log("Transferred 10,000 VVT to task verification contract");

  // Transfer tokens to token utility contract for ecosystem
  await vieVerseToken.transfer(tokenUtilityAddress, ethers.parseEther("5000"));
  console.log("Transferred 5,000 VVT to token utility contract");

  // Verify the deployment
  console.log("\nVerifying deployment...");
  const deployedName = await vieVerseToken.name();
  const deployedSymbol = await vieVerseToken.symbol();
  const owner = await vieVerseToken.owner();
  console.log("Deployed VieVerseToken name:", deployedName);
  console.log("Deployed VieVerseToken symbol:", deployedSymbol);
  console.log("VieVerseToken owner:", owner);
  console.log(
    "VieVerseTaskVerification owner:",
    await taskVerification.owner()
  );
  console.log("VieVerseTokenUtility owner:", await tokenUtility.owner());

  console.log("\nDeployment completed successfully!");
  console.log("VieVerseToken address:", vieVerseTokenAddress);
  console.log("VieVerseTaskVerification address:", taskVerificationAddress);
  console.log("VieVerseTokenUtility address:", tokenUtilityAddress);

  console.log("\nContract Integration:");
  console.log(
    "- Task rewards are automatically distributed via VieVerseTaskVerification"
  );
  console.log(
    "- Token utility (courses, rewards, events, certifications) via VieVerseTokenUtility"
  );
  console.log("- Students can spend earned tokens in the VieVerse ecosystem");

  // Ghi thông tin address và ABI ra file JSON (dùng hre.artifacts)
  const VieVerseTokenArtifact = await hre.artifacts.readArtifact(
    "VieVerseToken"
  );
  const VieVerseTaskVerificationArtifact = await hre.artifacts.readArtifact(
    "VieVerseTaskVerification"
  );
  const VieVerseTokenUtilityArtifact = await hre.artifacts.readArtifact(
    "VieVerseTokenUtility"
  );

  const contractsInfo = {
    VieVerseToken: {
      address: vieVerseTokenAddress,
      abi: VieVerseTokenArtifact.abi,
    },
    VieVerseTaskVerification: {
      address: taskVerificationAddress,
      abi: VieVerseTaskVerificationArtifact.abi,
    },
    VieVerseTokenUtility: {
      address: tokenUtilityAddress,
      abi: VieVerseTokenUtilityArtifact.abi,
    },
  };
  fs.writeFileSync(
    "deployed-contracts.json",
    JSON.stringify(contractsInfo, null, 2)
  );
  console.log("\nSaved contract addresses and ABIs to deployed-contracts.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
