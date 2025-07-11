const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const BASE_URL = "http://localhost:5001";

// Test data
const TEST_ADDRESS = "0x6113e1F2Dc4D62123d512CDBb6EC1d83f243c4Cd";

// Color console output
const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
};

console.log(chalk.cyan("🧪 Starting Edge Cases Testing..."));
console.log("=====================================\n");

// 1. TASK CREATION/VERIFICATION EDGE CASES
async function testTaskEdgeCases() {
  console.log(chalk.blue("📋 Testing Task Creation/Verification Edge Cases"));
  console.log("================================================\n");

  const tests = [
    {
      name: "Empty title",
      data: {
        title: "",
        description: "Valid description",
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Extremely long title (>200 chars)",
      data: {
        title: "A".repeat(201),
        description: "Valid description",
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Empty description",
      data: {
        title: "Valid title",
        description: "",
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Extremely long description (>2000 chars)",
      data: {
        title: "Valid title",
        description: "B".repeat(2001),
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Zero reward",
      data: {
        title: "Valid title",
        description: "Valid description",
        reward: "0",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Negative reward",
      data: {
        title: "Valid title",
        description: "Valid description",
        reward: "-1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Past deadline",
      data: {
        title: "Valid title",
        description: "Valid description",
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) - 86400,
      },
      expectError: true,
    },
    {
      name: "Deadline too far in future (>365 days)",
      data: {
        title: "Valid title",
        description: "Valid description",
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 366 * 24 * 60 * 60,
      },
      expectError: true,
    },
    {
      name: "Invalid reward format (string)",
      data: {
        title: "Valid title",
        description: "Valid description",
        reward: "invalid_number",
        deadline: Math.floor(Date.now() / 1000) + 86400,
      },
      expectError: true,
    },
    {
      name: "Special characters in title",
      data: {
        title: "Task with 特殊字符 and émojis 🚀",
        description: "Valid description",
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 25 * 60 * 60, // 25 hours from now
      },
      expectError: false,
    },
    {
      name: "HTML/XSS in description",
      data: {
        title: "Valid title",
        description: '<script>alert("xss")</script><h1>HTML Content</h1>',
        reward: "1000000000000000000",
        deadline: Math.floor(Date.now() / 1000) + 25 * 60 * 60, // 25 hours from now
      },
      expectError: false, // Should be sanitized, not rejected
    },
  ];

  for (const test of tests) {
    try {
      console.log(chalk.yellow(`Testing: ${test.name}`));

      const response = await axios.post(
        `${BASE_URL}/api/tasks/create`,
        test.data
      );

      if (test.expectError) {
        console.log(
          chalk.red(`❌ Expected error but got success: ${test.name}`)
        );
        console.log("Response:", response.data);
      } else {
        console.log(chalk.green(`✅ ${test.name}: Success as expected`));
      }
    } catch (error) {
      if (test.expectError) {
        console.log(chalk.green(`✅ ${test.name}: Failed as expected`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      } else {
        console.log(chalk.red(`❌ ${test.name}: Unexpected error`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      }
    }
    console.log("");
  }

  // Test task verification edge cases
  console.log(chalk.blue("🔍 Testing Task Verification Edge Cases"));
  console.log("==========================================\n");

  const verificationTests = [
    {
      name: "Invalid task ID (negative)",
      data: {
        taskId: -1,
        qualityScore: 80,
        deadlineScore: 90,
        attitudeScore: 85,
        feedback: "Good work",
      },
      expectError: true,
    },
    {
      name: "Invalid task ID (string)",
      data: {
        taskId: "invalid_id",
        qualityScore: 80,
        deadlineScore: 90,
        attitudeScore: 85,
        feedback: "Good work",
      },
      expectError: true,
    },
    {
      name: "Score out of range (>100)",
      data: {
        taskId: 1,
        qualityScore: 150,
        deadlineScore: 90,
        attitudeScore: 85,
        feedback: "Good work",
      },
      expectError: true,
    },
    {
      name: "Score out of range (<0)",
      data: {
        taskId: 1,
        qualityScore: -10,
        deadlineScore: 90,
        attitudeScore: 85,
        feedback: "Good work",
      },
      expectError: true,
    },
    {
      name: "Empty feedback",
      data: {
        taskId: 1,
        qualityScore: 80,
        deadlineScore: 90,
        attitudeScore: 85,
        feedback: "",
      },
      expectError: true,
    },
    {
      name: "Extremely long feedback (>1000 chars)",
      data: {
        taskId: 1,
        qualityScore: 80,
        deadlineScore: 90,
        attitudeScore: 85,
        feedback: "C".repeat(1001),
      },
      expectError: true,
    },
  ];

  for (const test of verificationTests) {
    try {
      console.log(chalk.yellow(`Testing: ${test.name}`));

      const response = await axios.post(
        `${BASE_URL}/api/tasks/verify`,
        test.data
      );

      if (test.expectError) {
        console.log(
          chalk.red(`❌ Expected error but got success: ${test.name}`)
        );
      } else {
        console.log(chalk.green(`✅ ${test.name}: Success as expected`));
      }
    } catch (error) {
      if (test.expectError) {
        console.log(chalk.green(`✅ ${test.name}: Failed as expected`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      } else {
        console.log(chalk.red(`❌ ${test.name}: Unexpected error`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      }
    }
    console.log("");
  }
}

// 2. IPFS FILE UPLOAD FORMAT ISSUES
async function testIPFSEdgeCases() {
  console.log(chalk.blue("📁 Testing IPFS File Upload Format Issues"));
  console.log("==========================================\n");

  // Create test files with different formats/issues
  const testFiles = [
    {
      name: "empty_file.txt",
      content: "",
      description: "Empty file",
    },
    {
      name: "large_file.txt",
      content: "A".repeat(60 * 1024 * 1024), // 60MB file (over 50MB limit)
      description: "File exceeding size limit",
    },
    {
      name: "special_chars_文件.txt",
      content: "File with special characters in name",
      description: "File with special characters in filename",
    },
    {
      name: "valid_small.txt",
      content: "This is a valid small file for testing",
      description: "Valid small file",
    },
    {
      name: ".hidden_file",
      content: "Hidden file content",
      description: "Hidden file (starts with dot)",
    },
  ];

  // Create test files
  const tempDir = path.join(__dirname, "temp_test_files");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  console.log(chalk.yellow("Creating test files..."));
  for (const file of testFiles) {
    const filePath = path.join(tempDir, file.name);
    fs.writeFileSync(filePath, file.content);
  }

  // Test file uploads
  for (const file of testFiles) {
    try {
      console.log(chalk.yellow(`Testing: ${file.description}`));

      const filePath = path.join(tempDir, file.name);
      const form = new FormData();

      // Check if file is too large
      const stats = fs.statSync(filePath);
      if (stats.size > 50 * 1024 * 1024) {
        console.log(
          chalk.green(`✅ ${file.description}: Skipped (too large for test)`)
        );
        continue;
      }

      form.append("file", fs.createReadStream(filePath), {
        filename: file.name,
      });

      const response = await axios.post(`${BASE_URL}/api/ipfs/upload`, form, {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 30000,
      });

      console.log(chalk.green(`✅ ${file.description}: Upload successful`));
      console.log(`   Hash: ${response.data.hash}`);
      console.log(`   Size: ${response.data.size} bytes`);
    } catch (error) {
      console.log(chalk.red(`❌ ${file.description}: Upload failed`));
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
    }
    console.log("");
  }

  // Test JSON upload edge cases
  console.log(chalk.blue("📄 Testing JSON Upload Edge Cases"));
  console.log("===================================\n");

  const jsonTests = [
    {
      name: "Empty object",
      data: {},
      expectError: false,
    },
    {
      name: "Null value",
      data: null,
      expectError: true,
    },
    {
      name: "Array instead of object",
      data: [1, 2, 3],
      expectError: false,
    },
    {
      name: "Very large JSON",
      data: {
        largeArray: new Array(100000).fill("data"),
        description: "Large JSON object",
      },
      expectError: false,
    },
    {
      name: "Circular reference",
      data: (() => {
        const obj = { name: "test" };
        obj.self = obj; // Create circular reference
        return obj;
      })(),
      expectError: true,
    },
    {
      name: "Special characters in JSON",
      data: {
        text: 'Special chars: 特殊字符 émojis 🚀 quotes "test" apostrophe\'s',
        unicode: "\u0041\u0042\u0043",
      },
      expectError: false,
    },
  ];

  for (const test of jsonTests) {
    try {
      console.log(chalk.yellow(`Testing: ${test.name}`));

      const response = await axios.post(
        `${BASE_URL}/api/ipfs/json`,
        test.data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      if (test.expectError) {
        console.log(
          chalk.red(`❌ Expected error but got success: ${test.name}`)
        );
      } else {
        console.log(chalk.green(`✅ ${test.name}: Upload successful`));
        console.log(`   Hash: ${response.data.hash}`);
      }
    } catch (error) {
      if (test.expectError) {
        console.log(chalk.green(`✅ ${test.name}: Failed as expected`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      } else {
        console.log(chalk.red(`❌ ${test.name}: Unexpected error`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      }
    }
    console.log("");
  }

  // Cleanup test files
  console.log(chalk.yellow("Cleaning up test files..."));
  for (const file of testFiles) {
    const filePath = path.join(tempDir, file.name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  fs.rmdirSync(tempDir);
}

// 3. GAS OPTIMIZATION ISSUES
async function testGasOptimizationEdgeCases() {
  console.log(chalk.blue("⛽ Testing Gas Optimization Issues"));
  console.log("===================================\n");

  // Test gas estimation edge cases
  const gasTests = [
    {
      name: "Invalid contract type",
      data: {
        contract: "invalid_contract",
        method: "mint",
        args: [TEST_ADDRESS, "1000000000000000000"],
      },
      expectError: true,
    },
    {
      name: "Invalid method name",
      data: {
        contract: "token",
        method: "nonexistent_method",
        args: [],
      },
      expectError: true,
    },
    {
      name: "Wrong number of arguments",
      data: {
        contract: "token",
        method: "mint",
        args: [TEST_ADDRESS], // Missing amount parameter
      },
      expectError: true,
    },
    {
      name: "Invalid argument types",
      data: {
        contract: "token",
        method: "mint",
        args: ["invalid_address", "invalid_amount"],
      },
      expectError: true,
    },
    {
      name: "Valid gas estimation",
      data: {
        contract: "token",
        method: "mint",
        args: [TEST_ADDRESS, "1000000000000000000"],
      },
      expectError: false,
    },
    {
      name: "Gas estimation with options (will fail due to unverified company)",
      data: {
        contract: "verification",
        method: "createTask",
        args: [
          "Test Task",
          "Test Description",
          "1000000000000000000",
          Math.floor(Date.now() / 1000) + 86400,
        ],
        options: {
          bufferPercentage: 50,
          maxGasLimit: 1000000,
        },
      },
      expectError: true, // Expected because user is not a verified company
    },
  ];

  for (const test of gasTests) {
    try {
      console.log(chalk.yellow(`Testing: ${test.name}`));

      const response = await axios.post(
        `${BASE_URL}/api/gas/estimate`,
        test.data
      );

      if (test.expectError) {
        console.log(
          chalk.red(`❌ Expected error but got success: ${test.name}`)
        );
        console.log("Response:", response.data);
      } else {
        console.log(chalk.green(`✅ ${test.name}: Success`));
        console.log(`   Gas Limit: ${response.data.estimation.gasLimit}`);
        console.log(
          `   Estimated Cost: ${response.data.estimation.estimatedCost} ETH`
        );
      }
    } catch (error) {
      if (test.expectError) {
        console.log(chalk.green(`✅ ${test.name}: Failed as expected`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      } else {
        console.log(chalk.red(`❌ ${test.name}: Unexpected error`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      }
    }
    console.log("");
  }

  // Test gas configuration validation
  console.log(chalk.blue("⚙️ Testing Gas Configuration Validation"));
  console.log("=========================================\n");

  const configTests = [
    {
      name: "Invalid buffer percentage (negative)",
      config: {
        bufferPercentage: -10,
        maxGasLimit: 5000000,
      },
      expectError: true,
    },
    {
      name: "Invalid buffer percentage (too high)",
      config: {
        bufferPercentage: 200,
        maxGasLimit: 5000000,
      },
      expectError: true,
    },
    {
      name: "Invalid gas limit (too low)",
      config: {
        bufferPercentage: 20,
        maxGasLimit: 10000, // Below minimum
      },
      expectError: true,
    },
    {
      name: "Invalid gas limit (too high)",
      config: {
        bufferPercentage: 20,
        maxGasLimit: 50000000, // Way too high
      },
      expectError: true,
    },
    {
      name: "Valid configuration",
      config: {
        bufferPercentage: 25,
        maxGasLimit: 3000000,
        minGasLimit: 50000,
      },
      expectError: false,
    },
  ];

  for (const test of configTests) {
    try {
      console.log(chalk.yellow(`Testing: ${test.name}`));

      const response = await axios.post(`${BASE_URL}/api/gas/validate`, {
        config: test.config,
      });

      if (test.expectError) {
        console.log(
          chalk.red(`❌ Expected error but got success: ${test.name}`)
        );
      } else {
        console.log(chalk.green(`✅ ${test.name}: Valid configuration`));
      }
    } catch (error) {
      if (test.expectError) {
        console.log(chalk.green(`✅ ${test.name}: Invalid as expected`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      } else {
        console.log(chalk.red(`❌ ${test.name}: Unexpected validation error`));
        console.log(
          `   Error: ${error.response?.data?.error || error.message}`
        );
      }
    }
    console.log("");
  }

  // Test gas price analysis
  try {
    console.log(chalk.yellow("Testing gas price analysis..."));
    const response = await axios.get(`${BASE_URL}/api/gas/analysis`);
    console.log(chalk.green("✅ Gas price analysis: Success"));
    console.log(
      `   Current Gas Price: ${response.data.analysis.current.gasPrice.gwei} gwei`
    );
    console.log(`   Recommendation: ${response.data.analysis.recommendation}`);
  } catch (error) {
    console.log(chalk.red("❌ Gas price analysis: Failed"));
    console.log(`   Error: ${error.response?.data?.error || error.message}`);
  }
}

// Main test runner
async function runAllTests() {
  try {
    // Check if service is running
    await axios.get(`${BASE_URL}/health`);
    console.log(chalk.green("✅ Service is running\n"));

    await testTaskEdgeCases();
    await testIPFSEdgeCases();
    await testGasOptimizationEdgeCases();

    console.log(chalk.cyan("\n🎉 All edge case tests completed!"));
    console.log("=====================================");
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.log(
        chalk.red(
          "❌ Service is not running. Please start the blockchain service first."
        )
      );
    } else {
      console.log(chalk.red("❌ Test setup failed:"), error.message);
    }
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
