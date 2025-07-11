const ipfsService = require("../services/ipfsService");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

exports.uploadFile = [
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const result = await ipfsService.uploadFile(null, req.file.path);
      // Xóa file tạm sau khi upload
      fs.unlinkSync(req.file.path);
      if (result.success) {
        res.json({ success: true, hash: result.hash });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

exports.uploadJSON = async (req, res) => {
  try {
    const json = req.body;
    if (!json || typeof json !== "object") {
      return res.status(400).json({ error: "Invalid JSON" });
    }
    const result = await ipfsService.uploadJSON(json);
    if (result.success) {
      res.json({ success: true, hash: result.hash });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFileByHash = async (req, res) => {
  try {
    const hash = req.params.hash;
    if (!hash) {
      return res.status(400).json({ error: "Missing hash" });
    }
    const result = await ipfsService.getFileByHash(hash);
    if (result.success) {
      res.json({ success: true, url: result.url });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
