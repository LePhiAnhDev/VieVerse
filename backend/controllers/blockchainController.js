import { validationResult } from "express-validator";
import { User, BlockchainRegistration } from "../models/index.js";
import BlockchainClient from "../utils/blockchain_client.js";

const blockchainClient = new BlockchainClient();

// Đăng ký blockchain cho student (tự động xác thực)
export const registerStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name, skills, address } = req.body;
    const userId = req.user.id;

    // Kiểm tra xem user đã đăng ký blockchain chưa
    const existingRegistration = await BlockchainRegistration.findOne({
      where: { user_id: userId, status: "approved" },
    });

    if (existingRegistration) {
      return res.status(409).json({
        error: "User đã được đăng ký blockchain",
      });
    }

    // Kiểm tra xem wallet address đã được sử dụng chưa
    const existingWallet = await BlockchainRegistration.findOne({
      where: { wallet_address: address, status: "approved" },
    });

    if (existingWallet) {
      return res.status(409).json({
        error: "Wallet address đã được sử dụng",
      });
    }

    // Thử đăng ký trên blockchain (có thể fail nếu service không khả dụng)
    let blockchainResult = {
      success: false,
      error: "Blockchain service not available",
    };
    let txHash = null;

    try {
      blockchainResult = await blockchainClient.registerStudent(
        name,
        skills,
        address
      );
      if (blockchainResult.success) {
        txHash = blockchainResult.txHash;
      }
    } catch (blockchainError) {
      console.warn("Blockchain service error:", blockchainError.message);
      // Tiếp tục với việc lưu vào database ngay cả khi blockchain service fail
    }

    // Lưu vào database với trạng thái approved (student được xác thực ngay)
    const registration = await BlockchainRegistration.create({
      user_id: userId,
      wallet_address: address,
      role: "student",
      name,
      skills: skills || [],
      status: "approved",
      approved_by: userId, // Tự động xác thực
      approved_at: new Date(),
      blockchain_tx_hash: txHash,
    });

    // Cập nhật user
    await User.update(
      { blockchain_registered: true },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: blockchainResult.success
        ? "Đăng ký blockchain thành công"
        : "Đăng ký thành công (blockchain service tạm thời không khả dụng)",
      registration: {
        id: registration.id,
        status: registration.status,
        txHash: registration.blockchain_tx_hash,
      },
    });
  } catch (error) {
    console.error("Register student error:", error);
    res.status(500).json({
      error: "Internal server error: " + error.message,
    });
  }
};

// Đăng ký blockchain cho company (cần admin duyệt)
export const registerCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { name, description, address } = req.body;
    const userId = req.user.id;

    // Kiểm tra xem user đã đăng ký blockchain chưa
    const existingRegistration = await BlockchainRegistration.findOne({
      where: { user_id: userId, status: "approved" },
    });

    if (existingRegistration) {
      return res.status(409).json({
        error: "User đã được đăng ký blockchain",
      });
    }

    // Kiểm tra xem có yêu cầu đang chờ duyệt không
    const pendingRegistration = await BlockchainRegistration.findOne({
      where: { user_id: userId, status: "pending" },
    });

    if (pendingRegistration) {
      return res.status(409).json({
        error: "Đã có yêu cầu đăng ký đang chờ duyệt",
      });
    }

    // Kiểm tra xem wallet address đã được sử dụng chưa
    const existingWallet = await BlockchainRegistration.findOne({
      where: { wallet_address: address, status: "approved" },
    });

    if (existingWallet) {
      return res.status(409).json({
        error: "Wallet address đã được sử dụng",
      });
    }

    // Thử đăng ký trên blockchain (có thể fail nếu service không khả dụng)
    let blockchainResult = {
      success: false,
      error: "Blockchain service not available",
    };
    let txHash = null;

    try {
      blockchainResult = await blockchainClient.registerCompany(
        name,
        description || "",
        address
      );
      if (blockchainResult.success) {
        txHash = blockchainResult.txHash;
      }
    } catch (blockchainError) {
      console.warn("Blockchain service error:", blockchainError.message);
      // Tiếp tục với việc lưu vào database ngay cả khi blockchain service fail
    }

    // Lưu vào database với trạng thái pending (cần admin duyệt)
    const registration = await BlockchainRegistration.create({
      user_id: userId,
      wallet_address: address,
      role: "company",
      name,
      description: description || "",
      status: "pending",
      blockchain_tx_hash: txHash,
    });

    res.json({
      success: true,
      message: blockchainResult.success
        ? "Đăng ký blockchain thành công! Đang chờ admin xác thực."
        : "Đăng ký thành công (blockchain service tạm thời không khả dụng). Đang chờ admin xác thực.",
      registration: {
        id: registration.id,
        status: registration.status,
        txHash: registration.blockchain_tx_hash,
      },
    });
  } catch (error) {
    console.error("Register company error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Admin duyệt đăng ký company
export const verifyCompany = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { registrationId, action, rejectionReason } = req.body;
    const adminId = req.user.id;

    // Kiểm tra quyền admin (có thể thêm middleware riêng)
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        error: "Không có quyền thực hiện hành động này",
      });
    }

    const registration = await BlockchainRegistration.findByPk(registrationId, {
      include: [{ model: User, as: "user" }],
    });

    if (!registration) {
      return res.status(404).json({
        error: "Không tìm thấy yêu cầu đăng ký",
      });
    }

    if (registration.status !== "pending") {
      return res.status(400).json({
        error: "Yêu cầu đăng ký không ở trạng thái chờ duyệt",
      });
    }

    if (action === "approve") {
      // Xác thực company trên blockchain
      const blockchainResult = await blockchainClient.verifyCompany(
        registration.wallet_address
      );

      if (!blockchainResult.success) {
        return res.status(500).json({
          error: "Lỗi xác thực trên blockchain: " + blockchainResult.error,
        });
      }

      // Cập nhật trạng thái
      await registration.update({
        status: "approved",
        approved_by: adminId,
        approved_at: new Date(),
        blockchain_tx_hash: blockchainResult.txHash || null,
      });

      // Cập nhật user
      await User.update(
        { blockchain_registered: true },
        { where: { id: registration.user_id } }
      );

      res.json({
        success: true,
        message: "Đã xác thực company trên blockchain thành công",
        registration: {
          id: registration.id,
          status: registration.status,
          txHash: blockchainResult.txHash || registration.blockchain_tx_hash,
        },
      });
    } else if (action === "reject") {
      // Từ chối đăng ký
      await registration.update({
        status: "rejected",
        approved_by: adminId,
        approved_at: new Date(),
        rejection_reason: rejectionReason || "Không đủ điều kiện",
      });

      res.json({
        success: true,
        message: "Đã từ chối đăng ký blockchain",
        registration: {
          id: registration.id,
          status: registration.status,
          rejectionReason: registration.rejection_reason,
        },
      });
    } else {
      return res.status(400).json({
        error: "Hành động không hợp lệ",
      });
    }
  } catch (error) {
    console.error("Verify company error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Lấy danh sách yêu cầu đăng ký (cho admin)
export const getPendingRegistrations = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Kiểm tra quyền admin
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        error: "Không có quyền truy cập",
      });
    }

    const registrations = await BlockchainRegistration.findAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      registrations,
    });
  } catch (error) {
    console.error("Get pending registrations error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Lấy trạng thái đăng ký của user
export const getUserRegistrationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const registration = await BlockchainRegistration.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      registration: registration || null,
    });
  } catch (error) {
    console.error("Get user registration status error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
