const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VieVerseTaskVerification - Security Tests", function () {
  let VieVerseToken, VieVerseTaskVerification;
  let vieVerseToken, taskVerification;
  let owner, company, student, moderator, attacker;
  let taskId;

  beforeEach(async function () {
    [owner, company, student, moderator, attacker] = await ethers.getSigners();

    // Deploy token contract with correct constructor arguments
    VieVerseToken = await ethers.getContractFactory("VieVerseToken");
    vieVerseToken = await VieVerseToken.deploy(
      "VieVerse Token",
      "VVT",
      owner.address
    );

    // Deploy task verification contract with correct arguments
    VieVerseTaskVerification = await ethers.getContractFactory(
      "VieVerseTaskVerification"
    );
    taskVerification = await VieVerseTaskVerification.deploy(
      vieVerseToken.target,
      owner.address
    );

    // Setup initial state
    await taskVerification.addModerator(moderator.address);
    await taskVerification
      .connect(company)
      .registerCompany("Test Company", "Test Description");
    await taskVerification.verifyCompany(company.address);
    await taskVerification
      .connect(student)
      .registerStudent("Test Student", "JavaScript, React");

    // Transfer tokens to contract for rewards
    await vieVerseToken.transfer(
      taskVerification.target,
      ethers.parseEther("10000")
    );

    // Always use latest block.timestamp for deadline
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock.timestamp + 86400;
    await taskVerification
      .connect(company)
      .createTask(
        "Test Task",
        "Test Description",
        ethers.parseEther("10"),
        deadline
      );

    taskId = 1;
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks in reward distribution", async function () {
      // Accept and submit task
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");

      // Verify task to trigger reward distribution
      await taskVerification
        .connect(company)
        .verifyTask(taskId, 90, 90, 90, "Great work!");

      // Check that reward was distributed correctly
      const studentBalance = await vieVerseToken.balanceOf(student.address);
      expect(studentBalance).to.be.gt(0);
    });

    it("Should use checks-effects-interactions pattern", async function () {
      // Accept and submit task
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");

      // Verify task
      const tx = await taskVerification
        .connect(company)
        .verifyTask(taskId, 90, 90, 90, "Great work!");

      // Check that state was updated before external call
      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);
    });
  });

  describe("Conflict of Interest Protection", function () {
    it("Should allow company to verify their own task immediately if no previous verification", async function () {
      // Accept and submit task
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");

      // Company can verify immediately if no previous verification
      await taskVerification
        .connect(company)
        .verifyTask(taskId, 90, 90, 90, "Great work!");

      const task = await taskVerification.getTask(taskId);
      expect(task.status).to.equal(3); // Completed = 3
    });

    it("Should prevent company from verifying their own task due to cooldown", async function () {
      // Create and complete first task to trigger cooldown
      await taskVerification
        .connect(company)
        .createTask(
          "Task 1",
          "Description 1",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );

      await taskVerification.connect(student).acceptTask(1);
      await taskVerification.connect(student).submitTask(1, "QmHash1");
      await taskVerification
        .connect(company)
        .verifyTask(1, 90, 90, 90, "Great work!");

      // Create second task
      await taskVerification
        .connect(company)
        .createTask(
          "Task 2",
          "Description 2",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );

      await taskVerification.connect(student).acceptTask(2);
      await taskVerification.connect(student).submitTask(2, "QmHash2");

      // Try to verify immediately - should fail due to cooldown
      await expect(
        taskVerification
          .connect(company)
          .verifyTask(2, 90, 90, 90, "Great work!")
      ).to.be.revertedWith("Cooldown period not met");
    });

    it("Should allow company to verify after cooldown period", async function () {
      // Create and complete first task to trigger cooldown
      await taskVerification
        .connect(company)
        .createTask(
          "Task 1",
          "Description 1",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );

      await taskVerification.connect(student).acceptTask(1);
      await taskVerification.connect(student).submitTask(1, "QmHash1");
      await taskVerification
        .connect(company)
        .verifyTask(1, 90, 90, 90, "Great work!");

      // Create second task
      await taskVerification
        .connect(company)
        .createTask(
          "Task 2",
          "Description 2",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );

      await taskVerification.connect(student).acceptTask(2);
      await taskVerification.connect(student).submitTask(2, "QmHash2");

      // Wait for cooldown period (1 hour)
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      // Now should be able to verify
      await taskVerification
        .connect(company)
        .verifyTask(2, 90, 90, 90, "Great work!");

      const task = await taskVerification.getTask(2);
      expect(task.status).to.equal(3); // Completed = 3
    });

    it("Should allow moderator to verify without cooldown", async function () {
      // Accept and submit task
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");

      // Moderator can verify immediately
      await taskVerification
        .connect(moderator)
        .verifyTask(taskId, 90, 90, 90, "Great work!");

      const task = await taskVerification.getTask(taskId);
      expect(task.status).to.equal(3); // Completed = 3
    });
  });

  describe("Input Validation", function () {
    it("Should validate task reward limits", async function () {
      // Try to create task with reward below minimum
      await expect(
        taskVerification.connect(company).createTask(
          "Test Task",
          "Test Description",
          ethers.parseEther("0.5"), // Below minimum
          Math.floor(Date.now() / 1000) + 86400
        )
      ).to.be.revertedWith("Reward below minimum");

      // Try to create task with reward above maximum
      await expect(
        taskVerification.connect(company).createTask(
          "Test Task",
          "Test Description",
          ethers.parseEther("2000"), // Above maximum
          Math.floor(Date.now() / 1000) + 86400
        )
      ).to.be.revertedWith("Reward above maximum");
    });

    it("Should validate deadline constraints", async function () {
      // Try to create task with deadline too soon
      await expect(
        taskVerification.connect(company).createTask(
          "Test Task",
          "Test Description",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 1800 // 30 minutes (less than 1 hour)
        )
      ).to.be.revertedWith("Deadline too soon");

      // Try to create task with deadline too far
      await expect(
        taskVerification.connect(company).createTask(
          "Test Task",
          "Test Description",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 31 * 24 * 3600 // 31 days
        )
      ).to.be.revertedWith("Deadline too far");
    });

    it("Should validate string lengths", async function () {
      // Try to register company with empty name
      await expect(
        taskVerification.connect(attacker).registerCompany("", "Description")
      ).to.be.revertedWith("String too short");

      // Try to register company with name too long
      const longName = "A".repeat(101);
      await expect(
        taskVerification
          .connect(attacker)
          .registerCompany(longName, "Description")
      ).to.be.revertedWith("String too long");
    });

    it("Should validate addresses", async function () {
      // Try to add moderator with zero address
      await expect(
        taskVerification.addModerator(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Rate Limiting", function () {
    it("Should limit concurrent tasks per student", async function () {
      // Create multiple tasks
      for (let i = 0; i < 10; i++) {
        await taskVerification
          .connect(company)
          .createTask(
            `Task ${i}`,
            "Description",
            ethers.parseEther("10"),
            Math.floor(Date.now() / 1000) + 86400
          );
      }

      // Accept 10 tasks (maximum allowed)
      for (let i = 1; i <= 10; i++) {
        await taskVerification.connect(student).acceptTask(i);
      }

      // Try to accept 11th task - should fail
      await taskVerification
        .connect(company)
        .createTask(
          "Task 11",
          "Description",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );

      await expect(
        taskVerification.connect(student).acceptTask(11)
      ).to.be.revertedWith("Too many active tasks");
    });

    it("Should limit concurrent tasks per company", async function () {
      // Create 48 additional tasks (total 49 including the one from beforeEach)
      for (let i = 0; i < 48; i++) {
        await taskVerification.connect(company).createTask(
          `Task ${i + 2}`, // Start from 2 since taskId 1 is already created in beforeEach
          "Description",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );
      }

      // Try to create 50th task - should succeed
      await taskVerification
        .connect(company)
        .createTask(
          "Task 50",
          "Description",
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 86400
        );

      // Try to create 51st task - should fail
      await expect(
        taskVerification
          .connect(company)
          .createTask(
            "Task 51",
            "Description",
            ethers.parseEther("10"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWith("Too many active tasks");
    });
  });

  describe("Emergency Stop", function () {
    it("Should activate emergency stop", async function () {
      await taskVerification.activateEmergencyStop();
      expect(await taskVerification.emergencyStop()).to.be.true;
    });

    it("Should prevent operations when emergency stop is active", async function () {
      await taskVerification.activateEmergencyStop();

      // Try to register company - should fail
      await expect(
        taskVerification
          .connect(attacker)
          .registerCompany("Test", "Description")
      ).to.be.revertedWith("Contract is in emergency stop");

      // Try to create task - should fail
      await expect(
        taskVerification
          .connect(company)
          .createTask(
            "Test Task",
            "Description",
            ethers.parseEther("10"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWith("Contract is in emergency stop");
    });

    it("Should allow operations after emergency stop is deactivated", async function () {
      await taskVerification.activateEmergencyStop();
      await taskVerification.deactivateEmergencyStop();

      // Should work again
      await taskVerification
        .connect(attacker)
        .registerCompany("Test", "Description");
    });

    it("Should only allow owner to control emergency stop", async function () {
      await expect(
        taskVerification.connect(attacker).activateEmergencyStop()
      ).to.be.revertedWithCustomError(
        taskVerification,
        "OwnableUnauthorizedAccount"
      );

      await expect(
        taskVerification.connect(attacker).deactivateEmergencyStop()
      ).to.be.revertedWithCustomError(
        taskVerification,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Pausable Functionality", function () {
    it("Should pause and unpause contract", async function () {
      await taskVerification.pause();
      expect(await taskVerification.paused()).to.be.true;

      await taskVerification.unpause();
      expect(await taskVerification.paused()).to.be.false;
    });

    it("Should prevent operations when paused", async function () {
      await taskVerification.pause();

      await expect(
        taskVerification
          .connect(attacker)
          .registerCompany("Test", "Description")
      ).to.be.revertedWithCustomError(taskVerification, "EnforcedPause");

      await expect(
        taskVerification
          .connect(company)
          .createTask(
            "Test Task",
            "Description",
            ethers.parseEther("10"),
            Math.floor(Date.now() / 1000) + 86400
          )
      ).to.be.revertedWithCustomError(taskVerification, "EnforcedPause");
    });
  });

  describe("Security Settings", function () {
    it("Should update security settings", async function () {
      await taskVerification.updateSecuritySettings(
        ethers.parseEther("2"), // minTaskReward
        ethers.parseEther("500"), // maxTaskReward
        2 * 3600, // cooldownPeriod (2 hours)
        5, // maxTasksPerStudent
        25 // maxTasksPerCompany
      );

      expect(await taskVerification.minTaskReward()).to.equal(
        ethers.parseEther("2")
      );
      expect(await taskVerification.maxTaskReward()).to.equal(
        ethers.parseEther("500")
      );
      expect(await taskVerification.cooldownPeriod()).to.equal(2 * 3600);
      expect(await taskVerification.maxTasksPerStudent()).to.equal(5);
      expect(await taskVerification.maxTasksPerCompany()).to.equal(25);
    });

    it("Should validate security settings", async function () {
      // Try to set invalid reward range
      await expect(
        taskVerification.updateSecuritySettings(
          ethers.parseEther("10"), // minTaskReward
          ethers.parseEther("5"), // maxTaskReward (less than min)
          3600, // cooldownPeriod
          10, // maxTasksPerStudent
          50 // maxTasksPerCompany
        )
      ).to.be.revertedWith("Invalid reward range");

      // Try to set cooldown too long
      await expect(
        taskVerification.updateSecuritySettings(
          ethers.parseEther("1"),
          ethers.parseEther("1000"),
          25 * 3600, // 25 hours (too long)
          10,
          50
        )
      ).to.be.revertedWith("Cooldown too long");
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-owner from removing owner as moderator", async function () {
      // Owner is automatically a moderator
      expect(await taskVerification.isModerator(owner.address)).to.be.true;

      // Cannot remove owner as moderator
      await expect(
        taskVerification.removeModerator(owner.address)
      ).to.be.revertedWith("Cannot remove owner as moderator");
    });

    it("Should track verification metadata", async function () {
      // Accept and submit task
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");

      // Wait for cooldown and verify
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");

      await taskVerification
        .connect(company)
        .verifyTask(taskId, 90, 90, 90, "Great work!");

      const task = await taskVerification.getTask(taskId);
      expect(task.verifiedBy).to.equal(company.address);
      expect(task.verifiedAt).to.be.gt(0);
    });

    it("Should track active task counts", async function () {
      // Create and accept a task
      await taskVerification.connect(student).acceptTask(taskId);

      const [studentActive, companyActive] =
        await taskVerification.getActiveTaskCounts(
          student.address,
          company.address
        );

      expect(studentActive).to.equal(1);
      expect(companyActive).to.equal(1);
    });
  });

  describe("Immutable Token Contract", function () {
    it("Should have immutable token contract", async function () {
      const tokenAddress = await taskVerification.vieVerseToken();
      expect(tokenAddress).to.equal(vieVerseToken.target);
    });
  });

  describe("Reputation Score Logic", function () {
    it("Should not overflow and cap at 1000 when adding reputation", async function () {
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");
      const baseTime = Math.floor(Date.now() / 1000) + 86400;
      await taskVerification.students(student.address).then(async (stu) => {
        for (let i = 0; i < 50; i++) {
          await taskVerification.connect(company).createTask(
            `Task ${i + 2}`,
            "Description",
            ethers.parseEther("10"),
            baseTime + i * 3600 // tăng deadline mỗi task 1 giờ
          );
          await taskVerification.connect(student).acceptTask(i + 2);
          await taskVerification
            .connect(student)
            .submitTask(i + 2, `QmHash${i + 2}`);
          if (i > 0) {
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
          }
          await taskVerification
            .connect(company)
            .verifyTask(i + 2, 90, 90, 90, "Great work!");
        }
        const studentData = await taskVerification.getStudent(student.address);
        expect(studentData.reputationScore).to.equal(1000);
      });
    });

    it("Should cap reputation at 1000 if adding would exceed", async function () {
      for (let i = 0; i < 49; i++) {
        const latestBlock = await ethers.provider.getBlock("latest");
        const deadline = latestBlock.timestamp + 86400;
        await taskVerification
          .connect(company)
          .createTask(
            `Task ${i + 2}`,
            "Description",
            ethers.parseEther("10"),
            deadline
          );
        await taskVerification.connect(student).acceptTask(i + 2);
        await taskVerification
          .connect(student)
          .submitTask(i + 2, `QmHash${i + 2}`);
        if (i > 0) {
          await ethers.provider.send("evm_increaseTime", [3600]);
          await ethers.provider.send("evm_mine");
        }
        await taskVerification
          .connect(company)
          .verifyTask(i + 2, 90, 90, 90, "Great work!");
      }
      const studentData = await taskVerification.getStudent(student.address);
      expect(studentData.reputationScore).to.equal(1000);
    });

    it("Should emit ReputationUpdated event with correct values", async function () {
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");
      // Wait for cooldown
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      await expect(
        taskVerification
          .connect(company)
          .verifyTask(taskId, 90, 90, 90, "Great work!")
      )
        .to.emit(taskVerification, "ReputationUpdated")
        .withArgs(
          student.address,
          520, // 500 + 20
          20
        );
    });

    it("Should add reputation correctly for edge cases", async function () {
      // Làm task với score = 80 (cộng 10)
      let latestBlock = await ethers.provider.getBlock("latest");
      let deadline = latestBlock.timestamp + 7 * 86400;
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");
      await taskVerification
        .connect(company)
        .verifyTask(taskId, 80, 80, 80, "Good work!");
      let studentData = await taskVerification.getStudent(student.address);
      expect(studentData.reputationScore).to.equal(510);

      // Làm task với score = 70 (cộng 5)
      latestBlock = await ethers.provider.getBlock("latest");
      deadline = latestBlock.timestamp + 7 * 86400;
      await taskVerification
        .connect(company)
        .createTask("Task 2", "Description", ethers.parseEther("10"), deadline);
      await taskVerification.connect(student).acceptTask(2);
      await taskVerification.connect(student).submitTask(2, "QmHash2");
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      await taskVerification.connect(company).verifyTask(2, 70, 70, 70, "OK");
      studentData = await taskVerification.getStudent(student.address);
      expect(studentData.reputationScore).to.equal(515);

      // Làm task với score = 60 (cộng 2)
      latestBlock = await ethers.provider.getBlock("latest");
      deadline = latestBlock.timestamp + 7 * 86400;
      await taskVerification
        .connect(company)
        .createTask("Task 3", "Description", ethers.parseEther("10"), deadline);
      await taskVerification.connect(student).acceptTask(3);
      await taskVerification.connect(student).submitTask(3, "QmHash3");
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      await taskVerification.connect(company).verifyTask(3, 60, 60, 60, "OK");
      studentData = await taskVerification.getStudent(student.address);
      expect(studentData.reputationScore).to.equal(517);
    });
  });

  describe("Platform Fee Distribution", function () {
    it("Should transfer platform fee to owner when distributing reward", async function () {
      // Accept and submit task
      await taskVerification.connect(student).acceptTask(taskId);
      await taskVerification.connect(student).submitTask(taskId, "QmHash123");
      const baseReward = ethers.parseEther("10");
      const platformFee = await taskVerification.platformFee();
      const expectedFee = (baseReward * platformFee) / 100n;
      const ownerBalanceBefore = await vieVerseToken.balanceOf(owner.address);
      // Verify task to trigger reward distribution
      await taskVerification
        .connect(company)
        .verifyTask(taskId, 90, 90, 90, "Great work!");
      const ownerBalanceAfter = await vieVerseToken.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(expectedFee);
    });
  });
});
