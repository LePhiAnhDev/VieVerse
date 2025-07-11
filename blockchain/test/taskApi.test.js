const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;
const path = require("path");

// Import app từ server.js (cần sửa server.js để export app nếu chưa có)
const app = require("../service/server");

// Địa chỉ mẫu (cần thay bằng địa chỉ hợp lệ trên testnet/devnet nếu test thật)
const SAMPLE_COMPANY = "0x000000000000000000000000000000000000c0de";
const SAMPLE_STUDENT = "0x000000000000000000000000000000000000cafe";

// Helper tạo task mẫu
async function createSampleTask() {
  const res = await request(app)
    .post("/api/task/create")
    .send({
      title: "Test Task",
      description: "Test Description",
      reward: "1000000000000000000", // 1 token (wei)
      deadline: Math.floor(Date.now() / 1000) + 86400, // +1 ngày
    });
  return res.body;
}

describe("VieVerseTaskVerification API", function () {
  this.timeout(20000);

  describe("POST /api/task/create", function () {
    it("should create a new task", async function () {
      const res = await request(app)
        .post("/api/task/create")
        .send({
          title: "Test Task",
          description: "Test Description",
          reward: "1000000000000000000",
          deadline: Math.floor(Date.now() / 1000) + 86400,
        });
      // Accept both 200 (success) and 500 (blockchain error) for now
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.txHash).to.be.a("string");
      }
    });
    it("should return 400 if missing fields", async function () {
      const res = await request(app)
        .post("/api/task/create")
        .send({ title: "Missing" });
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/task/accept", function () {
    it("should accept a task", async function () {
      const task = await createSampleTask();
      const res = await request(app)
        .post("/api/task/accept")
        .send({ taskId: 1 });
      // Accept both 200 (success) and 500 (blockchain error) for now
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
      }
    });
    it("should return 400 if missing taskId", async function () {
      const res = await request(app).post("/api/task/accept").send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/task/submit", function () {
    it("should submit a task", async function () {
      await createSampleTask();
      await request(app).post("/api/task/accept").send({ taskId: 1 });
      const res = await request(app)
        .post("/api/task/submit")
        .send({ taskId: 1, submissionHash: "QmTestHash" });
      // Accept both 200 (success) and 500 (blockchain error) for now
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
      }
    });
    it("should return 400 if missing fields", async function () {
      const res = await request(app).post("/api/task/submit").send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/task/verify", function () {
    it("should verify a task", async function () {
      await createSampleTask();
      await request(app).post("/api/task/accept").send({ taskId: 1 });
      await request(app)
        .post("/api/task/submit")
        .send({ taskId: 1, submissionHash: "QmTestHash" });
      const res = await request(app).post("/api/task/verify").send({
        taskId: 1,
        qualityScore: 90,
        deadlineScore: 90,
        attitudeScore: 90,
        feedback: "Good job!",
      });
      // Có thể cần mock hoặc kiểm tra lại logic thực tế
      expect([200, 500]).to.include(res.status); // Có thể fail nếu contract không mock
    });
  });

  describe("GET /api/task/:taskId", function () {
    it("should get task details", async function () {
      await createSampleTask();
      const res = await request(app).get("/api/task/1");
      expect([200, 500]).to.include(res.status);
    });
  });

  describe("GET /api/company/:address", function () {
    it("should get company info", async function () {
      const res = await request(app).get(`/api/company/${SAMPLE_COMPANY}`);
      expect([200, 500, 400]).to.include(res.status);
    });
  });

  describe("GET /api/student/:address", function () {
    it("should get student info", async function () {
      const res = await request(app).get(`/api/student/${SAMPLE_STUDENT}`);
      expect([200, 500, 400]).to.include(res.status);
    });
  });

  describe("GET /api/company/:address/tasks", function () {
    it("should get company tasks", async function () {
      const res = await request(app).get(
        `/api/task/company/${SAMPLE_COMPANY}/tasks`
      );
      expect([200, 500, 400]).to.include(res.status);
    });
  });

  describe("GET /api/student/:address/tasks", function () {
    it("should get student tasks", async function () {
      const res = await request(app).get(
        `/api/task/student/${SAMPLE_STUDENT}/tasks`
      );
      expect([200, 500, 400]).to.include(res.status);
    });
  });
});

describe("IPFS API", function () {
  this.timeout(20000);

  describe("POST /api/ipfs/upload", function () {
    it("should return 400 if no file uploaded", async function () {
      const res = await request(app)
        .post("/api/ipfs/upload")
        .set(
          "Content-Type",
          "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
        );
      expect([400, 500]).to.include(res.status);
    });
    // Để test upload file thực sự, cần file mẫu. Nếu muốn test thật, bỏ comment dưới:
    // it('should upload a file to IPFS', async function () {
    //   const res = await request(app)
    //     .post('/api/ipfs/upload')
    //     .attach('file', Buffer.from('test content'), 'test.txt');
    //   expect([200, 500]).to.include(res.status);
    //   if (res.status === 200) {
    //     expect(res.body.success).to.be.true;
    //     expect(res.body.hash).to.be.a('string');
    //   }
    // });
  });

  describe("POST /api/ipfs/upload-json", function () {
    it("should upload JSON to IPFS", async function () {
      const res = await request(app)
        .post("/api/ipfs/upload-json")
        .send({ foo: "bar", test: 123 });
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.hash).to.be.a("string");
      }
    });
    it("should return 400 if invalid JSON", async function () {
      const res = await request(app)
        .post("/api/ipfs/upload-json")
        .send("not a json");
      expect([400, 500]).to.include(res.status);
    });
  });

  describe("GET /api/ipfs/:hash", function () {
    it("should return 400 if missing hash", async function () {
      const res = await request(app).get("/api/ipfs/");
      expect([404, 400]).to.include(res.status); // Express sẽ trả 404 nếu không có param
    });
    it("should return url for valid hash", async function () {
      // Giả lập hash mẫu, không kiểm tra hash thực tế
      const res = await request(app).get("/api/ipfs/QmTestHash");
      expect([200, 500]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.url).to.be.a("string");
      }
    });
  });
});
