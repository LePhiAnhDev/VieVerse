const axios = require("axios");

async function testTaskVerify() {
  try {
    const response = await axios.post("http://localhost:5001/api/task/verify", {
      taskId: 1,
      qualityScore: 90,
      deadlineScore: 95,
      attitudeScore: 100,
      feedback: "Làm rất tốt!",
    });
    console.log("Test thành công:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Test thất bại:", error.response.data);
    } else {
      console.error("Lỗi:", error.message);
    }
  }
}

testTaskVerify();
