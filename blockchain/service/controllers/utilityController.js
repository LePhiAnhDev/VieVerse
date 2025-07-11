const utilityService = require("../services/utilityService");

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId, student } = req.body;
    if (!courseId || !student) {
      return res.status(400).json({ error: "Missing courseId or student" });
    }
    const result = await utilityService.enrollCourse(courseId, student);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash, receipt: result.receipt });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.redeemReward = async (req, res) => {
  try {
    const { rewardId, student } = req.body;
    if (!rewardId || !student) {
      return res.status(400).json({ error: "Missing rewardId or student" });
    }
    const result = await utilityService.redeemReward(rewardId, student);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash, receipt: result.receipt });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinEvent = async (req, res) => {
  try {
    const { eventId, student } = req.body;
    if (!eventId || !student) {
      return res.status(400).json({ error: "Missing eventId or student" });
    }
    const result = await utilityService.joinEvent(eventId, student);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash, receipt: result.receipt });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.purchaseCertification = async (req, res) => {
  try {
    const { certId, student } = req.body;
    if (!certId || !student) {
      return res.status(400).json({ error: "Missing certId or student" });
    }
    const result = await utilityService.purchaseCertification(certId, student);
    if (result.success) {
      res.json({ success: true, txHash: result.txHash, receipt: result.receipt });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentEnrollments = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await utilityService.getStudentEnrollments(address);
    if (result.success) {
      res.json({ success: true, enrollments: result.enrollments });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentRewards = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await utilityService.getStudentRewards(address);
    if (result.success) {
      res.json({ success: true, rewards: result.rewards });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentEvents = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await utilityService.getStudentEvents(address);
    if (result.success) {
      res.json({ success: true, events: result.events });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentCertifications = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await utilityService.getStudentCertifications(address);
    if (result.success) {
      res.json({ success: true, certifications: result.certifications });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 