import axios from 'axios';

// Configure blockchain service
const blockchainAPI = axios.create({
    baseURL: 'http://localhost:5001/api',
    timeout: 30000, // 30 seconds timeout for blockchain operations
});



// Task Operations
export const taskService = {
    // Create task on blockchain
    createTask: async (taskData) => {
        try {
            const response = await blockchainAPI.post('/tasks/create', {
                title: taskData.title,
                description: taskData.description,
                reward: taskData.reward, // Should be in Wei format
                deadline: taskData.deadline // Unix timestamp
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to create task on blockchain');
        }
    },

    // Accept task
    acceptTask: async (taskId) => {
        try {
            const response = await blockchainAPI.post('/tasks/accept', { taskId });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to accept task');
        }
    },

    // Submit task
    submitTask: async (taskId, submissionHash) => {
        try {
            const response = await blockchainAPI.post('/tasks/submit', {
                taskId,
                submissionHash
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to submit task');
        }
    },

    // Verify task (moderator only)
    verifyTask: async (taskId, qualityScore, deadlineScore, attitudeScore, feedback) => {
        try {
            const response = await blockchainAPI.post('/tasks/verify', {
                taskId,
                qualityScore,
                deadlineScore,
                attitudeScore,
                feedback
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to verify task');
        }
    },

    // Get task details
    getTask: async (taskId) => {
        try {
            const response = await blockchainAPI.get(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get task');
        }
    },

    // Get company tasks
    getCompanyTasks: async (address) => {
        try {
            const response = await blockchainAPI.get(`/tasks/company/${address}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get company tasks');
        }
    },

    // Get student tasks
    getStudentTasks: async (address) => {
        try {
            const response = await blockchainAPI.get(`/tasks/student/${address}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get student tasks');
        }
    }
};

// Token Operations
export const tokenService = {
    // Get token balance
    getBalance: async (address) => {
        try {
            const response = await blockchainAPI.get(`/tokens/balance/${address}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get token balance');
        }
    },

    // Mint tokens (owner only)
    mintTokens: async (to, amount) => {
        try {
            const response = await blockchainAPI.post('/tokens/mint', {
                to,
                amount
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to mint tokens');
        }
    },

    // Burn tokens
    burnTokens: async (from, amount) => {
        try {
            const response = await blockchainAPI.post('/tokens/burn', {
                from,
                amount
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to burn tokens');
        }
    },

    // Get total supply
    getSupply: async () => {
        try {
            const response = await blockchainAPI.get('/tokens/supply');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get token supply');
        }
    },

    // Get token info
    getInfo: async () => {
        try {
            const response = await blockchainAPI.get('/tokens/info');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get token info');
        }
    }
};

// Company Operations
export const companyService = {
    // Get company info
    getCompany: async (address) => {
        try {
            const response = await blockchainAPI.get(`/company/${address}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get company info');
        }
    },

    // Register company on blockchain
    registerCompany: async (name, description, address) => {
        try {
            const response = await blockchainAPI.post('/company/register', {
                name,
                description,
                address
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to register company');
        }
    }
};

// Student Operations
export const studentService = {
    // Get student info
    getStudent: async (address) => {
        try {
            const response = await blockchainAPI.get(`/student/${address}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get student info');
        }
    },

    // Register student on blockchain
    registerStudent: async (name, skills, address) => {
        try {
            const response = await blockchainAPI.post('/student/register', {
                name,
                skills,
                address
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to register student');
        }
    },

    // Get student reputation
    getReputation: async (address) => {
        try {
            const response = await blockchainAPI.get(`/student/reputation/${address}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get student reputation');
        }
    }
};

// IPFS Operations
export const ipfsService = {
    // Upload file to IPFS
    uploadFile: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await blockchainAPI.post('/ipfs/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to upload file to IPFS');
        }
    },

    // Upload JSON to IPFS
    uploadJSON: async (data, metadata = {}) => {
        try {
            const response = await blockchainAPI.post('/ipfs/upload-json', {
                data,
                metadata
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to upload JSON to IPFS');
        }
    },

    // Get file from IPFS
    getFile: async (hash) => {
        try {
            const response = await blockchainAPI.get(`/ipfs/${hash}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get file from IPFS');
        }
    }
};

// Gas Operations
export const gasService = {
    // Get gas analysis
    getAnalysis: async () => {
        try {
            const response = await blockchainAPI.get('/gas/analysis');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get gas analysis');
        }
    },

    // Estimate gas for transaction
    estimateGas: async (contract, method, args, options = {}) => {
        try {
            const response = await blockchainAPI.post('/gas/estimate', {
                contract,
                method,
                args,
                options
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to estimate gas');
        }
    },

    // Get default gas limits
    getDefaults: async () => {
        try {
            const response = await blockchainAPI.get('/gas/defaults');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get gas defaults');
        }
    }
};

// Utility Operations
export const utilityService = {
    // Enroll in course
    enrollCourse: async (courseId, student) => {
        try {
            const response = await blockchainAPI.post('/utility/course/enroll', {
                courseId,
                student
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to enroll in course');
        }
    },

    // Redeem reward
    redeemReward: async (rewardId, student) => {
        try {
            const response = await blockchainAPI.post('/utility/reward/redeem', {
                rewardId,
                student
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to redeem reward');
        }
    },

    // Get student enrollments
    getEnrollments: async (address) => {
        try {
            const response = await blockchainAPI.get(`/utility/student/${address}/enrollments`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get enrollments');
        }
    }
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await blockchainAPI.get('/health');
        return response.data;
    } catch (error) {
        throw new Error('Blockchain service is not available');
    }
};

export default {
    taskService,
    tokenService,
    companyService,
    studentService,
    ipfsService,
    gasService,
    utilityService,
    healthCheck
}; 