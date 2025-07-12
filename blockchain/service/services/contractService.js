const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const config = require("../../config/config.js");

// Load deployed contracts
const contractsPath = path.resolve(__dirname, "../../deployed-contracts.json");

const contracts = JSON.parse(fs.readFileSync(contractsPath));



// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const signer = new ethers.Wallet(config.privateKey, provider);

const verificationContract = new ethers.Contract(
    contracts.VieVerseTaskVerification.address,
    contracts.VieVerseTaskVerification.abi,
    signer
);

const tokenContract = new ethers.Contract(
    contracts.VieVerseToken.address,
    contracts.VieVerseToken.abi,
    signer
);

const utilityContract = new ethers.Contract(
    contracts.VieVerseTokenUtility.address,
    contracts.VieVerseTokenUtility.abi,
    signer
);





// Export contracts directly
module.exports = {
    verificationContract,
    tokenContract,
    utilityContract,
    provider,
    signer,
};
