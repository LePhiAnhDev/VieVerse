# 📚 VieVerse API Endpoints Documentation

## 🏗️ **Architecture Overview**

VieVerse có 2 services chính:

- **Backend Service** (Port 5000): Quản lý user authentication, database operations
- **Blockchain Service** (Port 5001): Quản lý smart contract interactions, blockchain operations

---

## 🔐 **Backend Service Endpoints**

**Base URL:** `http://localhost:5000`

### **Authentication Endpoints**

#### **POST** `/api/auth/register`

Đăng ký user mới

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "User Name",
  "role": "student", // "student" hoặc "company"

  // Nếu role = "student":
  "university": "University Name",
  "major": "Computer Science",
  "skills": ["JavaScript", "React"],
  "phone": "+84123456789",

  // Nếu role = "company":
  "company_name": "Company Name",
  "industry": "Technology",
  "description": "Company description",
  "website": "https://company.com",
  "phone": "+84123456789"
}
```

#### **POST** `/api/auth/login`

Đăng nhập

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

#### **GET** `/api/auth/profile`

Lấy thông tin profile (cần Bearer token)

```
Headers: Authorization: Bearer <token>
```

#### **PUT** `/api/auth/profile`

Cập nhật profile (cần Bearer token)

```json
{
  "name": "New Name",
  "phone": "+84987654321"
  // Các field khác tùy theo role
}
```

#### **PUT** `/api/auth/change-password`

Đổi password (cần Bearer token)

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### **User Management Endpoints**

#### **GET** `/api/users/dashboard`

Lấy dashboard data (cần Bearer token)

#### **GET** `/api/users/profile/:id`

Lấy public profile của user khác

#### **GET** `/api/users/search`

Tìm kiếm users

```
Query params:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- role: "student" | "company"
- skills: string (comma-separated)
- university: string
- industry: string
```

#### **GET** `/api/users/token-history`

Lấy lịch sử token transactions (cần Bearer token)

#### **GET** `/api/users/applications`

Lấy danh sách applications (cần Bearer token)

```
Query params:
- status: "pending" | "accepted" | "rejected" | "withdrawn"
- page: number
- limit: number
```

### **Task Management Endpoints**

#### **GET** `/api/tasks`

Lấy danh sách tasks

```
Query params:
- page: number (default: 1)
- limit: number (default: 10, max: 100)
- status: "open" | "in_progress" | "completed" | "cancelled"
- difficulty: "beginner" | "intermediate" | "advanced"
- category: string
- skills: string (comma-separated)
- min_reward: number
- max_reward: number
```

#### **GET** `/api/tasks/:id`

Lấy chi tiết task

#### **POST** `/api/tasks`

Tạo task mới (cần Bearer token, role: company)

```json
{
  "title": "Task Title",
  "description": "Task description",
  "requirements": "Task requirements",
  "skills_required": ["JavaScript", "React"],
  "reward_tokens": 100,
  "deadline": "2024-12-31T23:59:59Z",
  "difficulty": "intermediate",
  "category": "Web Development",
  "max_applicants": 5
}
```

#### **PUT** `/api/tasks/:id`

Cập nhật task (cần Bearer token, chỉ owner)

#### **DELETE** `/api/tasks/:id`

Xóa task (cần Bearer token, chỉ owner)

#### **POST** `/api/tasks/:id/apply`

Apply vào task (cần Bearer token, role: student)

```json
{
  "cover_letter": "Why I'm suitable for this task"
}
```

#### **POST** `/api/tasks/:id/review-application`

Review application (cần Bearer token, chỉ task owner)

```json
{
  "application_id": "uuid",
  "status": "accepted", // "accepted" | "rejected"
  "feedback": "Feedback message"
}
```

#### **POST** `/api/tasks/:id/submit`

Submit work (cần Bearer token, chỉ assigned student)

```json
{
  "submission_url": "https://github.com/user/repo",
  "notes": "Submission notes"
}
```

#### **POST** `/api/tasks/:id/confirm`

Confirm completion (cần Bearer token, chỉ task owner)

```json
{
  "rating": 5, // 1-5
  "feedback": "Great work!"
}
```

#### **GET** `/api/tasks/my-tasks`

Lấy tasks của user hiện tại (cần Bearer token)

### **Health Check**

#### **GET** `/api/health`

Check backend service status

---

## ⛓️ **Blockchain Service Endpoints**

**Base URL:** `http://localhost:5001`

### **Task Operations**

#### **POST** `/api/tasks/create`

Tạo task trên blockchain

```json
{
  "title": "Blockchain Task",
  "description": "Task description",
  "reward": "1000000000000000000", // Wei format (1 VVT)
  "deadline": 1735689599 // Unix timestamp
}
```

#### **POST** `/api/tasks/accept`

Accept task

```json
{
  "taskId": 1
}
```

#### **POST** `/api/tasks/submit`

Submit task

```json
{
  "taskId": 1,
  "submissionHash": "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

#### **POST** `/api/tasks/verify`

Verify task (chỉ moderator)

```json
{
  "taskId": 1,
  "qualityScore": 85,
  "deadlineScore": 90,
  "attitudeScore": 95,
  "feedback": "Excellent work!"
}
```

#### **GET** `/api/tasks/:taskId`

Lấy thông tin task từ blockchain

#### **GET** `/api/tasks/company/:address`

Lấy tasks của company

#### **GET** `/api/tasks/student/:address`

Lấy tasks của student

### **Token Operations**

#### **GET** `/api/tokens/balance/:address`

Lấy token balance

#### **POST** `/api/tokens/mint`

Mint tokens (chỉ owner)

```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "amount": "1000000000000000000"
}
```

#### **POST** `/api/tokens/burn`

Burn tokens

```json
{
  "from": "0x1234567890123456789012345678901234567890",
  "amount": "1000000000000000000"
}
```

#### **GET** `/api/tokens/supply`

Lấy total supply

#### **GET** `/api/tokens/info`

Lấy token information

### **Company Operations**

#### **GET** `/api/company/:address`

Lấy thông tin company

#### **POST** `/api/company/register`

Đăng ký company trên blockchain

```json
{
  "name": "Company Name",
  "description": "Company description",
  "address": "0x1234567890123456789012345678901234567890"
}
```

### **Student Operations**

#### **GET** `/api/student/:address`

Lấy thông tin student

#### **POST** `/api/student/register`

Đăng ký student trên blockchain

```json
{
  "name": "Student Name",
  "skills": "JavaScript, React, Node.js",
  "address": "0x1234567890123456789012345678901234567890"
}
```

#### **GET** `/api/student/reputation/:address`

Lấy reputation score

### **IPFS Operations**

#### **POST** `/api/ipfs/upload`

Upload file lên IPFS (multipart/form-data)

```
Form data:
- file: File object
```

#### **POST** `/api/ipfs/upload-json`

Upload JSON lên IPFS

```json
{
  "data": "any JSON object",
  "metadata": {
    "name": "file name",
    "description": "file description"
  }
}
```

#### **GET** `/api/ipfs/:hash`

Lấy file từ IPFS hash

### **Gas Operations**

#### **GET** `/api/gas/analysis`

Lấy gas price analysis

#### **POST** `/api/gas/estimate`

Estimate gas cho transaction

```json
{
  "contract": "verification", // "verification" | "token" | "utility"
  "method": "createTask",
  "args": ["Task Title", "Description", "1000000000000000000", 1735689599],
  "options": {
    "bufferPercentage": 20,
    "maxGasLimit": 1000000
  }
}
```

#### **GET** `/api/gas/defaults`

Lấy default gas limits

### **Utility Operations**

#### **POST** `/api/utility/course/enroll`

Enroll vào course

```json
{
  "courseId": 1,
  "student": "0x1234567890123456789012345678901234567890"
}
```

#### **POST** `/api/utility/reward/redeem`

Redeem reward

```json
{
  "rewardId": 1,
  "student": "0x1234567890123456789012345678901234567890"
}
```

#### **GET** `/api/utility/student/:address/enrollments`

Lấy enrollments của student

### **Health Check**

#### **GET** `/health`

Check blockchain service status

---

## 🔧 **Authentication Headers**

Đối với các endpoint cần authentication (Backend service):

```
Authorization: Bearer <JWT_TOKEN>
```

Đối với internal calls giữa Backend và Blockchain service:

```
x-internal-key: <INTERNAL_SERVICE_KEY>
```

---

## 📝 **Response Format**

### **Success Response**

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### **Error Response**

```json
{
  "success": false,
  "error": "Error message",
  "type": "validation", // "validation" | "auth" | "not_found" | "blockchain" | "network"
  "details": { ... } // Optional error details
}
```

---

## 🚀 **Usage Examples**

### **Frontend Login Flow**

```javascript
// 1. Login
const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "Password123",
  }),
});

const { token } = await loginResponse.json();

// 2. Get user profile
const profileResponse = await fetch("http://localhost:5000/api/auth/profile", {
  headers: { Authorization: `Bearer ${token}` },
});

const profile = await profileResponse.json();
```

### **Create Task Flow**

```javascript
// 1. Create task in backend
const backendTask = await fetch("http://localhost:5000/api/tasks", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "Build a React App",
    description: "Create a todo app using React",
    reward_tokens: 100,
    deadline: "2024-12-31T23:59:59Z",
    skills_required: ["React", "JavaScript"],
  }),
});

// 2. Create task on blockchain (if needed)
const blockchainTask = await fetch("http://localhost:5001/api/tasks/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Build a React App",
    description: "Create a todo app using React",
    reward: "100000000000000000000", // 100 VVT in wei
    deadline: Math.floor(new Date("2024-12-31").getTime() / 1000),
  }),
});
```

### **Check Token Balance**

```javascript
const balance = await fetch(
  `http://localhost:5001/api/tokens/balance/${userAddress}`
);
const balanceData = await balance.json();
console.log(`Balance: ${balanceData.balance} VVT`);
```

---

## ⚠️ **Important Notes**

1. **Environment URLs**: Thay đổi `localhost` thành domain thực tế khi deploy
2. **Token Format**: Blockchain amounts sử dụng Wei format (18 decimals)
3. **Address Format**: Ethereum addresses phải có format `0x` + 40 hex characters
4. **File Upload**: IPFS uploads trả về hash có thể dùng để lưu trữ metadata
5. **Gas Optimization**: Luôn estimate gas trước khi thực hiện transaction
6. **Error Handling**: Check `success` field trong response trước khi xử lý data

---

## 🔗 **Related Services**

- **Database**: PostgreSQL (Backend data)
- **Blockchain**: Sepolia Testnet
- **File Storage**: IPFS via Pinata
- **Authentication**: JWT tokens
