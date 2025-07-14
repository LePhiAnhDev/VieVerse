# 📚 VieVerse API Endpoints Documentation

## 🏗️ **Architecture Overview**

VieVerse có 2 services chính:

- **Backend Service** (Port 5000): Quản lý user authentication, database operations, là trung gian duy nhất giao tiếp với Blockchain Service
- **Blockchain Service** (Port 5001): Chỉ backend gọi, không public cho frontend

> **Lưu ý:** FE chỉ gọi BE (port 5000). Không được gọi trực tiếp Blockchain Service (port 5001) từ frontend.

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
