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
// GET /api/company/:address/tasks
router.get("/company/:address/tasks", taskController.getCompanyTasks);
// GET /api/student/:address/tasks
router.get("/student/:address/tasks", taskController.getStudentTasks);

module.exports = router;
