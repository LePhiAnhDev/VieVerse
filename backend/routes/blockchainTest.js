import express from "express";
import blockchainClient from "../utils/blockchain_client.js";

const router = express.Router();

// Địa chỉ thực tế của bạn
const realAddress = "0x6113e1F2Dc4D62123d512CDBb6EC1d83f243c4Cd";
const sampleCompany = realAddress;
const sampleStudent = realAddress;
const sampleAddress = realAddress;

// Test data for realistic scenarios
const testData = {
  company: {
    name: "VieVerse Tech Solutions",
    description:
      "Leading blockchain development company specializing in Web3 solutions and smart contract development.",
    address: sampleCompany,
  },
  student: {
    name: "Nguyen Van A",
    skills:
      "Solidity, React, JavaScript, Node.js, Blockchain Development, Smart Contracts",
    address: sampleStudent,
  },
  task: {
    title: "Develop Smart Contract for Token Staking",
    description:
      "Create a comprehensive staking smart contract with the following features: 1) Stake ERC20 tokens, 2) Earn rewards based on staking duration, 3) Emergency withdrawal functionality, 4) Admin controls for reward rates, 5) Gas optimization, 6) Security audit compliance. Deliverables include: Smart contract code, Unit tests, Documentation, Deployment scripts.",
    reward: "5000000000000000000", // 5 tokens
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // +7 days (realistic deadline)
  },
  token: {
    mintAmount: "1000000000000000000000", // 1000 tokens
    burnAmount: "100000000000000000000", // 100 tokens
  },
  ipfs: {
    testFile: Buffer.from(
      JSON.stringify({
        projectName: "VieVerse Staking Contract",
        version: "1.0.0",
        author: "Nguyen Van A",
        description: "Smart contract implementation for token staking",
        files: ["StakingContract.sol", "test/StakingTest.js", "README.md"],
        timestamp: new Date().toISOString(),
      })
    ),
    testJSON: {
      submissionData: {
        projectId: "STAKE_001",
        githubRepo: "https://github.com/user/staking-contract",
        deployedAddress: "0x1234567890123456789012345678901234567890",
        testResults: {
          unitTests: "100% passed",
          coverage: "95%",
          gasOptimization: "Optimized",
        },
        documentation: "Complete with examples",
        auditReport: "Security review completed",
      },
    },
  },
};

// Helper function to wait
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to log test results
const logTestResult = (testName, result, startTime) => {
  const duration = Date.now() - startTime;
  const status = result.error ? "❌ FAILED" : "✅ PASSED";
  console.log(`[${status}] ${testName} (${duration}ms)`);
  if (result.error) {
    console.log(`   Error: ${result.error}`);
  } else if (result.txHash) {
    console.log(`   TxHash: ${result.txHash}`);
  }
};

router.get("/test-blockchain-comprehensive", async (req, res) => {
  const results = {
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null,
    },
    tests: {},
  };

  let createdTaskId = null;
  const overallStartTime = Date.now();

  console.log("🚀 Starting Comprehensive Blockchain Test Suite...");
  console.log(`📡 Backend Server: http://localhost:5000`);
  console.log(`⛓️ Blockchain Service: http://localhost:5001`);

  // ==================== PHASE 1: INFRASTRUCTURE TESTS ====================
  console.log("\n📋 PHASE 1: Infrastructure & Health Checks");

  // 1. Health Check
  let startTime = Date.now();
  try {
    results.tests.health = await blockchainClient.checkHealth();
    logTestResult("Health Check", results.tests.health, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.health = { error: e.message };
    logTestResult("Health Check", results.tests.health, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 2. Gas Analysis
  startTime = Date.now();
  try {
    results.tests.gasAnalysis = await blockchainClient.getGasAnalysis();
    logTestResult("Gas Analysis", results.tests.gasAnalysis, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.gasAnalysis = { error: e.message };
    logTestResult("Gas Analysis", results.tests.gasAnalysis, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 3. Default Gas Limits
  startTime = Date.now();
  try {
    results.tests.defaultGasLimits =
      await blockchainClient.getDefaultGasLimits();
    logTestResult(
      "Default Gas Limits",
      results.tests.defaultGasLimits,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.defaultGasLimits = { error: e.message };
    logTestResult(
      "Default Gas Limits",
      results.tests.defaultGasLimits,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(1000); // Wait between phases

  // ==================== PHASE 2: REGISTRATION TESTS ====================
  console.log("\n👥 PHASE 2: User Registration");

  // 4. Company Registration
  startTime = Date.now();
  try {
    results.tests.registerCompany = await blockchainClient.registerCompany(
      testData.company.name,
      testData.company.description,
      testData.company.address
    );
    logTestResult(
      "Company Registration",
      results.tests.registerCompany,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.registerCompany = { error: e.message };
    logTestResult(
      "Company Registration",
      results.tests.registerCompany,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(2000); // Wait for transaction confirmation

  // 5. Student Registration
  startTime = Date.now();
  try {
    results.tests.registerStudent = await blockchainClient.registerStudent(
      testData.student.name,
      testData.student.skills,
      testData.student.address
    );
    logTestResult(
      "Student Registration",
      results.tests.registerStudent,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.registerStudent = { error: e.message };
    logTestResult(
      "Student Registration",
      results.tests.registerStudent,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(2000); // Wait for transaction confirmation

  // 6. Verify Company Data
  startTime = Date.now();
  try {
    results.tests.getCompany = await blockchainClient.getCompany(sampleCompany);
    logTestResult("Get Company Data", results.tests.getCompany, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.getCompany = { error: e.message };
    logTestResult("Get Company Data", results.tests.getCompany, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 7. Verify Student Data
  startTime = Date.now();
  try {
    results.tests.getStudent = await blockchainClient.getStudent(sampleStudent);
    logTestResult("Get Student Data", results.tests.getStudent, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.getStudent = { error: e.message };
    logTestResult("Get Student Data", results.tests.getStudent, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(1000);

  // ==================== PHASE 3: TOKEN OPERATIONS ====================
  console.log("\n💰 PHASE 3: Token Operations");

  // 8. Check Initial Token Balance
  startTime = Date.now();
  try {
    results.tests.initialTokenBalance = await blockchainClient.getTokenBalance(
      sampleAddress
    );
    logTestResult(
      "Initial Token Balance",
      results.tests.initialTokenBalance,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.initialTokenBalance = { error: e.message };
    logTestResult(
      "Initial Token Balance",
      results.tests.initialTokenBalance,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 9. Mint Tokens
  startTime = Date.now();
  try {
    results.tests.mintTokens = await blockchainClient.mintTokens(
      sampleAddress,
      testData.token.mintAmount
    );
    logTestResult("Mint Tokens", results.tests.mintTokens, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.mintTokens = { error: e.message };
    logTestResult("Mint Tokens", results.tests.mintTokens, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(3000); // Wait for transaction confirmation

  // 10. Check Token Balance After Mint
  startTime = Date.now();
  try {
    results.tests.tokenBalanceAfterMint =
      await blockchainClient.getTokenBalance(sampleAddress);
    logTestResult(
      "Token Balance After Mint",
      results.tests.tokenBalanceAfterMint,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.tokenBalanceAfterMint = { error: e.message };
    logTestResult(
      "Token Balance After Mint",
      results.tests.tokenBalanceAfterMint,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 11. Get Token Info
  startTime = Date.now();
  try {
    results.tests.tokenInfo = await blockchainClient.getTokenInfo();
    logTestResult("Token Info", results.tests.tokenInfo, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.tokenInfo = { error: e.message };
    logTestResult("Token Info", results.tests.tokenInfo, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(1000);

  // ==================== PHASE 4: TASK LIFECYCLE ====================
  console.log("\n📋 PHASE 4: Complete Task Lifecycle");

  // 12. Create Task
  startTime = Date.now();
  try {
    const createTaskResult = await blockchainClient.createTask(
      testData.task.title,
      testData.task.description,
      testData.task.reward,
      testData.task.deadline
    );
    results.tests.createTask = createTaskResult;

    // Extract task ID from response
    createdTaskId =
      createTaskResult.taskData?.id ||
      createTaskResult.taskId ||
      createTaskResult.id ||
      1; // fallback

    logTestResult("Create Task", results.tests.createTask, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.createTask = { error: e.message };
    logTestResult("Create Task", results.tests.createTask, startTime);
    results.summary.failed++;
    createdTaskId = 1; // fallback for subsequent tests
  }
  results.summary.totalTests++;

  await wait(3000); // Wait for transaction confirmation

  // 13. Get Created Task
  startTime = Date.now();
  try {
    results.tests.getCreatedTask = await blockchainClient.getTask(
      createdTaskId
    );
    logTestResult("Get Created Task", results.tests.getCreatedTask, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.getCreatedTask = { error: e.message };
    logTestResult("Get Created Task", results.tests.getCreatedTask, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 14. Accept Task
  startTime = Date.now();
  try {
    results.tests.acceptTask = await blockchainClient.acceptTask(createdTaskId);
    logTestResult("Accept Task", results.tests.acceptTask, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.acceptTask = { error: e.message };
    logTestResult("Accept Task", results.tests.acceptTask, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(3000); // Wait for transaction confirmation

  // ==================== PHASE 5: IPFS INTEGRATION ====================
  console.log("\n📁 PHASE 5: IPFS File Management");

  let submissionHash = "QmTestHash"; // fallback

  // 15. Upload Project File to IPFS
  startTime = Date.now();
  try {
    results.tests.uploadProjectFile = await blockchainClient.uploadFile(
      testData.ipfs.testFile,
      {
        name: "project-submission.json",
      }
    );
    logTestResult(
      "Upload Project File",
      results.tests.uploadProjectFile,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.uploadProjectFile = { error: e.message };
    logTestResult(
      "Upload Project File",
      results.tests.uploadProjectFile,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 16. Upload Submission Data as JSON
  startTime = Date.now();
  try {
    const uploadResult = await blockchainClient.uploadJSON(
      testData.ipfs.testJSON
    );
    results.tests.uploadSubmissionJSON = uploadResult;

    if (uploadResult.hash) {
      submissionHash = uploadResult.hash;
    }

    logTestResult(
      "Upload Submission JSON",
      results.tests.uploadSubmissionJSON,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.uploadSubmissionJSON = { error: e.message };
    logTestResult(
      "Upload Submission JSON",
      results.tests.uploadSubmissionJSON,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(2000);

  // 17. Submit Task with IPFS Hash
  startTime = Date.now();
  try {
    results.tests.submitTask = await blockchainClient.submitTask(
      createdTaskId,
      submissionHash
    );
    logTestResult("Submit Task", results.tests.submitTask, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.submitTask = { error: e.message };
    logTestResult("Submit Task", results.tests.submitTask, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(3000); // Wait for transaction confirmation

  // 18. Verify/Grade Task
  startTime = Date.now();
  try {
    results.tests.verifyTask = await blockchainClient.verifyTask(
      createdTaskId,
      88,
      92,
      95,
      "Excellent work! The smart contract implementation is well-structured with proper security measures. Gas optimization is impressive. Documentation is comprehensive. Minor improvements needed in error handling. Overall outstanding delivery."
    );
    logTestResult("Verify Task", results.tests.verifyTask, startTime);
    results.summary.passed++;
  } catch (e) {
    results.tests.verifyTask = { error: e.message };
    logTestResult("Verify Task", results.tests.verifyTask, startTime);
    results.summary.failed++;
  }
  results.summary.totalTests++;

  await wait(3000); // Wait for transaction confirmation

  // ==================== PHASE 6: DATA VERIFICATION ====================
  console.log("\n🔍 PHASE 6: Data Verification & Analytics");

  // 19. Get Final Task Status
  startTime = Date.now();
  try {
    results.tests.getFinalTask = await blockchainClient.getTask(createdTaskId);
    logTestResult(
      "Get Final Task Status",
      results.tests.getFinalTask,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.getFinalTask = { error: e.message };
    logTestResult(
      "Get Final Task Status",
      results.tests.getFinalTask,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 20. Get Student Reputation
  startTime = Date.now();
  try {
    results.tests.getStudentReputation = await blockchainClient.getReputation(
      sampleStudent
    );
    logTestResult(
      "Get Student Reputation",
      results.tests.getStudentReputation,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.getStudentReputation = { error: e.message };
    logTestResult(
      "Get Student Reputation",
      results.tests.getStudentReputation,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 21. Get Company Tasks
  startTime = Date.now();
  try {
    results.tests.getCompanyTasks = await blockchainClient.getCompanyTasks(
      sampleCompany
    );
    logTestResult(
      "Get Company Tasks",
      results.tests.getCompanyTasks,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.getCompanyTasks = { error: e.message };
    logTestResult(
      "Get Company Tasks",
      results.tests.getCompanyTasks,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 22. Get Student Tasks
  startTime = Date.now();
  try {
    results.tests.getStudentTasks = await blockchainClient.getStudentTasks(
      sampleStudent
    );
    logTestResult(
      "Get Student Tasks",
      results.tests.getStudentTasks,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.getStudentTasks = { error: e.message };
    logTestResult(
      "Get Student Tasks",
      results.tests.getStudentTasks,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 23. Final Token Balance Check
  startTime = Date.now();
  try {
    results.tests.finalTokenBalance = await blockchainClient.getTokenBalance(
      sampleAddress
    );
    logTestResult(
      "Final Token Balance",
      results.tests.finalTokenBalance,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.finalTokenBalance = { error: e.message };
    logTestResult(
      "Final Token Balance",
      results.tests.finalTokenBalance,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // ==================== PHASE 7: GAS OPTIMIZATION TESTS ====================
  console.log("\n⛽ PHASE 7: Gas Optimization & Performance");

  // 24. Gas Estimation for Token Transfer
  startTime = Date.now();
  try {
    results.tests.gasEstimateTransfer = await blockchainClient.estimateGas(
      "token",
      "transfer",
      [sampleAddress, "1000000000000000000"], // 1 token
      { bufferPercentage: 20 }
    );
    logTestResult(
      "Gas Estimate Transfer",
      results.tests.gasEstimateTransfer,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.gasEstimateTransfer = { error: e.message };
    logTestResult(
      "Gas Estimate Transfer",
      results.tests.gasEstimateTransfer,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // 25. Gas Estimation for Task Creation
  startTime = Date.now();
  try {
    results.tests.gasEstimateCreateTask = await blockchainClient.estimateGas(
      "verification",
      "createTask",
      [
        "Test Task",
        "Description",
        "1000000000000000000",
        Date.now() + 86400000,
      ],
      { bufferPercentage: 25 }
    );
    logTestResult(
      "Gas Estimate Create Task",
      results.tests.gasEstimateCreateTask,
      startTime
    );
    results.summary.passed++;
  } catch (e) {
    results.tests.gasEstimateCreateTask = { error: e.message };
    logTestResult(
      "Gas Estimate Create Task",
      results.tests.gasEstimateCreateTask,
      startTime
    );
    results.summary.failed++;
  }
  results.summary.totalTests++;

  // ==================== FINAL SUMMARY ====================
  const overallEndTime = Date.now();
  results.summary.endTime = new Date().toISOString();
  results.summary.duration = overallEndTime - overallStartTime;
  results.summary.successRate = (
    (results.summary.passed / results.summary.totalTests) *
    100
  ).toFixed(2);

  console.log("\n" + "=".repeat(60));
  console.log("📊 COMPREHENSIVE TEST RESULTS SUMMARY");
  console.log("=".repeat(60));
  console.log(`🕐 Total Duration: ${results.summary.duration}ms`);
  console.log(`📋 Total Tests: ${results.summary.totalTests}`);
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📈 Success Rate: ${results.summary.successRate}%`);
  console.log("=".repeat(60));

  // Add test metadata
  results.metadata = {
    testSuite: "VieVerse Blockchain Comprehensive Test",
    version: "2.0.0",
    environment: process.env.NODE_ENV || "development",
    blockchain: "Sepolia Testnet",
    testAddress: realAddress,
    backendPort: 5000,
    blockchainServicePort: 5001,
    gasOptimization: "Enabled",
    retryMechanism: "Enabled",
    ipfsIntegration: "Enabled",
  };

  res.json(results);
});

// Quick health check endpoint
router.get("/test-health-quick", async (req, res) => {
  try {
    const health = await blockchainClient.checkHealth();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      backendPort: 5000,
      blockchainServicePort: 5001,
      health,
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      backendPort: 5000,
      blockchainServicePort: 5001,
      error: error.message,
    });
  }
});

// Test individual components
router.get("/test-component/:component", async (req, res) => {
  const { component } = req.params;
  const startTime = Date.now();

  try {
    let result;

    switch (component) {
      case "health":
        result = await blockchainClient.checkHealth();
        break;
      case "gas":
        result = await blockchainClient.getGasAnalysis();
        break;
      case "company":
        result = await blockchainClient.getCompany(realAddress);
        break;
      case "student":
        result = await blockchainClient.getStudent(realAddress);
        break;
      case "token":
        result = await blockchainClient.getTokenBalance(realAddress);
        break;
      default:
        throw new Error(`Unknown component: ${component}`);
    }

    res.json({
      success: true,
      component,
      duration: Date.now() - startTime,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      component,
      duration: Date.now() - startTime,
      error: error.message,
    });
  }
});

export default router;
