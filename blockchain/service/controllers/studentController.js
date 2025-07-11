const studentService = require("../services/studentService");

exports.getStudent = async (req, res) => {
  try {
    const address = req.params.address;
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }
    const result = await studentService.getStudent(address);
    if (result.success) {
      res.json({ success: true, address, student: result.student });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
