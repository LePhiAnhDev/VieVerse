const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(
    chalk.cyan(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Body:`
    ),
    req.body
  );
  const oldJson = res.json;
  res.json = function (data) {
    if (data && data.error) {
      console.log(chalk.red(`[${new Date().toISOString()}] Response:`, data));
    } else if (data && data.success === false) {
      console.log(
        chalk.yellow(`[${new Date().toISOString()}] Response:`, data)
      );
    } else {
      console.log(chalk.green(`[${new Date().toISOString()}] Response:`, data));
    }
    return oldJson.call(this, data);
  };
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Blockchain service is running" });
});

const taskRoutes = require("./routes/task");
app.use("/api/task", taskRoutes);

const reputationRoutes = require("./routes/reputation");
app.use("/api/reputation", reputationRoutes);

const studentRoutes = require("./routes/student");
app.use("/api/student", studentRoutes);

const companyRoutes = require("./routes/company");
app.use("/api/company", companyRoutes);

const ipfsRoutes = require("./routes/ipfs");
app.use("/api/ipfs", ipfsRoutes);

const tokenRoutes = require("./routes/token");
app.use("/api/token", tokenRoutes);

const utilityRoutes = require("./routes/utility");
app.use("/api/utility", utilityRoutes);

// TODO: Import and use routes here

const PORT = process.env.BLOCKCHAIN_SERVICE_PORT || 5001;

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(chalk.green(`Blockchain service running on port ${PORT}`));
  });
}

// Export app for testing
module.exports = app;
