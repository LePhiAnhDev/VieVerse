const taskService = require("../services/taskService");

exports.createTask = async (req, res) => {
  try {
    const { title, description, reward, deadline } = req.body;
    if (!title || !description || !reward || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await taskService.createTask(
      title,
      description,
      reward,
      deadline
    );
    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    if (typeof taskId === "undefined") {
      return res.status(400).json({ error: "Missing taskId" });
    }
    const result = await taskService.acceptTask(taskId);
    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const { taskId, submissionHash } = req.body;
    if (typeof taskId === "undefined" || !submissionHash) {
      return res
        .status(400)
        .json({ error: "Missing taskId or submissionHash" });
    }
    const result = await taskService.submitTask(taskId, submissionHash);
    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!taskId) {
      return res.status(400).json({ error: "Missing taskId" });
    }
    const result = await taskService.getTask(taskId);
    if (result.success) {
      res.json({ success: true, task: result.task });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCompanyTasks = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await taskService.getCompanyTasks(address);
    if (result.success) {
      res.json({ success: true, tasks: result.tasks });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentTasks = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await taskService.getStudentTasks(address);
    if (result.success) {
      res.json({ success: true, tasks: result.tasks });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyTask = async (req, res) => {
  try {
    const { taskId, qualityScore, deadlineScore, attitudeScore, feedback } =
      req.body;
    if (
      typeof taskId === "undefined" ||
      typeof qualityScore === "undefined" ||
      typeof deadlineScore === "undefined" ||
      typeof attitudeScore === "undefined" ||
      !feedback
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await taskService.verifyTask(
      taskId,
      qualityScore,
      deadlineScore,
      attitudeScore,
      feedback
    );
    if (result.success) {
      res.json({
        success: true,
        txHash: result.txHash,
        receipt: result.receipt,
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
