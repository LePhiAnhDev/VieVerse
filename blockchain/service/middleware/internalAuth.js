const config = require("../../config/config");

const internalAuth = (req, res, next) => {
  const internalKey = req.headers["x-internal-key"];
  const allowedIPs = config.mainBackendIPs;

  if (!internalKey || internalKey !== config.internalServiceKey) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized internal access",
    });
  }

  let clientIP = req.ip || req.connection.remoteAddress;
  if (clientIP.startsWith("::ffff:"))
    clientIP = clientIP.replace("::ffff:", "");

  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      error: "IP not allowed",
    });
  }

  next();
};

module.exports = internalAuth;
