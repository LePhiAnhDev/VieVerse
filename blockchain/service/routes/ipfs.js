const express = require("express");
const router = express.Router();
const ipfsController = require("../controllers/ipfsController");

// POST /api/ipfs/upload (multipart/form-data, field 'file')
router.post("/upload", ipfsController.uploadFile);
// POST /api/ipfs/upload-json (application/json)
router.post("/upload-json", ipfsController.uploadJSON);
// GET /api/ipfs/:hash
router.get("/:hash", ipfsController.getFileByHash);

module.exports = router;
