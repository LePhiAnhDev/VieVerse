// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./VieVerseToken.sol";

/**
 * @title VieVerseTaskVerification
 * @dev Smart contract for verifying task completion in VieVerse platform
 * Handles task creation, submission, verification, and reward distribution
 * Enhanced with comprehensive security measures
 */
contract VieVerseTaskVerification is Ownable, ReentrancyGuard, Pausable {
    
    using Address for address;
    
    // Task status enum
    enum TaskStatus { 
        Open,           // Task is available for students
        InProgress,     // Student has accepted the task
        Submitted,      // Student has submitted the work
        Completed,      // Task verified and completed
        Rejected,       // Task rejected by company
        Cancelled       // Task cancelled
    }
    
    // Task struct
    struct Task {
        uint256 taskId;
        address company;           // Company that created the task
        address student;           // Student who accepted the task
        string title;              // Task title
        string description;        // Task description
        uint256 reward;            // Token reward amount
        uint256 deadline;          // Task deadline timestamp
        uint256 createdAt;         // Task creation timestamp
        uint256 acceptedAt;        // When student accepted the task
        uint256 submittedAt;       // When student submitted the work
        TaskStatus status;         // Current task status
        string submissionHash;     // IPFS hash of submitted work
        string feedback;           // Company feedback
        uint256 qualityScore;      // Quality score (0-100)
        uint256 deadlineScore;     // Deadline score (0-100)
        uint256 attitudeScore;     // Attitude score (0-100)
        uint256 totalScore;        // Total score (0-100)
        address verifiedBy;        // Who verified the task
        uint256 verifiedAt;        // When task was verified
    }
    
    // Company struct
    struct Company {
        string name;
        string description;
        bool isVerified;
        uint256 totalTasks;
        uint256 completedTasks;
        uint256 totalRewardsDistributed;
        uint256 verificationCount; // Number of tasks verified by this company
        uint256 lastVerificationAt; // Last verification timestamp
    }
    
    // Student struct
    struct Student {
        string name;
        string skills;             // JSON string of skills
        uint256 totalTasks;
        uint256 completedTasks;
        uint256 totalRewards;
        uint256 reputationScore;   // Reputation score (0-1000)
        uint256 lastActivityAt;    // Last activity timestamp
    }
    
    // State variables
    uint256 public nextTaskId = 1;
    uint256 public platformFee = 5; // 5% platform fee
    uint256 public minTaskReward = 1 * 10**18; // Minimum 1 token
    uint256 public maxTaskReward = 1000 * 10**18; // Maximum 1000 tokens
    uint256 public minDeadlineHours = 1; // Minimum 1 hour
    uint256 public maxDeadlineDays = 30; // Maximum 30 days
    uint256 public cooldownPeriod = 1 hours; // Cooldown between company verifications
    
    // Security settings
    bool public emergencyStop = false;
    uint256 public maxTasksPerStudent = 10; // Maximum concurrent tasks per student
    uint256 public maxTasksPerCompany = 50; // Maximum concurrent tasks per company
    
    // Mappings
    mapping(uint256 => Task) public tasks;
    mapping(address => Company) public companies;
    mapping(address => Student) public students;
    mapping(address => bool) public moderators;
    mapping(address => uint256[]) public companyTasks;
    mapping(address => uint256[]) public studentTasks;
    mapping(address => uint256) public studentActiveTasks; // Track active tasks per student
    mapping(address => uint256) public companyActiveTasks; // Track active tasks per company
    
    // Events
    event TaskCreated(uint256 indexed taskId, address indexed company, string title, uint256 reward);
    event TaskAccepted(uint256 indexed taskId, address indexed student);
    event TaskSubmitted(uint256 indexed taskId, address indexed student, string submissionHash);
    event TaskVerified(uint256 indexed taskId, address indexed verifier, uint256 totalScore);
    event TaskRejected(uint256 indexed taskId, address indexed verifier, string reason);
    event RewardDistributed(uint256 indexed taskId, address indexed student, uint256 amount);
    event CompanyRegistered(address indexed company, string name);
    event StudentRegistered(address indexed student, string name);
    event ModeratorAdded(address indexed moderator);
    event ModeratorRemoved(address indexed moderator);
    event EmergencyStopActivated(address indexed by);
    event EmergencyStopDeactivated(address indexed by);
    event SecuritySettingsUpdated(uint256 minReward, uint256 maxReward, uint256 cooldown);
    event ReputationUpdated(address indexed student, uint256 newReputation, uint256 reputationIncrease);
    
    // VieVerse Token contract
    VieVerseToken public immutable vieVerseToken;
    
    // Modifiers
    modifier onlyCompany() {
        require(companies[msg.sender].isVerified, "Not a verified company");
        _;
    }
    
    modifier onlyStudent() {
        require(bytes(students[msg.sender].name).length > 0, "Not a registered student");
        _;
    }
    
    modifier onlyModerator() {
        require(moderators[msg.sender] || msg.sender == owner(), "Not a moderator");
        _;
    }
    
    modifier taskExists(uint256 taskId) {
        require(tasks[taskId].taskId != 0, "Task does not exist");
        _;
    }
    
    modifier onlyTaskCompany(uint256 taskId) {
        require(tasks[taskId].company == msg.sender, "Not task company");
        _;
    }
    
    modifier onlyTaskStudent(uint256 taskId) {
        require(tasks[taskId].student == msg.sender, "Not task student");
        _;
    }
    
    modifier notEmergencyStop() {
        require(!emergencyStop, "Contract is in emergency stop");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }
    
    modifier validString(string memory str, uint256 minLength, uint256 maxLength) {
        require(bytes(str).length >= minLength, "String too short");
        require(bytes(str).length <= maxLength, "String too long");
        _;
    }
    
    constructor(address _vieVerseToken, address initialOwner) Ownable(initialOwner) {
        require(_vieVerseToken != address(0), "Invalid token address");
        vieVerseToken = VieVerseToken(_vieVerseToken);
        moderators[initialOwner] = true;
    }
    
    /**
     * @dev Register a new company
     * @param name Company name
     * @param description Company description
     */
    function registerCompany(string memory name, string memory description) 
        external 
        whenNotPaused 
        notEmergencyStop 
        validString(name, 1, 100)
        validString(description, 1, 500)
    {
        require(bytes(companies[msg.sender].name).length == 0, "Company already registered");
        
        companies[msg.sender] = Company({
            name: name,
            description: description,
            isVerified: false,
            totalTasks: 0,
            completedTasks: 0,
            totalRewardsDistributed: 0,
            verificationCount: 0,
            lastVerificationAt: 0
        });
        
        emit CompanyRegistered(msg.sender, name);
    }
    
    /**
     * @dev Register a new student
     * @param name Student name
     * @param skills JSON string of student skills
     */
    function registerStudent(string memory name, string memory skills) 
        external 
        whenNotPaused 
        notEmergencyStop 
        validString(name, 1, 100)
        validString(skills, 1, 1000)
    {
        require(bytes(students[msg.sender].name).length == 0, "Student already registered");
        
        students[msg.sender] = Student({
            name: name,
            skills: skills,
            totalTasks: 0,
            completedTasks: 0,
            totalRewards: 0,
            reputationScore: 500, // Starting reputation score
            lastActivityAt: block.timestamp
        });
        
        emit StudentRegistered(msg.sender, name);
    }
    
    /**
     * @dev Verify a company (only moderators)
     * @param company Company address to verify
     */
    function verifyCompany(address company) 
        external 
        onlyModerator 
        validAddress(company)
    {
        require(bytes(companies[company].name).length > 0, "Company not registered");
        companies[company].isVerified = true;
    }
    
    /**
     * @dev Add moderator
     * @param moderator Address to add as moderator
     */
    function addModerator(address moderator) 
        external 
        onlyOwner 
        validAddress(moderator)
    {
        moderators[moderator] = true;
        emit ModeratorAdded(moderator);
    }
    
    /**
     * @dev Remove moderator
     * @param moderator Address to remove as moderator
     */
    function removeModerator(address moderator) 
        external 
        onlyOwner 
        validAddress(moderator)
    {
        require(moderator != owner(), "Cannot remove owner as moderator");
        moderators[moderator] = false;
        emit ModeratorRemoved(moderator);
    }
    
    /**
     * @dev Create a new task
     * @param title Task title
     * @param description Task description
     * @param reward Token reward amount
     * @param deadline Task deadline (timestamp)
     */
    function createTask(
        string memory title,
        string memory description,
        uint256 reward,
        uint256 deadline
    ) external 
        onlyCompany 
        whenNotPaused 
        notEmergencyStop 
        validString(title, 1, 200)
        validString(description, 1, 2000)
    {
        require(reward >= minTaskReward, "Reward below minimum");
        require(reward <= maxTaskReward, "Reward above maximum");
        require(deadline > block.timestamp + (minDeadlineHours * 1 hours), "Deadline too soon");
        require(deadline <= block.timestamp + (maxDeadlineDays * 1 days), "Deadline too far");
        require(companyActiveTasks[msg.sender] < maxTasksPerCompany, "Too many active tasks");
        
        uint256 taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            taskId: taskId,
            company: msg.sender,
            student: address(0),
            title: title,
            description: description,
            reward: reward,
            deadline: deadline,
            createdAt: block.timestamp,
            acceptedAt: 0,
            submittedAt: 0,
            status: TaskStatus.Open,
            submissionHash: "",
            feedback: "",
            qualityScore: 0,
            deadlineScore: 0,
            attitudeScore: 0,
            totalScore: 0,
            verifiedBy: address(0),
            verifiedAt: 0
        });
        
        companyTasks[msg.sender].push(taskId);
        companies[msg.sender].totalTasks++;
        companyActiveTasks[msg.sender]++;
        
        emit TaskCreated(taskId, msg.sender, title, reward);
    }
    
    /**
     * @dev Accept a task by student
     * @param taskId Task ID to accept
     */
    function acceptTask(uint256 taskId) 
        external 
        onlyStudent 
        taskExists(taskId) 
        whenNotPaused 
        notEmergencyStop 
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Open, "Task not available");
        require(task.student == address(0), "Task already accepted");
        require(studentActiveTasks[msg.sender] < maxTasksPerStudent, "Too many active tasks");
        require(task.deadline > block.timestamp, "Task deadline passed");
        
        task.student = msg.sender;
        task.status = TaskStatus.InProgress;
        task.acceptedAt = block.timestamp;
        
        studentTasks[msg.sender].push(taskId);
        students[msg.sender].totalTasks++;
        students[msg.sender].lastActivityAt = block.timestamp;
        studentActiveTasks[msg.sender]++;
        
        emit TaskAccepted(taskId, msg.sender);
    }
    
    /**
     * @dev Submit completed work
     * @param taskId Task ID
     * @param submissionHash IPFS hash of submitted work
     */
    function submitTask(uint256 taskId, string memory submissionHash) 
        external 
        onlyStudent 
        taskExists(taskId) 
        onlyTaskStudent(taskId) 
        whenNotPaused 
        notEmergencyStop 
        validString(submissionHash, 1, 100)
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.InProgress, "Task not in progress");
        require(block.timestamp <= task.deadline + 24 hours, "Submission deadline passed");
        
        task.status = TaskStatus.Submitted;
        task.submittedAt = block.timestamp;
        task.submissionHash = submissionHash;
        students[msg.sender].lastActivityAt = block.timestamp;
        
        emit TaskSubmitted(taskId, msg.sender, submissionHash);
    }
    
    /**
     * @dev Verify and complete task (only company or moderator)
     * @param taskId Task ID
     * @param qualityScore Quality score (0-100)
     * @param deadlineScore Deadline score (0-100)
     * @param attitudeScore Attitude score (0-100)
     * @param feedback Company feedback
     */
    function verifyTask(
        uint256 taskId,
        uint256 qualityScore,
        uint256 deadlineScore,
        uint256 attitudeScore,
        string memory feedback
    ) external 
        taskExists(taskId) 
        whenNotPaused 
        notEmergencyStop 
        validString(feedback, 1, 1000)
    {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Submitted, "Task not submitted");
        require(
            msg.sender == task.company || moderators[msg.sender] || msg.sender == owner(),
            "Not authorized to verify"
        );
        
        // Conflict of interest check: Company cannot verify their own task without cooldown
        if (msg.sender == task.company) {
            require(
                block.timestamp >= companies[msg.sender].lastVerificationAt + cooldownPeriod,
                "Cooldown period not met"
            );
        }
        
        require(qualityScore <= 100, "Quality score must be 0-100");
        require(deadlineScore <= 100, "Deadline score must be 0-100");
        require(attitudeScore <= 100, "Attitude score must be 0-100");
        
        uint256 totalScore = (qualityScore * 40 + deadlineScore * 30 + attitudeScore * 30) / 100;
        
        task.qualityScore = qualityScore;
        task.deadlineScore = deadlineScore;
        task.attitudeScore = attitudeScore;
        task.totalScore = totalScore;
        task.feedback = feedback;
        task.verifiedBy = msg.sender;
        task.verifiedAt = block.timestamp;
        
        if (totalScore >= 60) {
            // Task completed successfully
            task.status = TaskStatus.Completed;
            _distributeReward(taskId, totalScore);
            _updateStudentReputation(task.student, totalScore);
            companies[task.company].completedTasks++;
            companies[task.company].verificationCount++;
            companies[task.company].lastVerificationAt = block.timestamp;
            students[task.student].completedTasks++;
            students[task.student].lastActivityAt = block.timestamp;
            
            // Update active task counters
            companyActiveTasks[task.company]--;
            studentActiveTasks[task.student]--;
            
            emit TaskVerified(taskId, msg.sender, totalScore);
        } else {
            // Task rejected
            task.status = TaskStatus.Rejected;
            companyActiveTasks[task.company]--;
            studentActiveTasks[task.student]--;
            emit TaskRejected(taskId, msg.sender, "Score below minimum threshold");
        }
    }
    
    /**
     * @dev Internal function to distribute rewards with reentrancy protection
     * @param taskId Task ID
     * @param score Task score
     */
    function _distributeReward(uint256 taskId, uint256 score) internal nonReentrant {
        Task storage task = tasks[taskId];
        uint256 baseReward = task.reward;
        uint256 platformFeeAmount = (baseReward * platformFee) / 100;
        uint256 studentReward = baseReward - platformFeeAmount;
        
        // Calculate bonus based on score
        if (score >= 90) {
            studentReward = (studentReward * 120) / 100; // 20% bonus for excellent work
        } else if (score >= 80) {
            studentReward = (studentReward * 110) / 100; // 10% bonus for good work
        }
        
        // Update state before external call (checks-effects-interactions pattern)
        students[task.student].totalRewards += studentReward;
        companies[task.company].totalRewardsDistributed += studentReward;
        
        // Transfer tokens to student (external call)
        bool success = vieVerseToken.transfer(task.student, studentReward);
        require(success, "Token transfer failed");
        // Transfer platform fee to owner
        if (platformFeeAmount > 0) {
            bool feeSuccess = vieVerseToken.transfer(owner(), platformFeeAmount);
            require(feeSuccess, "Platform fee transfer failed");
        }
        emit RewardDistributed(taskId, task.student, studentReward);
    }
    
    /**
     * @dev Update student reputation based on task score
     * @param student Student address
     * @param score Task score
     */
    function _updateStudentReputation(address student, uint256 score) internal {
        Student storage studentData = students[student];
        uint256 reputationIncrease = 0;
        if (score >= 90) {
            reputationIncrease = 20;
        } else if (score >= 80) {
            reputationIncrease = 10;
        } else if (score >= 70) {
            reputationIncrease = 5;
        } else if (score >= 60) {
            reputationIncrease = 2;
        }
        uint256 newReputation = studentData.reputationScore + reputationIncrease;
        studentData.reputationScore = Math.min(newReputation, 1000);
        emit ReputationUpdated(student, studentData.reputationScore, reputationIncrease);
    }
    
    /**
     * @dev Emergency stop function (only owner)
     */
    function activateEmergencyStop() external onlyOwner {
        emergencyStop = true;
        emit EmergencyStopActivated(msg.sender);
    }
    
    /**
     * @dev Deactivate emergency stop (only owner)
     */
    function deactivateEmergencyStop() external onlyOwner {
        emergencyStop = false;
        emit EmergencyStopDeactivated(msg.sender);
    }
    
    /**
     * @dev Update security settings (only owner)
     */
    function updateSecuritySettings(
        uint256 _minTaskReward,
        uint256 _maxTaskReward,
        uint256 _cooldownPeriod,
        uint256 _maxTasksPerStudent,
        uint256 _maxTasksPerCompany
    ) external onlyOwner {
        require(_minTaskReward < _maxTaskReward, "Invalid reward range");
        require(_cooldownPeriod <= 24 hours, "Cooldown too long");
        require(_maxTasksPerStudent <= 20, "Max tasks per student too high");
        require(_maxTasksPerCompany <= 100, "Max tasks per company too high");
        
        minTaskReward = _minTaskReward;
        maxTaskReward = _maxTaskReward;
        cooldownPeriod = _cooldownPeriod;
        maxTasksPerStudent = _maxTasksPerStudent;
        maxTasksPerCompany = _maxTasksPerCompany;
        
        emit SecuritySettingsUpdated(_minTaskReward, _maxTaskReward, _cooldownPeriod);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get task details
     * @param taskId Task ID
     * @return Task details
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        require(tasks[taskId].taskId != 0, "Task does not exist");
        return tasks[taskId];
    }
    
    /**
     * @dev Get company tasks
     * @param company Company address
     * @return Array of task IDs
     */
    function getCompanyTasks(address company) external view returns (uint256[] memory) {
        return companyTasks[company];
    }
    
    /**
     * @dev Get student tasks
     * @param student Student address
     * @return Array of task IDs
     */
    function getStudentTasks(address student) external view returns (uint256[] memory) {
        return studentTasks[student];
    }
    
    /**
     * @dev Get company details
     * @param company Company address
     * @return Company details
     */
    function getCompany(address company) external view returns (Company memory) {
        return companies[company];
    }
    
    /**
     * @dev Get student details
     * @param student Student address
     * @return Student details
     */
    function getStudent(address student) external view returns (Student memory) {
        return students[student];
    }
    
    /**
     * @dev Get active task counts
     * @param student Student address
     * @param company Company address
     * @return studentActiveCount Number of active tasks for student
     * @return companyActiveCount Number of active tasks for company
     */
    function getActiveTaskCounts(address student, address company) 
        external 
        view 
        returns (uint256 studentActiveCount, uint256 companyActiveCount) 
    {
        return (studentActiveTasks[student], companyActiveTasks[company]);
    }
    
    /**
     * @dev Check if address is moderator
     * @param addr Address to check
     * @return True if moderator
     */
    function isModerator(address addr) external view returns (bool) {
        return moderators[addr] || addr == owner();
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFee New platform fee percentage
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 20, "Platform fee cannot exceed 20%");
        platformFee = newFee;
    }
    
    /**
     * @dev Withdraw platform fees (only owner)
     * @param amount Amount to withdraw
     */
    function withdrawPlatformFees(uint256 amount) external onlyOwner {
        require(amount <= vieVerseToken.balanceOf(address(this)), "Insufficient balance");
        bool success = vieVerseToken.transfer(owner(), amount);
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Get contract statistics
     * @return totalTasks Total number of tasks created
     * @return totalCompanies Total number of companies (placeholder)
     * @return totalStudents Total number of students (placeholder)
     * @return totalRewardsDistributed Total rewards distributed (placeholder)
     */
    function getContractStats() external view returns (
        uint256 totalTasks,
        uint256 totalCompanies,
        uint256 totalStudents,
        uint256 totalRewardsDistributed
    ) {
        return (
            nextTaskId - 1,
            0, // Would need to track this separately
            0, // Would need to track this separately
            0  // Would need to track this separately
        );
    }
} 