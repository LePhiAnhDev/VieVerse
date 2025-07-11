const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const config = require("../config/config");
const { errorHandler } = require("./middleware/errorHandler");
const { processResponseData } = require("./utils/bigIntUtils");

const app = express();

// Middleware
app.use(cors());

// Conditional body parsing - only for POST/PUT/PATCH requests
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    express.json({ limit: "10mb" })(req, res, next);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    express.urlencoded({ extended: true, limit: "10mb" })(req, res, next);
  } else {
    next();
  }
});

// Logging middleware
app.use((req, res, next) => {
  console.log(
    chalk.cyan(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  );

  // Only log body if it exists and is not empty
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(chalk.cyan("Body:"), req.body);
  }

  const oldJson = res.json;
  res.json = function (data) {
    if (data && typeof data === "object") {
      // Process BigInt/BigNumber before sending
      const processedData = processResponseData(data);
      console.log(chalk.green("Response:"), processedData);
      return oldJson.call(this, processedData);
    }
    console.log(chalk.green("Response:"), data);
    return oldJson.call(this, data);
  };

  next();
});

// Routes (both singular and plural for compatibility)
app.use("/api/task", require("./routes/task"));
app.use("/api/tasks", require("./routes/task")); // Alias for tests
app.use("/api/token", require("./routes/token"));
app.use("/api/tokens", require("./routes/token")); // Alias for tests
app.use("/api/utility", require("./routes/utility"));
app.use("/api/company", require("./routes/company"));
app.use("/api/student", require("./routes/student"));
app.use("/api/reputation", require("./routes/reputation"));
app.use("/api/ipfs", require("./routes/ipfs"));
app.use("/api/gas", require("./routes/gas"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = config.port || 5001;

app.listen(PORT, () => {
  console.log(chalk.green(`🚀 Blockchain service running on port ${PORT}`));
  console.log(chalk.blue(`📊 Health check: http://localhost:${PORT}/health`));
});
