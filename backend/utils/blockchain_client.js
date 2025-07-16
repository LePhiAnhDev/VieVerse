import axios from "axios";
import config from "../config/blockchain.js";

/**
 * Blockchain Client
 * Handles communication with VieVerse blockchain service
 */
class BlockchainClient {
  constructor() {
    this.baseURL = config.serviceUrl;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: config.request.timeout,
      headers: {
        ...config.request.headers,
        ...(config.internalAuthKey
          ? { "x-internal-key": config.internalAuthKey }
          : {}),
      },
    });

    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.shouldLog("request")) {
          console.log(
            `[Blockchain Client] ${config.method?.toUpperCase()} ${config.url}`,
            {
              data: config.data,
              params: config.params,
            }
          );
        }
        return config;
      },
      (error) => {
        console.error("[Blockchain Client] Request error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging and error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (this.shouldLog("response")) {
          console.log(`[Blockchain Client] Response ${response.status}:`, {
            url: response.config.url,
            data: response.data,
          });
        }
        return response;
      },
      (error) => {
        console.error("[Blockchain Client] Response error:", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Check if logging is enabled for specific type
   */
  shouldLog(type) {
    if (!config.logging.enabled) return false;

    if (type === "request" && !config.logging.includeRequestData) return false;
    if (type === "response" && !config.logging.includeResponseData)
      return false;

    return true;
  }

  /**
   * Handle and transform errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          return new Error(data.error || config.errors.INVALID_PARAMETERS);
        case 404:
          return new Error(data.error || config.errors.TASK_NOT_FOUND);
        case 500:
          return new Error(data.error || config.errors.TRANSACTION_FAILED);
        case 503:
          return new Error(config.errors.SERVICE_UNAVAILABLE);
        default:
          return new Error(data.error || `HTTP ${status}: ${error.message}`);
      }
    } else if (error.code === "ECONNABORTED") {
      return new Error(config.errors.TIMEOUT_ERROR);
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return new Error(config.errors.NETWORK_ERROR);
    } else {
      return new Error(error.message || config.errors.NETWORK_ERROR);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(method, endpoint, data = null, params = null) {
    let lastError;

    for (let attempt = 1; attempt <= config.request.retries; attempt++) {
      try {
        const response = await this.axiosInstance.request({
          method,
          url: endpoint,
          data,
          params,
        });

        return response.data;
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx)
        if (
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === config.request.retries) {
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, config.request.retryDelay * attempt)
        );
      }
    }

    throw lastError;
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check blockchain service health
   */
  async checkHealth() {
    return this.makeRequest("GET", config.endpoints.health);
  }

  // ==================== TASK OPERATIONS ====================

  /**
   * Create a new task
   */
  async createTask(title, description, reward, deadline) {
    return this.makeRequest("POST", config.endpoints.createTask, {
      title,
      description,
      reward,
      deadline,
    });
  }

  /**
   * Accept a task
   */
  async acceptTask(taskId) {
    return this.makeRequest("POST", config.endpoints.acceptTask, { taskId });
  }

  /**
   * Submit task work
   */
  async submitTask(taskId, submissionHash) {
    return this.makeRequest("POST", config.endpoints.submitTask, {
      taskId,
      submissionHash,
    });
  }

  /**
   * Verify task completion
   */
  async verifyTask(
    taskId,
    qualityScore,
    deadlineScore,
    attitudeScore,
    feedback
  ) {
    return this.makeRequest("POST", config.endpoints.verifyTask, {
      taskId,
      qualityScore,
      deadlineScore,
      attitudeScore,
      feedback,
    });
  }

  /**
   * Get task details
   */
  async getTask(taskId) {
    return this.makeRequest("GET", `${config.endpoints.getTask}/${taskId}`);
  }

  /**
   * Get company tasks
   */
  async getCompanyTasks(companyAddress) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getCompanyTasks}/${companyAddress}`
    );
  }

  /**
   * Get all company tasks with details
   */
  async getAllCompanyTasks(companyAddress) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getCompanyTasks}/${companyAddress}/all`
    );
  }

  /**
   * Get student tasks
   */
  async getStudentTasks(studentAddress) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentTasks}/${studentAddress}`
    );
  }

  // ==================== TOKEN OPERATIONS ====================

  /**
   * Get token balance
   */
  async getTokenBalance(address) {
    return this.makeRequest("GET", `${config.endpoints.getBalance}/${address}`);
  }

  /**
   * Mint tokens
   */
  async mintTokens(to, amount) {
    return this.makeRequest("POST", config.endpoints.mint, { to, amount });
  }

  /**
   * Burn tokens
   */
  async burnTokens(from, amount) {
    return this.makeRequest("POST", config.endpoints.burn, { from, amount });
  }

  /**
   * Get total token supply
   */
  async getTotalSupply() {
    return this.makeRequest("GET", config.endpoints.getTotalSupply);
  }

  /**
   * Get token information
   */
  async getTokenInfo() {
    return this.makeRequest("GET", config.endpoints.getTokenInfo);
  }

  // ==================== UTILITY OPERATIONS ====================

  /**
   * Enroll in a course
   */
  async enrollCourse(courseId, student) {
    return this.makeRequest("POST", config.endpoints.enrollCourse, {
      courseId,
      student,
    });
  }

  /**
   * Redeem a reward
   */
  async redeemReward(rewardId, student) {
    return this.makeRequest("POST", config.endpoints.redeemReward, {
      rewardId,
      student,
    });
  }

  /**
   * Join an event
   */
  async joinEvent(eventId, student) {
    return this.makeRequest("POST", config.endpoints.joinEvent, {
      eventId,
      student,
    });
  }

  /**
   * Purchase a certification
   */
  async purchaseCertification(certId, student) {
    return this.makeRequest("POST", config.endpoints.purchaseCertification, {
      certId,
      student,
    });
  }

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentEnrollments}/${address}`
    );
  }

  /**
   * Get student rewards
   */
  async getStudentRewards(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentRewards}/${address}`
    );
  }

  /**
   * Get student events
   */
  async getStudentEvents(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentEvents}/${address}`
    );
  }

  /**
   * Get student certifications
   */
  async getStudentCertifications(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentCertifications}/${address}`
    );
  }

  // ==================== COMPANY OPERATIONS ====================

  /**
   * Get company details
   */
  async getCompany(address) {
    return this.makeRequest("GET", `${config.endpoints.getCompany}/${address}`);
  }

  /**
   * Register a company on blockchain
   */
  async registerCompany(name, description, address) {
    return this.makeRequest("POST", config.endpoints.registerCompany, {
      name,
      description,
      address,
    });
  }

  /**
   * Verify a company
   */
  async verifyCompany(companyAddress) {
    return this.makeRequest("POST", config.endpoints.verifyCompany, {
      companyAddress,
    });
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getCompanyStats}/${address}`
    );
  }

  /**
   * Check if company is verified
   */
  async isCompanyVerified(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.isCompanyVerified}/${address}`
    );
  }

  // ==================== STUDENT OPERATIONS ====================

  /**
   * Get student details
   */
  async getStudent(address) {
    return this.makeRequest("GET", `${config.endpoints.getStudent}/${address}`);
  }

  /**
   * Register a student on blockchain
   */
  async registerStudent(name, skills, address) {
    return this.makeRequest("POST", config.endpoints.registerStudent, {
      name,
      skills,
      address,
    });
  }

  /**
   * Get student reputation
   */
  async getReputation(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getReputation}/${address}`
    );
  }

  /**
   * Get student statistics
   */
  async getStudentStats(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentStats}/${address}`
    );
  }

  /**
   * Get student activity
   */
  async getStudentActivity(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getStudentActivity}/${address}`
    );
  }

  /**
   * Check if student is registered
   */
  async isStudentRegistered(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.isStudentRegistered}/${address}`
    );
  }

  // ==================== IPFS OPERATIONS ====================

  /**
   * Upload file to IPFS
   */
  async uploadFile(file, options = {}) {
    const { default: FormData } = await import("form-data");
    const formData = new FormData();
    formData.append("file", file);
    if (options.name) formData.append("name", options.name);
    if (options.description)
      formData.append("description", options.description);

    // Use axiosInstance directly for multipart/form-data
    return this.axiosInstance
      .post(config.endpoints.uploadFile, formData, {
        headers: {
          ...formData.getHeaders(),
          ...(config.internalAuthKey
            ? { "x-internal-key": config.internalAuthKey }
            : {}),
        },
      })
      .then((response) => response.data);
  }

  /**
   * Upload JSON to IPFS
   */
  async uploadJSON(data, options = {}) {
    return this.makeRequest("POST", config.endpoints.uploadJSON, {
      data,
      ...options,
    });
  }

  /**
   * Get file from IPFS
   */
  async getFile(hash) {
    return this.makeRequest("GET", `${config.endpoints.getFile}/${hash}`);
  }

  /**
   * Get JSON from IPFS
   */
  async getJSON(hash) {
    return this.makeRequest("GET", `${config.endpoints.getJSON}/${hash}`);
  }

  /**
   * Pin file to IPFS
   */
  async pinFile(hash) {
    return this.makeRequest("POST", config.endpoints.pinFile, { hash });
  }

  /**
   * Unpin file from IPFS
   */
  async unpinFile(hash) {
    return this.makeRequest("POST", config.endpoints.unpinFile, { hash });
  }

  // ==================== REPUTATION OPERATIONS ====================

  /**
   * Get reputation score
   */
  async getReputationScore(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getReputationScore}/${address}`
    );
  }

  /**
   * Get reputation history
   */
  async getReputationHistory(address) {
    return this.makeRequest(
      "GET",
      `${config.endpoints.getReputationHistory}/${address}`
    );
  }

  /**
   * Get reputation ranking
   */
  async getReputationRanking(limit = 10) {
    return this.makeRequest(
      "GET",
      config.endpoints.getReputationRanking,
      null,
      { limit }
    );
  }

  // ==================== GAS OPERATIONS ====================

  /**
   * Get gas price analysis
   */
  async getGasAnalysis() {
    return this.makeRequest("GET", config.endpoints.getGasAnalysis);
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(contract, method, args = [], options = {}) {
    return this.makeRequest("POST", config.endpoints.estimateGas, {
      contract,
      method,
      args,
      options,
    });
  }

  /**
   * Get default gas limits
   */
  async getDefaultGasLimits() {
    return this.makeRequest("GET", config.endpoints.getDefaultGasLimits);
  }

  /**
   * Prepare transaction configuration
   */
  async prepareTransaction(contract, method, args = [], options = {}) {
    return this.makeRequest("POST", config.endpoints.prepareTransaction, {
      contract,
      method,
      args,
      options,
    });
  }

  /**
   * Format gas price
   */
  async formatGasPrice(gasPrice) {
    return this.makeRequest("POST", config.endpoints.formatGasPrice, {
      gasPrice,
    });
  }

  /**
   * Validate gas configuration
   */
  async validateGasConfig(configObj) {
    return this.makeRequest("POST", config.endpoints.validateGasConfig, {
      config: configObj,
    });
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Execute multiple operations in batch
   */
  async batchOperations(operations) {
    const results = [];
    const errors = [];

    for (const operation of operations) {
      try {
        const result = await this.makeRequest(
          operation.method,
          operation.endpoint,
          operation.data,
          operation.params
        );
        results.push({ success: true, data: result });
      } catch (error) {
        errors.push({ success: false, error: error.message, operation });
      }
    }

    return {
      results,
      errors,
      success: errors.length === 0,
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, maxAttempts = 30, interval = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // This would need to be implemented based on your blockchain service
        // For now, we'll just wait and return success
        await new Promise((resolve) => setTimeout(resolve, interval));

        // You could check transaction status here
        return { success: true, txHash, confirmed: true };
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Transaction confirmation timeout: ${txHash}`);
        }
      }
    }
  }

  /**
   * Get service status
   */
  async getServiceStatus() {
    try {
      const health = await this.checkHealth();
      return {
        status: "healthy",
        service: "blockchain",
        timestamp: new Date().toISOString(),
        details: health,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        service: "blockchain",
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}

export default BlockchainClient;
