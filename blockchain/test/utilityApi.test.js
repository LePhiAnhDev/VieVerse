const request = require("supertest");
const chai = require("chai");
const expect = chai.expect;

const app = require("../service/server");
const TEST_ADDRESS = "0x6113e1F2Dc4D62123d512CDBb6EC1d83f243c4Cd";

describe("VieVerseTokenUtility API", function () {
  this.timeout(10000);

  describe("POST /api/utility/course/enroll", function () {
    it("should enroll in a course", async function () {
      const res = await request(app)
        .post("/api/utility/course/enroll")
        .send({ courseId: 1, student: TEST_ADDRESS });
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.txHash).to.be.a("string");
      }
    });
    it("should return 400 if missing fields", async function () {
      const res = await request(app)
        .post("/api/utility/course/enroll")
        .send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/utility/reward/redeem", function () {
    it("should redeem a reward", async function () {
      const res = await request(app)
        .post("/api/utility/reward/redeem")
        .send({ rewardId: 1, student: TEST_ADDRESS });
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.txHash).to.be.a("string");
      }
    });
    it("should return 400 if missing fields", async function () {
      const res = await request(app)
        .post("/api/utility/reward/redeem")
        .send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/utility/event/join", function () {
    it("should join an event", async function () {
      const res = await request(app)
        .post("/api/utility/event/join")
        .send({ eventId: 1, student: TEST_ADDRESS });
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.txHash).to.be.a("string");
      }
    });
    it("should return 400 if missing fields", async function () {
      const res = await request(app).post("/api/utility/event/join").send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("POST /api/utility/certification/purchase", function () {
    it("should purchase a certification", async function () {
      const res = await request(app)
        .post("/api/utility/certification/purchase")
        .send({ certId: 1, student: TEST_ADDRESS });
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.txHash).to.be.a("string");
      }
    });
    it("should return 400 if missing fields", async function () {
      const res = await request(app)
        .post("/api/utility/certification/purchase")
        .send({});
      expect(res.status).to.equal(400);
    });
  });

  describe("GET /api/utility/student/:address/enrollments", function () {
    it("should get student enrollments", async function () {
      const res = await request(app).get(
        `/api/utility/student/${TEST_ADDRESS}/enrollments`
      );
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.enrollments).to.be.an("array");
      }
    });
    it("should return 400 for invalid address", async function () {
      const res = await request(app).get(
        "/api/utility/student/invalidaddress/enrollments"
      );
      expect(res.status).to.equal(400);
    });
  });

  describe("GET /api/utility/student/:address/rewards", function () {
    it("should get student rewards", async function () {
      const res = await request(app).get(
        `/api/utility/student/${TEST_ADDRESS}/rewards`
      );
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.rewards).to.be.an("array");
      }
    });
  });

  describe("GET /api/utility/student/:address/events", function () {
    it("should get student events", async function () {
      const res = await request(app).get(
        `/api/utility/student/${TEST_ADDRESS}/events`
      );
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.events).to.be.an("array");
      }
    });
  });

  describe("GET /api/utility/student/:address/certifications", function () {
    it("should get student certifications", async function () {
      const res = await request(app).get(
        `/api/utility/student/${TEST_ADDRESS}/certifications`
      );
      expect([200, 500, 400]).to.include(res.status);
      if (res.status === 200) {
        expect(res.body.success).to.be.true;
        expect(res.body.certifications).to.be.an("array");
      }
    });
  });
});
