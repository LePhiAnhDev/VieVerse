/**
 * Blockchain Service Configuration
 * Configuration for connecting to VieVerse blockchain service
 */

const config = {
  // Blockchain service URL
  serviceUrl: process.env.BLOCKCHAIN_SERVICE_URL || "http://localhost:5001",

  // Internal authentication key for internal requests
  internalAuthKey: process.env.INTERNAL_SERVICE_KEY || "",

  // API endpoints
  endpoints: {
    // Health check
    health: "/health",

    // Task operations
    createTask: "/api/tasks/create",
    acceptTask: "/api/tasks/accept",
    submitTask: "/api/tasks/submit",
    verifyTask: "/api/tasks/verify",
    getTask: "/api/tasks",
    getCompanyTasks: "/api/tasks/company",
    getStudentTasks: "/api/tasks/student",

    // Token operations
    getBalance: "/api/tokens/balance",
    mint: "/api/tokens/mint",
    burn: "/api/tokens/burn",
    getTotalSupply: "/api/tokens/supply",
    getTokenInfo: "/api/tokens/info",

    // Utility operations
    enrollCourse: "/api/utility/enroll",
    redeemReward: "/api/utility/redeem",
    joinEvent: "/api/utility/join",
    purchaseCertification: "/api/utility/certification",
    getStudentEnrollments: "/api/utility/enrollments",
    getStudentRewards: "/api/utility/rewards",
    getStudentEvents: "/api/utility/events",
    getStudentCertifications: "/api/utility/certifications",

    // Company operations
    getCompany: "/api/company",
    registerCompany: "/api/company/register",
    verifyCompany: "/api/company/verify",
    getCompanyStats: "/api/company/stats",
    isCompanyVerified: "/api/company/verified",

    // Student operations
    getStudent: "/api/student",
    registerStudent: "/api/student/register",
    getReputation: "/api/student/reputation",
    getStudentStats: "/api/student/stats",
    getStudentActivity: "/api/student/activity",
    isStudentRegistered: "/api/student/registered",

    // IPFS operations
    uploadFile: "/api/ipfs/upload",
    uploadJSON: "/api/ipfs/json",
    getFile: "/api/ipfs/file",
    getJSON: "/api/ipfs/json",
    pinFile: "/api/ipfs/pin",
    unpinFile: "/api/ipfs/unpin",

    // Reputation operations
    getReputationScore: "/api/reputation/score",
    getReputationHistory: "/api/reputation/history",
    getReputationRanking: "/api/reputation/ranking",

    // Gas operations
    getGasAnalysis: "/api/gas/analysis",
    estimateGas: "/api/gas/estimate",
    getDefaultGasLimits: "/api/gas/defaults",
    prepareTransaction: "/api/gas/prepare",
    formatGasPrice: "/api/gas/format",
    validateGasConfig: "/api/gas/validate",
  },

  // Request configuration
  request: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },

  // Error handling
  errors: {
    // Network errors
    NETWORK_ERROR: "Network connection error",
    TIMEOUT_ERROR: "Request timeout",
    SERVICE_UNAVAILABLE: "Blockchain service unavailable",

    // Blockchain errors
    TRANSACTION_FAILED: "Transaction failed",
    GAS_ESTIMATION_FAILED: "Gas estimation failed",
    INSUFFICIENT_FUNDS: "Insufficient funds",
    CONTRACT_ERROR: "Smart contract error",

    // Validation errors
    INVALID_ADDRESS: "Invalid address format",
    INVALID_AMOUNT: "Invalid amount",
    INVALID_PARAMETERS: "Invalid parameters",

    // Business logic errors
    TASK_NOT_FOUND: "Task not found",
    COMPANY_NOT_FOUND: "Company not found",
    STUDENT_NOT_FOUND: "Student not found",
    ALREADY_REGISTERED: "Already registered",
    NOT_AUTHORIZED: "Not authorized",
  },

  // Logging configuration
  logging: {
    enabled: process.env.BLOCKCHAIN_LOGGING !== "false",
    level: process.env.BLOCKCHAIN_LOG_LEVEL || "info",
    includeRequestData: process.env.BLOCKCHAIN_LOG_REQUESTS !== "false",
    includeResponseData: process.env.BLOCKCHAIN_LOG_RESPONSES !== "false",
  },

  // Cache configuration
  cache: {
    enabled: process.env.BLOCKCHAIN_CACHE !== "false",
    ttl: 300000, // 5 minutes
    maxSize: 1000, // Maximum cache entries
  },

  // Rate limiting
  rateLimit: {
    enabled: process.env.BLOCKCHAIN_RATE_LIMIT !== "false",
    maxRequests: 100, // Max requests per window
    windowMs: 60000, // 1 minute window
  },
};

export default config;
