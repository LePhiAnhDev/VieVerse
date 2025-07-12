const { verificationContract } = require("./contractService");

// Validate contract is available
if (!verificationContract) {
    throw new Error("Verification contract not available");
}
const {
    retryCall,
    retryTransaction,
    retryTransactionWithGasOptimization,
} = require("../utils/retry");
const { validateAddress, validateString } = require("../utils/validation");
const {
    ValidationError,
    BlockchainError,
} = require("../middleware/errorHandler");
const GasUtils = require("../utils/gasUtils");

class CompanyService {
    async getCompany(address) {
        try {
            // Validate inputs
            const validatedAddress = validateAddress(address, "companyAddress");

            // Execute call with retry
            const company = await retryCall(() =>
                verificationContract.getCompany(validatedAddress)
            );

            return {
                success: true,
                company,
                address: validatedAddress,
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error: error.message, type: "validation" };
            }
            if (error.message.includes("Company not registered")) {
                return {
                    success: false,
                    error: "Company not found",
                    type: "not_found",
                };
            }
            return { success: false, error: error.message, type: "blockchain" };
        }
    }

    async registerCompany(name, description, address) {
        try {
            // Validate inputs
            const validatedAddress = validateAddress(address, "companyAddress");
            const validatedName = validateString(name, "companyName", 1, 100);
            const validatedDescription = validateString(
                description,
                "description",
                1,
                500
            );

            // Check if company is already registered
            try {
                const existingCompany = await retryCall(() =>
                    verificationContract.getCompany(validatedAddress)
                );

                // If we get here without error, company exists
                if (
                    existingCompany &&
                    existingCompany.name &&
                    existingCompany.name.length > 0
                ) {


                    return {
                        success: true,
                        alreadyRegistered: true,
                        companyData: {
                            name: existingCompany.name,
                            description: existingCompany.description,
                            isVerified: existingCompany.isVerified,
                            totalTasks: existingCompany.totalTasks.toString(),
                            completedTasks: existingCompany.completedTasks.toString(),
                            address: validatedAddress,
                        },
                        message: "Company already registered",
                    };
                }
            } catch (error) {

            }

            // Execute transaction with gas optimization and retry
            const result = await retryTransactionWithGasOptimization(
                verificationContract,
                "registerCompany",
                [validatedName, validatedDescription]
            );

            return {
                success: true,
                txHash: result.tx.hash,
                receipt: result.receipt,
                gasUsed: result.gasUsed,
                totalCost: result.totalCost,
                companyData: {
                    address: validatedAddress,
                    name: validatedName,
                    description: validatedDescription,
                },
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error: error.message, type: "validation" };
            }
            if (error.message.includes("Company already registered")) {
                return {
                    success: false,
                    error: "Company already registered",
                    type: "already_exists",
                };
            }
            if (error.message.includes("revert")) {
                return {
                    success: false,
                    error: "Company registration failed: " + error.message,
                    type: "contract",
                };
            }
            return { success: false, error: error.message, type: "blockchain" };
        }
    }

    async verifyCompany(companyAddress) {
        try {
            // Validate inputs
            const validatedAddress = validateAddress(
                companyAddress,
                "companyAddress"
            );

            // Execute transaction with gas optimization and retry
            const result = await retryTransactionWithGasOptimization(
                verificationContract,
                "verifyCompany",
                [validatedAddress]
            );

            return {
                success: true,
                txHash: result.tx.hash,
                receipt: result.receipt,
                gasUsed: result.gasUsed,
                totalCost: result.totalCost,
                companyAddress: validatedAddress,
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error: error.message, type: "validation" };
            }
            if (error.message.includes("Company not registered")) {
                return {
                    success: false,
                    error: "Company not found",
                    type: "not_found",
                };
            }
            if (error.message.includes("Not authorized")) {
                return {
                    success: false,
                    error: "Not authorized to verify company",
                    type: "auth",
                };
            }
            if (error.message.includes("revert")) {
                return {
                    success: false,
                    error: "Company verification failed: " + error.message,
                    type: "contract",
                };
            }
            return { success: false, error: error.message, type: "blockchain" };
        }
    }

    async getCompanyStats(address) {
        try {
            // Validate inputs
            const validatedAddress = validateAddress(address, "companyAddress");

            // Get company data
            const company = await retryCall(() =>
                verificationContract.getCompany(validatedAddress)
            );

            // Get company tasks
            const tasks = await retryCall(() =>
                verificationContract.getCompanyTasks(validatedAddress)
            );

            return {
                success: true,
                stats: {
                    address: validatedAddress,
                    name: company.name,
                    isVerified: company.isVerified,
                    totalTasks: company.totalTasks.toString(),
                    completedTasks: company.completedTasks.toString(),
                    totalRewardsDistributed: company.totalRewardsDistributed.toString(),
                    verificationCount: company.verificationCount.toString(),
                    lastVerificationAt: company.lastVerificationAt.toString(),
                    taskCount: tasks.length,
                },
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error: error.message, type: "validation" };
            }
            if (error.message.includes("Company not registered")) {
                return {
                    success: false,
                    error: "Company not found",
                    type: "not_found",
                };
            }
            return { success: false, error: error.message, type: "blockchain" };
        }
    }

    async isCompanyVerified(address) {
        try {
            // Validate inputs
            const validatedAddress = validateAddress(address, "companyAddress");

            // Execute call with retry
            const company = await retryCall(() =>
                verificationContract.getCompany(validatedAddress)
            );

            return {
                success: true,
                isVerified: company.isVerified,
                address: validatedAddress,
            };
        } catch (error) {
            if (error instanceof ValidationError) {
                return { success: false, error: error.message, type: "validation" };
            }
            if (error.message.includes("Company not registered")) {
                return {
                    success: false,
                    error: "Company not found",
                    type: "not_found",
                };
            }
            return { success: false, error: error.message, type: "blockchain" };
        }
    }
}

module.exports = new CompanyService();
