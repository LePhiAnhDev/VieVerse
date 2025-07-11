const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VieVerseTokenUtility", function () {
  let vieVerseToken;
  let tokenUtility;
  let owner;
  let student1;
  let student2;
  let instructor;
  let addrs;

  const COURSE_PRICE = ethers.parseEther("100");
  const REWARD_PRICE = ethers.parseEther("50");
  const EVENT_PRICE = ethers.parseEther("25");
  const CERT_PRICE = ethers.parseEther("200");
  const EVENT_DATE = Math.floor(Date.now() / 1000) + 604800; // 7 days from now (instead of 1 day)

  beforeEach(async function () {
    [owner, student1, student2, instructor, ...addrs] =
      await ethers.getSigners();

    // Deploy VieVerseToken
    const VieVerseToken = await ethers.getContractFactory("VieVerseToken");
    vieVerseToken = await VieVerseToken.deploy(
      "VieVerse Token",
      "VVT",
      owner.address
    );

    // Deploy VieVerseTokenUtility
    const VieVerseTokenUtility = await ethers.getContractFactory(
      "VieVerseTokenUtility"
    );
    tokenUtility = await VieVerseTokenUtility.deploy(
      vieVerseToken.target,
      owner.address
    );

    // Transfer tokens to utility contract
    await vieVerseToken.transfer(
      tokenUtility.target,
      ethers.parseEther("10000")
    );

    // Give tokens to students for testing
    await vieVerseToken.transfer(student1.address, ethers.parseEther("1000"));
    await vieVerseToken.transfer(student2.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tokenUtility.owner()).to.equal(owner.address);
    });

    it("Should set the correct VieVerse token address", async function () {
      expect(await tokenUtility.vieVerseToken()).to.equal(vieVerseToken.target);
    });
  });

  describe("Course Management", function () {
    it("Should allow owner to create course", async function () {
      await tokenUtility.createCourse(
        "Web Development",
        "Learn modern web development",
        COURSE_PRICE,
        50,
        "QmCourseHash",
        instructor.address
      );

      const course = await tokenUtility.courses(1);
      expect(course.title).to.equal("Web Development");
      expect(course.price).to.equal(COURSE_PRICE);
      expect(course.instructor).to.equal(instructor.address);
      expect(course.isActive).to.be.true;
    });

    it("Should emit CourseCreated event", async function () {
      await expect(
        tokenUtility.createCourse(
          "Web Development",
          "Learn modern web development",
          COURSE_PRICE,
          50,
          "QmCourseHash",
          instructor.address
        )
      )
        .to.emit(tokenUtility, "CourseCreated")
        .withArgs(1, "Web Development", COURSE_PRICE);
    });

    it("Should not allow non-owner to create course", async function () {
      await expect(
        tokenUtility
          .connect(student1)
          .createCourse(
            "Web Development",
            "Learn modern web development",
            COURSE_PRICE,
            50,
            "QmCourseHash",
            instructor.address
          )
      ).to.be.revertedWithCustomError(
        tokenUtility,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should not allow empty course title", async function () {
      await expect(
        tokenUtility.createCourse(
          "",
          "Learn modern web development",
          COURSE_PRICE,
          50,
          "QmCourseHash",
          instructor.address
        )
      ).to.be.revertedWith("Course title required");
    });

    it("Should not allow zero course price", async function () {
      await expect(
        tokenUtility.createCourse(
          "Web Development",
          "Learn modern web development",
          0,
          50,
          "QmCourseHash",
          instructor.address
        )
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Course Enrollment", function () {
    beforeEach(async function () {
      await tokenUtility.createCourse(
        "Web Development",
        "Learn modern web development",
        COURSE_PRICE,
        50,
        "QmCourseHash",
        instructor.address
      );
    });

    it("Should allow student to enroll in course", async function () {
      const initialBalance = await vieVerseToken.balanceOf(student1.address);

      // Approve tokens first
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE);

      await tokenUtility.connect(student1).enrollCourse(1);

      const finalBalance = await vieVerseToken.balanceOf(student1.address);
      expect(finalBalance).to.equal(initialBalance - COURSE_PRICE);

      const enrollment = await tokenUtility.getEnrollment(1, student1.address);
      expect(enrollment.student).to.equal(student1.address);
      expect(enrollment.courseId).to.equal(1);
    });

    it("Should emit CourseEnrolled event", async function () {
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE);

      await expect(tokenUtility.connect(student1).enrollCourse(1))
        .to.emit(tokenUtility, "CourseEnrolled")
        .withArgs(1, student1.address);
    });

    it("Should not allow enrolling in non-existent course", async function () {
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE);

      await expect(
        tokenUtility.connect(student1).enrollCourse(999)
      ).to.be.revertedWith("Course does not exist");
    });

    it("Should not allow enrolling twice in same course", async function () {
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE * 2n);

      await tokenUtility.connect(student1).enrollCourse(1);

      await expect(
        tokenUtility.connect(student1).enrollCourse(1)
      ).to.be.revertedWith("Already enrolled");
    });

    it("Should not allow enrolling in inactive course", async function () {
      await tokenUtility.updateCourseStatus(1, false);
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE);

      await expect(
        tokenUtility.connect(student1).enrollCourse(1)
      ).to.be.revertedWith("Course is not active");
    });
  });

  describe("Course Completion", function () {
    beforeEach(async function () {
      await tokenUtility.createCourse(
        "Web Development",
        "Learn modern web development",
        COURSE_PRICE,
        50,
        "QmCourseHash",
        instructor.address
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE);
      await tokenUtility.connect(student1).enrollCourse(1);
    });

    it("Should allow instructor to complete course", async function () {
      await tokenUtility
        .connect(instructor)
        .completeCourse(1, student1.address, 85);

      const enrollment = await tokenUtility.getEnrollment(1, student1.address);
      expect(enrollment.isCompleted).to.be.true;
      expect(enrollment.score).to.equal(85);
    });

    it("Should emit CourseCompleted event", async function () {
      await expect(
        tokenUtility.connect(instructor).completeCourse(1, student1.address, 85)
      )
        .to.emit(tokenUtility, "CourseCompleted")
        .withArgs(1, student1.address, 85);
    });

    it("Should not allow non-instructor to complete course", async function () {
      await expect(
        tokenUtility.connect(student2).completeCourse(1, student1.address, 85)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow completing non-enrolled course", async function () {
      await expect(
        tokenUtility.connect(instructor).completeCourse(1, student2.address, 85)
      ).to.be.revertedWith("Not enrolled");
    });

    it("Should not allow score above 100", async function () {
      await expect(
        tokenUtility
          .connect(instructor)
          .completeCourse(1, student1.address, 101)
      ).to.be.revertedWith("Score must be 0-100");
    });
  });

  describe("Reward Management", function () {
    it("Should allow owner to create reward", async function () {
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        100,
        "QmRewardHash"
      );

      const reward = await tokenUtility.rewards(1);
      expect(reward.name).to.equal("Premium Certificate");
      expect(reward.price).to.equal(REWARD_PRICE);
      expect(reward.stock).to.equal(100);
      expect(reward.isActive).to.be.true;
    });

    it("Should emit RewardCreated event", async function () {
      await expect(
        tokenUtility.createReward(
          "Premium Certificate",
          "High-quality certificate",
          REWARD_PRICE,
          100,
          "QmRewardHash"
        )
      )
        .to.emit(tokenUtility, "RewardCreated")
        .withArgs(1, "Premium Certificate", REWARD_PRICE);
    });

    it("Should allow student to redeem reward", async function () {
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        100,
        "QmRewardHash"
      );

      const initialBalance = await vieVerseToken.balanceOf(student1.address);
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, REWARD_PRICE);

      await tokenUtility.connect(student1).redeemReward(1);

      const finalBalance = await vieVerseToken.balanceOf(student1.address);
      expect(finalBalance).to.equal(initialBalance - REWARD_PRICE);

      const reward = await tokenUtility.rewards(1);
      expect(reward.stock).to.equal(99);
    });

    it("Should emit RewardRedeemed event", async function () {
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        100,
        "QmRewardHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, REWARD_PRICE);

      await expect(tokenUtility.connect(student1).redeemReward(1))
        .to.emit(tokenUtility, "RewardRedeemed")
        .withArgs(1, student1.address);
    });

    it("Should not allow redeeming out-of-stock reward", async function () {
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        1,
        "QmRewardHash"
      );

      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, REWARD_PRICE);
      await vieVerseToken
        .connect(student2)
        .approve(tokenUtility.target, REWARD_PRICE);

      await tokenUtility.connect(student1).redeemReward(1);

      await expect(
        tokenUtility.connect(student2).redeemReward(1)
      ).to.be.revertedWith("Reward out of stock");
    });
  });

  describe("Event Management", function () {
    it("Should allow owner to create event", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );

      const eventData = await tokenUtility.events(1);
      expect(eventData.name).to.equal("Tech Conference 2024");
      expect(eventData.price).to.equal(EVENT_PRICE);
      expect(eventData.maxParticipants).to.equal(200);
      expect(eventData.isActive).to.be.true;
    });

    it("Should emit EventCreated event", async function () {
      await expect(
        tokenUtility.createEvent(
          "Tech Conference 2024",
          "Annual technology conference",
          EVENT_PRICE,
          200,
          EVENT_DATE,
          "QmEventHash"
        )
      )
        .to.emit(tokenUtility, "EventCreated")
        .withArgs(1, "Tech Conference 2024", EVENT_PRICE);
    });

    it("Should allow student to join event", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );

      const initialBalance = await vieVerseToken.balanceOf(student1.address);
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, EVENT_PRICE);

      await tokenUtility.connect(student1).joinEvent(1);

      const finalBalance = await vieVerseToken.balanceOf(student1.address);
      expect(finalBalance).to.equal(initialBalance - EVENT_PRICE);

      const eventData = await tokenUtility.events(1);
      expect(eventData.currentParticipants).to.equal(1);
    });

    it("Should emit EventJoined event", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, EVENT_PRICE);

      await expect(tokenUtility.connect(student1).joinEvent(1))
        .to.emit(tokenUtility, "EventJoined")
        .withArgs(1, student1.address);
    });

    it("Should not allow joining full event", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        1,
        EVENT_DATE,
        "QmEventHash"
      );

      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, EVENT_PRICE);
      await vieVerseToken
        .connect(student2)
        .approve(tokenUtility.target, EVENT_PRICE);

      await tokenUtility.connect(student1).joinEvent(1);

      await expect(
        tokenUtility.connect(student2).joinEvent(1)
      ).to.be.revertedWith("Event is full");
    });

    it("Should allow student to join event and set hasJoinedEvent mapping", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, EVENT_PRICE);
      await tokenUtility.connect(student1).joinEvent(1);
      // Kiểm tra mapping hasJoinedEvent
      expect(await tokenUtility.hasJoinedEvent(student1.address, 1)).to.be.true;
    });
    it("Should not allow student to join the same event twice (mapping existence)", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, EVENT_PRICE * 2n);
      await tokenUtility.connect(student1).joinEvent(1);
      await expect(
        tokenUtility.connect(student1).joinEvent(1)
      ).to.be.revertedWith("Already joined event");
    });
  });

  describe("Certification Management", function () {
    it("Should allow owner to create certification", async function () {
      await tokenUtility.createCertification(
        "Blockchain Developer",
        "Certified blockchain developer",
        CERT_PRICE,
        "QmCertHash"
      );

      const cert = await tokenUtility.certifications(1);
      expect(cert.name).to.equal("Blockchain Developer");
      expect(cert.price).to.equal(CERT_PRICE);
      expect(cert.isActive).to.be.true;
    });

    it("Should emit CertificationCreated event", async function () {
      await expect(
        tokenUtility.createCertification(
          "Blockchain Developer",
          "Certified blockchain developer",
          CERT_PRICE,
          "QmCertHash"
        )
      )
        .to.emit(tokenUtility, "CertificationCreated")
        .withArgs(1, "Blockchain Developer", CERT_PRICE);
    });

    it("Should allow student to purchase certification", async function () {
      await tokenUtility.createCertification(
        "Blockchain Developer",
        "Certified blockchain developer",
        CERT_PRICE,
        "QmCertHash"
      );

      const initialBalance = await vieVerseToken.balanceOf(student1.address);
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, CERT_PRICE);

      await tokenUtility.connect(student1).purchaseCertification(1);

      const finalBalance = await vieVerseToken.balanceOf(student1.address);
      expect(finalBalance).to.equal(initialBalance - CERT_PRICE);
    });

    it("Should emit CertificationPurchased event", async function () {
      await tokenUtility.createCertification(
        "Blockchain Developer",
        "Certified blockchain developer",
        CERT_PRICE,
        "QmCertHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, CERT_PRICE);

      await expect(tokenUtility.connect(student1).purchaseCertification(1))
        .to.emit(tokenUtility, "CertificationPurchased")
        .withArgs(1, student1.address);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Create course, reward, event, certification
      await tokenUtility.createCourse(
        "Web Development",
        "Learn modern web development",
        COURSE_PRICE,
        50,
        "QmCourseHash",
        instructor.address
      );
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        100,
        "QmRewardHash"
      );
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );
      await tokenUtility.createCertification(
        "Blockchain Developer",
        "Certified blockchain developer",
        CERT_PRICE,
        "QmCertHash"
      );

      // Enroll, redeem, join, purchase
      await vieVerseToken
        .connect(student1)
        .approve(
          tokenUtility.target,
          COURSE_PRICE + REWARD_PRICE + EVENT_PRICE + CERT_PRICE
        );
      await tokenUtility.connect(student1).enrollCourse(1);
      await tokenUtility.connect(student1).redeemReward(1);
      await tokenUtility.connect(student1).joinEvent(1);
      await tokenUtility.connect(student1).purchaseCertification(1);
    });

    it("Should return student enrollments", async function () {
      const enrollments = await tokenUtility.getStudentEnrollments(
        student1.address
      );
      expect(enrollments.length).to.equal(1);
      expect(enrollments[0]).to.equal(1);
    });

    it("Should return student rewards", async function () {
      const rewards = await tokenUtility.getStudentRewards(student1.address);
      expect(rewards.length).to.equal(1);
      expect(rewards[0]).to.equal(1);
    });

    it("Should return student events", async function () {
      const events = await tokenUtility.getStudentEvents(student1.address);
      expect(events.length).to.equal(1);
      expect(events[0]).to.equal(1);
    });

    it("Should return student certifications", async function () {
      const certifications = await tokenUtility.getStudentCertifications(
        student1.address
      );
      expect(certifications.length).to.equal(1);
      expect(certifications[0]).to.equal(1);
    });

    it("Should return enrollment details", async function () {
      const enrollment = await tokenUtility.getEnrollment(1, student1.address);
      expect(enrollment.student).to.equal(student1.address);
      expect(enrollment.courseId).to.equal(1);
      expect(enrollment.isCompleted).to.be.false;
    });
  });

  describe("Token Spending Events", function () {
    it("Should emit TokensSpent event for course enrollment", async function () {
      await tokenUtility.createCourse(
        "Web Development",
        "Learn modern web development",
        COURSE_PRICE,
        50,
        "QmCourseHash",
        instructor.address
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, COURSE_PRICE);

      await expect(tokenUtility.connect(student1).enrollCourse(1))
        .to.emit(tokenUtility, "TokensSpent")
        .withArgs(student1.address, COURSE_PRICE, "Course enrollment");
    });

    it("Should emit TokensSpent event for reward redemption", async function () {
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        100,
        "QmRewardHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, REWARD_PRICE);

      await expect(tokenUtility.connect(student1).redeemReward(1))
        .to.emit(tokenUtility, "TokensSpent")
        .withArgs(student1.address, REWARD_PRICE, "Reward redemption");
    });

    it("Should emit TokensSpent event for event participation", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, EVENT_PRICE);

      await expect(tokenUtility.connect(student1).joinEvent(1))
        .to.emit(tokenUtility, "TokensSpent")
        .withArgs(student1.address, EVENT_PRICE, "Event participation");
    });

    it("Should emit TokensSpent event for certification purchase", async function () {
      await tokenUtility.createCertification(
        "Blockchain Developer",
        "Certified blockchain developer",
        CERT_PRICE,
        "QmCertHash"
      );
      await vieVerseToken
        .connect(student1)
        .approve(tokenUtility.target, CERT_PRICE);

      await expect(tokenUtility.connect(student1).purchaseCertification(1))
        .to.emit(tokenUtility, "TokensSpent")
        .withArgs(student1.address, CERT_PRICE, "Certification purchase");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to withdraw tokens", async function () {
      const initialBalance = await vieVerseToken.balanceOf(owner.address);
      await tokenUtility.withdrawTokens(ethers.parseEther("1000"));
      const finalBalance = await vieVerseToken.balanceOf(owner.address);
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });

    it("Should allow owner to update course status", async function () {
      await tokenUtility.createCourse(
        "Web Development",
        "Learn modern web development",
        COURSE_PRICE,
        50,
        "QmCourseHash",
        instructor.address
      );

      await tokenUtility.updateCourseStatus(1, false);
      const course = await tokenUtility.courses(1);
      expect(course.isActive).to.be.false;
    });

    it("Should allow owner to update reward status", async function () {
      await tokenUtility.createReward(
        "Premium Certificate",
        "High-quality certificate",
        REWARD_PRICE,
        100,
        "QmRewardHash"
      );

      await tokenUtility.updateRewardStatus(1, false);
      const reward = await tokenUtility.rewards(1);
      expect(reward.isActive).to.be.false;
    });

    it("Should allow owner to update event status", async function () {
      await tokenUtility.createEvent(
        "Tech Conference 2024",
        "Annual technology conference",
        EVENT_PRICE,
        200,
        EVENT_DATE,
        "QmEventHash"
      );

      await tokenUtility.updateEventStatus(1, false);
      const eventData = await tokenUtility.events(1);
      expect(eventData.isActive).to.be.false;
    });

    it("Should allow owner to update certification status", async function () {
      await tokenUtility.createCertification(
        "Blockchain Developer",
        "Certified blockchain developer",
        CERT_PRICE,
        "QmCertHash"
      );

      await tokenUtility.updateCertificationStatus(1, false);
      const cert = await tokenUtility.certifications(1);
      expect(cert.isActive).to.be.false;
    });
  });
});
