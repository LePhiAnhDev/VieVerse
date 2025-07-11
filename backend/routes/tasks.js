import express from "express";
import { body, param, query } from "express-validator";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { internalAuth } from "../middleware/internalAuth.js";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  applyToTask,
  reviewApplication,
  submitWork,
  confirmCompletion,
  getMyTasks,
} from "../controllers/taskController.js";

const router = express.Router();

// Validation rules
const createTaskValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("Title must be between 5 and 255 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("requirements")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Requirements must be less than 2000 characters"),
  body("skills_required")
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("reward_tokens")
    .isInt({ min: 1, max: 10000 })
    .withMessage("Reward tokens must be between 1 and 10000"),
  body("deadline")
    .isISO8601()
    .withMessage("Please provide a valid deadline date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Deadline must be in the future");
      }
      return true;
    }),
  body("difficulty")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Difficulty must be beginner, intermediate, or advanced"),
  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("max_applicants")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Max applicants must be between 1 and 100"),
  body("is_remote")
    .optional()
    .isBoolean()
    .withMessage("Remote flag must be a boolean"),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
];

const updateTaskValidation = [
  param("id").isUUID().withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("Title must be between 5 and 255 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters"),
  body("requirements")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Requirements must be less than 2000 characters"),
  body("skills_required")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one skill is required"),
  body("reward_tokens")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Reward tokens must be between 1 and 10000"),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid deadline date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Deadline must be in the future");
      }
      return true;
    }),
  body("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Difficulty must be beginner, intermediate, or advanced"),
  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("max_applicants")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Max applicants must be between 1 and 100"),
  body("is_remote")
    .optional()
    .isBoolean()
    .withMessage("Remote flag must be a boolean"),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Location must be between 2 and 100 characters"),
];

const taskIdValidation = [param("id").isUUID().withMessage("Invalid task ID")];

const applicationIdValidation = [
  param("id").isUUID().withMessage("Invalid task ID"),
  param("applicationId").isUUID().withMessage("Invalid application ID"),
];

const applyValidation = [
  param("id").isUUID().withMessage("Invalid task ID"),
  body("cover_letter")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Cover letter must be less than 2000 characters"),
];

const reviewValidation = [
  ...applicationIdValidation,
  body("status")
    .isIn(["accepted", "rejected"])
    .withMessage("Status must be accepted or rejected"),
];

const submitWorkValidation = [
  ...taskIdValidation,
  body("submission_notes")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Submission notes must be less than 2000 characters"),
  body("submission_files")
    .optional()
    .isArray()
    .withMessage("Submission files must be an array"),
];

const confirmCompletionValidation = [
  ...taskIdValidation,
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("feedback")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Feedback must be less than 1000 characters"),
];

const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("skills")
    .optional()
    .isString()
    .withMessage("Skills must be a comma-separated string"),
  query("difficulty")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Difficulty must be beginner, intermediate, or advanced"),
  query("status")
    .optional()
    .isIn(["open", "in_progress", "completed", "cancelled"])
    .withMessage("Status must be open, in_progress, completed, or cancelled"),
  query("sort")
    .optional()
    .isIn(["created_at", "deadline", "reward_tokens", "title"])
    .withMessage(
      "Sort field must be created_at, deadline, reward_tokens, or title"
    ),
  query("order")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Order must be ASC or DESC"),
];

// Routes
router.get("/", optionalAuth, queryValidation, getAllTasks);
router.get("/my-tasks", authenticate, queryValidation, getMyTasks);
router.get("/:id", optionalAuth, taskIdValidation, getTaskById);
router.post(
  "/",
  authenticate,
  authorize("company"),
  createTaskValidation,
  createTask
);
router.put(
  "/:id",
  authenticate,
  authorize("company"),
  updateTaskValidation,
  updateTask
);
router.delete(
  "/:id",
  authenticate,
  authorize("company"),
  taskIdValidation,
  deleteTask
);
router.post(
  "/:id/apply",
  authenticate,
  authorize("student"),
  applyValidation,
  applyToTask
);
router.patch(
  "/:id/applications/:applicationId/review",
  authenticate,
  authorize("company"),
  reviewValidation,
  reviewApplication
);
router.patch(
  "/:id/submit",
  authenticate,
  authorize("student"),
  submitWorkValidation,
  submitWork
);
router.patch(
  "/:id/confirm",
  authenticate,
  authorize("company"),
  confirmCompletionValidation,
  confirmCompletion
);

// Example: Internal API chỉ cho phép service nội bộ gọi
router.post("/internal/sync-task", internalAuth, (req, res) => {
  // Xử lý logic đồng bộ task từ blockchain service
  res.json({ success: true, message: "Internal sync-task called" });
});

export default router;
