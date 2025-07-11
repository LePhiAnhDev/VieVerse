export const internalAuth = (req, res, next) => {
  const internalKey = req.headers["x-internal-key"];
  const allowedIPs = [
    "127.0.0.1",
    "::1",
    ...(process.env.INTERNAL_SERVICE_IPS
      ? process.env.INTERNAL_SERVICE_IPS.split(",")
      : []),
  ];

  if (!internalKey || internalKey !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(401).json({ error: "Unauthorized internal access" });
  }

  let clientIP = req.ip || req.connection.remoteAddress;
  if (clientIP.startsWith("::ffff:"))
    clientIP = clientIP.replace("::ffff:", "");

  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({ error: "IP not allowed" });
  }

  next();
};
