import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { User, Task, Application } from "../models/index.js";
import BlockchainClient from "../utils/blockchain_client.js";

const blockchainClient = new BlockchainClient();

export const getAllTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      skills,
      difficulty,
      category,
      status = "open",
      sort = "created_at",
      order = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Add filters
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      where.skills_required = {
        [Op.overlap]: skillsArray,
      };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    // Only show tasks that haven't exceeded deadline
    where.deadline = { [Op.gte]: new Date() };

    const tasks = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "company_name", "avatar", "is_verified"],
        },
        {
          model: Application,
          as: "applications",
          attributes: ["id", "student_id", "status"],
          where: req.user ? { student_id: req.user.id } : undefined,
          required: false,
        },
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    res.json({
      tasks: tasks.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(tasks.count / limit),
        total_tasks: tasks.count,
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: "company",
          attributes: [
            "id",
            "name",
            "company_name",
            "avatar",
            "is_verified",
            "industry",
          ],
        },
        {
          model: User,
          as: "selectedStudent",
          attributes: ["id", "name", "avatar", "university", "major"],
        },
        {
          model: Application,
          as: "applications",
          include: [
            {
              model: User,
              as: "student",
              attributes: [
                "id",
                "name",
                "avatar",
                "university",
                "major",
                "skills",
              ],
            },
          ],
        },
      ],
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Check if current user has applied
    let userApplication = null;
    if (req.user && req.user.role === "student") {
      userApplication = await Application.findOne({
        where: {
          task_id: id,
          student_id: req.user.id,
        },
      });
    }

    res.json({
      task,
      user_application: userApplication,
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const taskData = {
      ...req.body,
      company_id: req.user.id,
    };

    // Tạo task trên blockchain trước
    let blockchainResult = null;
    let blockchainTaskId = null;

    try {
      // Chuyển đổi deadline từ milliseconds sang seconds cho blockchain
      const deadlineInSeconds = Math.floor(
        new Date(taskData.deadline).getTime() / 1000
      );

      // Chuyển đổi reward từ tokens sang Wei (18 decimals)
      const rewardInWei = (
        taskData.reward_tokens * Math.pow(10, 18)
      ).toString();

      blockchainResult = await blockchainClient.createTask(
        taskData.title,
        taskData.description,
        rewardInWei, // Sử dụng rewardInWei thay vì reward_tokens
        deadlineInSeconds
      );

      if (blockchainResult.success) {
        blockchainTaskId = blockchainResult.taskId;
        console.log(
          "✅ Task created on blockchain successfully:",
          blockchainTaskId
        );
      } else {
        console.warn(
          "⚠️ Blockchain task creation failed:",
          blockchainResult.error
        );
        // Không lưu vào database nếu blockchain fail
        return res.status(400).json({
          error:
            "Failed to create task on blockchain: " + blockchainResult.error,
          blockchain: {
            success: false,
            error: blockchainResult.error,
          },
        });
      }
    } catch (blockchainError) {
      console.error("❌ Blockchain service error:", blockchainError.message);
      // Không lưu vào database nếu blockchain service fail
      return res.status(500).json({
        error: "Blockchain service unavailable: " + blockchainError.message,
        blockchain: {
          success: false,
          error: blockchainError.message,
        },
      });
    }

    // Chỉ lưu task vào database nếu blockchain thành công
    const task = await Task.create({
      ...taskData,
      blockchain_task_id: blockchainTaskId,
      blockchain_tx_hash: blockchainResult?.txHash || null,
    });

    // Load task with company info
    const fullTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "company_name", "avatar", "is_verified"],
        },
      ],
    });

    res.status(201).json({
      message: "Task created successfully on blockchain and database",
      task: fullTask,
      blockchain: {
        success: true,
        taskId: blockchainTaskId,
        txHash: blockchainResult?.txHash || null,
      },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Check if user owns this task
    if (task.company_id !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. You can only update your own tasks.",
      });
    }

    // Don't allow updating if task is already in progress or completed
    if (task.status !== "open") {
      return res.status(400).json({
        error: "Cannot update task that is not open",
      });
    }

    const updateData = { ...req.body };
    delete updateData.company_id; // Prevent changing company
    delete updateData.id;

    await task.update(updateData);

    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "company_name", "avatar", "is_verified"],
        },
      ],
    });

    res.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Check if user owns this task
    if (task.company_id !== req.user.id) {
      return res.status(403).json({
        error: "Access denied. You can only delete your own tasks.",
      });
    }

    // Don't allow deleting if task is already in progress or completed
    if (task.status !== "open") {
      return res.status(400).json({
        error: "Cannot delete task that is not open",
      });
    }

    await task.destroy();

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const applyToTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { cover_letter } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Check if task is still open
    if (task.status !== "open") {
      return res.status(400).json({
        error: "Task is no longer accepting applications",
      });
    }

    // Check if deadline has passed
    if (new Date() > task.deadline) {
      return res.status(400).json({
        error: "Task deadline has passed",
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      where: {
        task_id: id,
        student_id: req.user.id,
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        error: "You have already applied to this task",
      });
    }

    // Check if task has reached max applicants
    if (task.current_applicants >= task.max_applicants) {
      return res.status(400).json({
        error: "Task has reached maximum number of applicants",
      });
    }

    // Create application
    const application = await Application.create({
      task_id: id,
      student_id: req.user.id,
      cover_letter,
    });

    // Update task's current applicants count
    await task.update({
      current_applicants: task.current_applicants + 1,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Apply to task error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const reviewApplication = async (req, res) => {
  try {
    const { id, applicationId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Must be accepted or rejected",
      });
    }

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Check if user owns this task
    if (task.company_id !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const application = await Application.findOne({
      where: {
        id: applicationId,
        task_id: id,
      },
    });

    if (!application) {
      return res.status(404).json({
        error: "Application not found",
      });
    }

    // Update application status
    await application.update({
      status,
      reviewed_at: new Date(),
    });

    // If accepted, update task status and selected student
    if (status === "accepted") {
      await task.update({
        status: "in_progress",
        selected_student_id: application.student_id,
      });

      // Update application work status
      await application.update({
        work_status: "in_progress",
      });

      // Reject other pending applications
      await Application.update(
        { status: "rejected", reviewed_at: new Date() },
        {
          where: {
            task_id: id,
            status: "pending",
            id: { [Op.ne]: applicationId },
          },
        }
      );
    }

    res.json({
      message: `Application ${status} successfully`,
      application,
    });
  } catch (error) {
    console.error("Review application error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const submitWork = async (req, res) => {
  try {
    const { id } = req.params;
    const { submission_notes, submission_files } = req.body;

    const application = await Application.findOne({
      where: {
        task_id: id,
        student_id: req.user.id,
        status: "accepted",
      },
    });

    if (!application) {
      return res.status(404).json({
        error: "Application not found or not accepted",
      });
    }

    if (application.work_status !== "in_progress") {
      return res.status(400).json({
        error: "Work is not in progress",
      });
    }

    await application.update({
      work_status: "submitted",
      submission_notes,
      submission_files: submission_files || [],
      submitted_at: new Date(),
    });

    res.json({
      message: "Work submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Submit work error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const confirmCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Check if user owns this task
    if (task.company_id !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const application = await Application.findOne({
      where: {
        task_id: id,
        status: "accepted",
        work_status: "submitted",
      },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "tokens"],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({
        error: "No submitted work found for this task",
      });
    }

    // Update application and task status
    await application.update({
      work_status: "completed",
      completed_at: new Date(),
      rating,
      feedback,
    });

    await task.update({
      status: "completed",
    });

    res.json({
      message: "Task completion confirmed successfully",
      task,
      application,
      tokens_awarded: task.reward_tokens,
    });
  } catch (error) {
    console.error("Confirm completion error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (req.user.role === "company") {
      where.company_id = req.user.id;
    } else {
      // For students, get tasks they've applied to
      const applications = await Application.findAll({
        where: { student_id: req.user.id },
        attributes: ["task_id"],
      });
      where.id = { [Op.in]: applications.map((app) => app.task_id) };
    }

    if (status) {
      where.status = status;
    }

    const tasks = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "company",
          attributes: ["id", "name", "company_name", "avatar", "is_verified"],
        },
        {
          model: User,
          as: "selectedStudent",
          attributes: ["id", "name", "avatar", "university", "major"],
        },
        {
          model: Application,
          as: "applications",
          where:
            req.user.role === "student"
              ? { student_id: req.user.id }
              : undefined,
          required: req.user.role === "student",
          include:
            req.user.role === "company"
              ? [
                  {
                    model: User,
                    as: "student",
                    attributes: [
                      "id",
                      "name",
                      "avatar",
                      "university",
                      "major",
                      "skills",
                    ],
                  },
                ]
              : [],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    res.json({
      tasks: tasks.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(tasks.count / limit),
        total_tasks: tasks.count,
        per_page: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
