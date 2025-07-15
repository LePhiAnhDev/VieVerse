import express from "express";
import BlockchainClient from "../utils/blockchain_client.js";

const router = express.Router();
const blockchainClient = new BlockchainClient();

// ==================== HEALTH CHECK ====================
router.get("/health", async (req, res) => {
  try {
    const result = await blockchainClient.checkHealth();
    res.json(result);
  } catch (error) {
    console.error("Blockchain health check error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK OPERATIONS ====================
router.post("/tasks/create", async (req, res) => {
  try {
    const { title, description, reward, deadline } = req.body;
    const result = await blockchainClient.createTask(
      title,
      description,
      reward,
      deadline
    );
    res.json(result);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/tasks/accept", async (req, res) => {
  try {
    const { taskId } = req.body;
    const result = await blockchainClient.acceptTask(taskId);
    res.json(result);
  } catch (error) {
    console.error("Accept task error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/tasks/submit", async (req, res) => {
  try {
    const { taskId, submissionHash } = req.body;
    const result = await blockchainClient.submitTask(taskId, submissionHash);
    res.json(result);
  } catch (error) {
    console.error("Submit task error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/tasks/verify", async (req, res) => {
  try {
    const { taskId, qualityScore, deadlineScore, attitudeScore, feedback } =
      req.body;
    const result = await blockchainClient.verifyTask(
      taskId,
      qualityScore,
      deadlineScore,
      attitudeScore,
      feedback
    );
    res.json(result);
  } catch (error) {
    console.error("Verify task error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const result = await blockchainClient.getTask(taskId);
    res.json(result);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/tasks/company/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainClient.getCompanyTasks(address);
    res.json(result);
  } catch (error) {
    console.error("Get company tasks error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/tasks/student/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainClient.getStudentTasks(address);
    res.json(result);
  } catch (error) {
    console.error("Get student tasks error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== UTILITY OPERATIONS ====================
router.post("/utility/enroll", async (req, res) => {
  try {
    const { courseId, student } = req.body;
    const result = await blockchainClient.enrollCourse(courseId, student);
    res.json(result);
  } catch (error) {
    console.error("Enroll course error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/utility/redeem", async (req, res) => {
  try {
    const { rewardId, student } = req.body;
    const result = await blockchainClient.redeemReward(rewardId, student);
    res.json(result);
  } catch (error) {
    console.error("Redeem reward error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/utility/join", async (req, res) => {
  try {
    const { eventId, student } = req.body;
    const result = await blockchainClient.joinEvent(eventId, student);
    res.json(result);
  } catch (error) {
    console.error("Join event error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/utility/certification", async (req, res) => {
  try {
    const { certId, student } = req.body;
    const result = await blockchainClient.purchaseCertification(
      certId,
      student
    );
    res.json(result);
  } catch (error) {
    console.error("Purchase certification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== COMPANY OPERATIONS ====================
router.get("/company/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainClient.getCompany(address);
    res.json(result);
  } catch (error) {
    console.error("Get company error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/company/register", async (req, res) => {
  try {
    const { name, description, address } = req.body;
    const result = await blockchainClient.registerCompany(
      name,
      description,
      address
    );
    res.json(result);
  } catch (error) {
    console.error("Register company error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/company/verify", async (req, res) => {
  try {
    const { companyAddress } = req.body;
    const result = await blockchainClient.verifyCompany(companyAddress);
    res.json(result);
  } catch (error) {
    console.error("Verify company error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT OPERATIONS ====================
router.get("/student/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainClient.getStudent(address);
    res.json(result);
  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/student/register", async (req, res) => {
  try {
    const { name, skills, address } = req.body;
    const result = await blockchainClient.registerStudent(
      name,
      skills,
      address
    );
    res.json(result);
  } catch (error) {
    console.error("Register student error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== IPFS OPERATIONS ====================
router.post("/ipfs/upload", async (req, res) => {
  try {
    const { file, options } = req.body;
    const result = await blockchainClient.uploadFile(file, options);
    res.json(result);
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/ipfs/json", async (req, res) => {
  try {
    const { data, options } = req.body;
    const result = await blockchainClient.uploadJSON(data, options);
    res.json(result);
  } catch (error) {
    console.error("Upload JSON error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOKEN OPERATIONS ====================
router.get("/tokens/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainClient.getTokenBalance(address);
    res.json(result);
  } catch (error) {
    console.error("Get token balance error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/tokens/mint", async (req, res) => {
  try {
    const { to, amount } = req.body;
    const result = await blockchainClient.mintTokens(to, amount);
    res.json(result);
  } catch (error) {
    console.error("Mint tokens error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/tokens/burn", async (req, res) => {
  try {
    const { from, amount } = req.body;
    const result = await blockchainClient.burnTokens(from, amount);
    res.json(result);
  } catch (error) {
    console.error("Burn tokens error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/tokens/supply", async (req, res) => {
  try {
    const result = await blockchainClient.getTotalSupply();
    res.json(result);
  } catch (error) {
    console.error("Get total supply error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/tokens/info", async (req, res) => {
  try {
    const result = await blockchainClient.getTokenInfo();
    res.json(result);
  } catch (error) {
    console.error("Get token info error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== GAS OPERATIONS ====================
router.get("/gas/analysis", async (req, res) => {
  try {
    const result = await blockchainClient.getGasAnalysis();
    res.json(result);
  } catch (error) {
    console.error("Gas analysis error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/gas/estimate", async (req, res) => {
  try {
    const { contract, method, args, options } = req.body;
    const result = await blockchainClient.estimateGas(
      contract,
      method,
      args,
      options
    );
    res.json(result);
  } catch (error) {
    console.error("Gas estimation error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
