const express = require("express");
const router = express.Router();
const utilityController = require("../controllers/utilityController");

// Action endpoints
router.post("/course/enroll", utilityController.enrollCourse);
router.post("/reward/redeem", utilityController.redeemReward);
router.post("/event/join", utilityController.joinEvent);
router.post("/certification/purchase", utilityController.purchaseCertification);

// Query endpoints
router.get("/student/:address/enrollments", utilityController.getStudentEnrollments);
router.get("/student/:address/rewards", utilityController.getStudentRewards);
router.get("/student/:address/events", utilityController.getStudentEvents);
router.get("/student/:address/certifications", utilityController.getStudentCertifications);

module.exports = router; 