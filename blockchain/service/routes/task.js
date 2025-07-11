const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// POST /api/task/create
router.post("/create", taskController.createTask);
// POST /api/task/accept
router.post("/accept", taskController.acceptTask);
// POST /api/task/submit
router.post("/submit", taskController.submitTask);
// POST /api/task/verify (giữ nguyên)
router.post("/verify", taskController.verifyTask);
// GET /api/task/:taskId
router.get("/:taskId", taskController.getTask);
// GET /api/task/company/:address (for tests compatibility)
router.get("/company/:address", taskController.getCompanyTasks);
// GET /api/task/student/:address (for tests compatibility)
router.get("/student/:address", taskController.getStudentTasks);

module.exports = router;
