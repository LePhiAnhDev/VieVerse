// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VieVerseToken.sol";

/**
 * @title VieVerseTokenUtility
 * @dev Smart contract for managing token utility in VieVerse ecosystem
 * Handles course purchases, rewards redemption, event participation, and certifications
 */
contract VieVerseTokenUtility is Ownable, ReentrancyGuard {
    
    // Course struct
    struct Course {
        uint256 courseId;
        string title;
        string description;
        uint256 price;           // Token price
        uint256 maxStudents;
        uint256 enrolledStudents;
        bool isActive;
        string courseHash;       // IPFS hash for course content
        address instructor;
        uint256 createdAt;
    }
    
    // Reward struct
    struct Reward {
        uint256 rewardId;
        string name;
        string description;
        uint256 price;           // Token price
        uint256 stock;           // Available quantity
        bool isActive;
        string rewardHash;       // IPFS hash for reward details
        uint256 createdAt;
    }
    
    // Event struct
    struct Event {
        uint256 eventId;
        string name;
        string description;
        uint256 price;           // Token price for participation
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 eventDate;       // Timestamp
        bool isActive;
        string eventHash;        // IPFS hash for event details
        uint256 createdAt;
    }
    
    // Certification struct
    struct Certification {
        uint256 certId;
        string name;
        string description;
        uint256 price;           // Token price
        bool isActive;
        string certHash;         // IPFS hash for certification details
        uint256 createdAt;
    }
    
    // Student enrollment struct
    struct Enrollment {
        uint256 courseId;
        address student;
        uint256 enrolledAt;
        bool isCompleted;
        uint256 completedAt;
        uint256 score;           // Course completion score
    }
    
    // State variables
    uint256 public nextCourseId = 1;
    uint256 public nextRewardId = 1;
    uint256 public nextEventId = 1;
    uint256 public nextCertId = 1;
    
    // Mappings
    mapping(uint256 => Course) public courses;
    mapping(uint256 => Reward) public rewards;
    mapping(uint256 => Event) public events;
    mapping(uint256 => Certification) public certifications;
    mapping(uint256 => mapping(address => Enrollment)) public enrollments;
    mapping(address => uint256[]) public studentEnrollments;
    mapping(address => uint256[]) public studentRewards;
    mapping(address => uint256[]) public studentEvents;
    // Thêm mapping kiểm tra đã tham gia event
    mapping(address => mapping(uint256 => bool)) public hasJoinedEvent;
    mapping(address => uint256[]) public studentCertifications;
    
    // VieVerse Token contract
    VieVerseToken public vieVerseToken;
    
    // Events
    event CourseCreated(uint256 indexed courseId, string title, uint256 price);
    event CourseEnrolled(uint256 indexed courseId, address indexed student);
    event CourseCompleted(uint256 indexed courseId, address indexed student, uint256 score);
    event RewardCreated(uint256 indexed rewardId, string name, uint256 price);
    event RewardRedeemed(uint256 indexed rewardId, address indexed student);
    event EventCreated(uint256 indexed eventId, string name, uint256 price);
    event EventJoined(uint256 indexed eventId, address indexed student);
    event CertificationCreated(uint256 indexed certId, string name, uint256 price);
    event CertificationPurchased(uint256 indexed certId, address indexed student);
    event TokensSpent(address indexed student, uint256 amount, string purpose);
    
    constructor(address _vieVerseToken, address initialOwner) Ownable(initialOwner) {
        vieVerseToken = VieVerseToken(_vieVerseToken);
    }
    
    /**
     * @dev Create a new course (only owner or instructor)
     * @param title Course title
     * @param description Course description
     * @param price Token price
     * @param maxStudents Maximum number of students
     * @param courseHash IPFS hash for course content
     * @param instructor Course instructor address
     */
    function createCourse(
        string memory title,
        string memory description,
        uint256 price,
        uint256 maxStudents,
        string memory courseHash,
        address instructor
    ) external onlyOwner {
        require(bytes(title).length > 0, "Course title required");
        require(bytes(description).length > 0, "Course description required");
        require(price > 0, "Price must be greater than 0");
        require(maxStudents > 0, "Max students must be greater than 0");
        require(bytes(courseHash).length > 0, "Course hash required");
        
        uint256 courseId = nextCourseId++;
        
        courses[courseId] = Course({
            courseId: courseId,
            title: title,
            description: description,
            price: price,
            maxStudents: maxStudents,
            enrolledStudents: 0,
            isActive: true,
            courseHash: courseHash,
            instructor: instructor,
            createdAt: block.timestamp
        });
        
        emit CourseCreated(courseId, title, price);
    }
    
    /**
     * @dev Enroll in a course
     * @param courseId Course ID to enroll
     */
    function enrollCourse(uint256 courseId) external nonReentrant {
        Course storage course = courses[courseId];
        require(course.courseId != 0, "Course does not exist");
        require(course.isActive, "Course is not active");
        require(course.enrolledStudents < course.maxStudents, "Course is full");
        require(enrollments[courseId][msg.sender].enrolledAt == 0, "Already enrolled");
        
        // Transfer tokens
        require(
            vieVerseToken.transferFrom(msg.sender, address(this), course.price),
            "Token transfer failed"
        );
        
        // Create enrollment
        enrollments[courseId][msg.sender] = Enrollment({
            courseId: courseId,
            student: msg.sender,
            enrolledAt: block.timestamp,
            isCompleted: false,
            completedAt: 0,
            score: 0
        });
        
        course.enrolledStudents++;
        studentEnrollments[msg.sender].push(courseId);
        
        emit CourseEnrolled(courseId, msg.sender);
        emit TokensSpent(msg.sender, course.price, "Course enrollment");
    }
    
    /**
     * @dev Complete a course (only instructor or owner)
     * @param courseId Course ID
     * @param student Student address
     * @param score Completion score (0-100)
     */
    function completeCourse(uint256 courseId, address student, uint256 score) external {
        require(
            msg.sender == owner() || msg.sender == courses[courseId].instructor,
            "Not authorized"
        );
        require(score <= 100, "Score must be 0-100");
        
        Enrollment storage enrollment = enrollments[courseId][student];
        require(enrollment.enrolledAt != 0, "Not enrolled");
        require(!enrollment.isCompleted, "Already completed");
        
        enrollment.isCompleted = true;
        enrollment.completedAt = block.timestamp;
        enrollment.score = score;
        
        emit CourseCompleted(courseId, student, score);
    }
    
    /**
     * @dev Create a new reward
     * @param name Reward name
     * @param description Reward description
     * @param price Token price
     * @param stock Available quantity
     * @param rewardHash IPFS hash for reward details
     */
    function createReward(
        string memory name,
        string memory description,
        uint256 price,
        uint256 stock,
        string memory rewardHash
    ) external onlyOwner {
        require(bytes(name).length > 0, "Reward name required");
        require(price > 0, "Price must be greater than 0");
        require(stock > 0, "Stock must be greater than 0");
        
        uint256 rewardId = nextRewardId++;
        
        rewards[rewardId] = Reward({
            rewardId: rewardId,
            name: name,
            description: description,
            price: price,
            stock: stock,
            isActive: true,
            rewardHash: rewardHash,
            createdAt: block.timestamp
        });
        
        emit RewardCreated(rewardId, name, price);
    }
    
    /**
     * @dev Redeem a reward
     * @param rewardId Reward ID to redeem
     */
    function redeemReward(uint256 rewardId) external nonReentrant {
        Reward storage reward = rewards[rewardId];
        require(reward.rewardId != 0, "Reward does not exist");
        require(reward.isActive, "Reward is not active");
        require(reward.stock > 0, "Reward out of stock");
        
        // Transfer tokens
        require(
            vieVerseToken.transferFrom(msg.sender, address(this), reward.price),
            "Token transfer failed"
        );
        
        reward.stock--;
        studentRewards[msg.sender].push(rewardId);
        
        emit RewardRedeemed(rewardId, msg.sender);
        emit TokensSpent(msg.sender, reward.price, "Reward redemption");
    }
    
    /**
     * @dev Create a new event
     * @param name Event name
     * @param description Event description
     * @param price Token price for participation
     * @param maxParticipants Maximum participants
     * @param eventDate Event date (timestamp)
     * @param eventHash IPFS hash for event details
     */
    function createEvent(
        string memory name,
        string memory description,
        uint256 price,
        uint256 maxParticipants,
        uint256 eventDate,
        string memory eventHash
    ) external onlyOwner {
        require(bytes(name).length > 0, "Event name required");
        require(eventDate > block.timestamp, "Event date must be in the future");
        require(maxParticipants > 0, "Max participants must be greater than 0");
        
        uint256 eventId = nextEventId++;
        
        events[eventId] = Event({
            eventId: eventId,
            name: name,
            description: description,
            price: price,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            eventDate: eventDate,
            isActive: true,
            eventHash: eventHash,
            createdAt: block.timestamp
        });
        
        emit EventCreated(eventId, name, price);
    }
    
    /**
     * @dev Join an event
     * @param eventId Event ID to join
     */
    function joinEvent(uint256 eventId) external nonReentrant {
        Event storage eventData = events[eventId];
        require(eventData.eventId != 0, "Event does not exist");
        require(eventData.isActive, "Event is not active");
        require(eventData.currentParticipants < eventData.maxParticipants, "Event is full");
        require(eventData.eventDate > block.timestamp, "Event has passed");
        // Sử dụng mapping để kiểm tra đã tham gia
        require(!hasJoinedEvent[msg.sender][eventId], "Already joined event");
        
        // Transfer tokens
        require(
            vieVerseToken.transferFrom(msg.sender, address(this), eventData.price),
            "Token transfer failed"
        );
        
        eventData.currentParticipants++;
        studentEvents[msg.sender].push(eventId);
        hasJoinedEvent[msg.sender][eventId] = true;
        
        emit EventJoined(eventId, msg.sender);
        emit TokensSpent(msg.sender, eventData.price, "Event participation");
    }
    
    /**
     * @dev Create a new certification
     * @param name Certification name
     * @param description Certification description
     * @param price Token price
     * @param certHash IPFS hash for certification details
     */
    function createCertification(
        string memory name,
        string memory description,
        uint256 price,
        string memory certHash
    ) external onlyOwner {
        require(bytes(name).length > 0, "Certification name required");
        require(price > 0, "Price must be greater than 0");
        
        uint256 certId = nextCertId++;
        
        certifications[certId] = Certification({
            certId: certId,
            name: name,
            description: description,
            price: price,
            isActive: true,
            certHash: certHash,
            createdAt: block.timestamp
        });
        
        emit CertificationCreated(certId, name, price);
    }
    
    /**
     * @dev Purchase a certification
     * @param certId Certification ID to purchase
     */
    function purchaseCertification(uint256 certId) external nonReentrant {
        Certification storage cert = certifications[certId];
        require(cert.certId != 0, "Certification does not exist");
        require(cert.isActive, "Certification is not active");
        
        // Transfer tokens
        require(
            vieVerseToken.transferFrom(msg.sender, address(this), cert.price),
            "Token transfer failed"
        );
        
        studentCertifications[msg.sender].push(certId);
        
        emit CertificationPurchased(certId, msg.sender);
        emit TokensSpent(msg.sender, cert.price, "Certification purchase");
    }
    
    /**
     * @dev Get student enrollments
     * @param student Student address
     * @return Array of course IDs
     */
    function getStudentEnrollments(address student) external view returns (uint256[] memory) {
        return studentEnrollments[student];
    }
    
    /**
     * @dev Get student rewards
     * @param student Student address
     * @return Array of reward IDs
     */
    function getStudentRewards(address student) external view returns (uint256[] memory) {
        return studentRewards[student];
    }
    
    /**
     * @dev Get student events
     * @param student Student address
     * @return Array of event IDs
     */
    function getStudentEvents(address student) external view returns (uint256[] memory) {
        return studentEvents[student];
    }
    
    /**
     * @dev Get student certifications
     * @param student Student address
     * @return Array of certification IDs
     */
    function getStudentCertifications(address student) external view returns (uint256[] memory) {
        return studentCertifications[student];
    }
    
    /**
     * @dev Get enrollment details
     * @param courseId Course ID
     * @param student Student address
     * @return Enrollment details
     */
    function getEnrollment(uint256 courseId, address student) external view returns (Enrollment memory) {
        return enrollments[courseId][student];
    }
    
    /**
     * @dev Withdraw collected tokens (only owner)
     * @param amount Amount to withdraw
     */
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount <= vieVerseToken.balanceOf(address(this)), "Insufficient balance");
        require(vieVerseToken.transfer(owner(), amount), "Transfer failed");
    }
    
    /**
     * @dev Update course status (only owner)
     * @param courseId Course ID
     * @param isActive New status
     */
    function updateCourseStatus(uint256 courseId, bool isActive) external onlyOwner {
        require(courses[courseId].courseId != 0, "Course does not exist");
        courses[courseId].isActive = isActive;
    }
    
    /**
     * @dev Update reward status (only owner)
     * @param rewardId Reward ID
     * @param isActive New status
     */
    function updateRewardStatus(uint256 rewardId, bool isActive) external onlyOwner {
        require(rewards[rewardId].rewardId != 0, "Reward does not exist");
        rewards[rewardId].isActive = isActive;
    }
    
    /**
     * @dev Update event status (only owner)
     * @param eventId Event ID
     * @param isActive New status
     */
    function updateEventStatus(uint256 eventId, bool isActive) external onlyOwner {
        require(events[eventId].eventId != 0, "Event does not exist");
        events[eventId].isActive = isActive;
    }
    
    /**
     * @dev Update certification status (only owner)
     * @param certId Certification ID
     * @param isActive New status
     */
    function updateCertificationStatus(uint256 certId, bool isActive) external onlyOwner {
        require(certifications[certId].certId != 0, "Certification does not exist");
        certifications[certId].isActive = isActive;
    }
} 