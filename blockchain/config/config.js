const config = {
  port: process.env.BLOCKCHAIN_SERVICE_PORT || 5001,
  rpcUrl: process.env.SEPOLIA_URL || "https://sepolia.infura.io/v3/your-key",
  privateKey: process.env.PRIVATE_KEY,
  internalServiceKey: process.env.INTERNAL_SERVICE_KEY,
  mainBackendIPs: process.env.MAIN_BACKEND_IPS
    ? process.env.MAIN_BACKEND_IPS.split(",").map((ip) => ip.trim())
    : ["127.0.0.1"],
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataApiSecret: process.env.PINATA_API_SECRET,

  // Validation
  validate() {
    const required = [
      "rpcUrl",
      "privateKey",
      "internalServiceKey",
      "pinataApiKey",
      "pinataApiSecret",
    ];
    const missing = required.filter(
      (key) =>
        !this[key] || (Array.isArray(this[key]) && this[key].length === 0)
    );
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  },
};

config.validate();
module.exports = config;
