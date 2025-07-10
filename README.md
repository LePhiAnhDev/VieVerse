# VieVerse - Student Networking Platform

Một nền tảng mạng xã hội dành cho sinh viên, kết nối với các doanh nghiệp để thực hiện các nhiệm vụ freelance và thực tập, với hệ thống token blockchain.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Tasks
- `GET /api/tasks` - Lấy danh sách nhiệm vụ (với filter, pagination)
- `GET /api/tasks/:id` - Lấy chi tiết nhiệm vụ
- `POST /api/tasks` - Tạo nhiệm vụ (Company)
- `PUT /api/tasks/:id` - Cập nhật nhiệm vụ
- `DELETE /api/tasks/:id` - Xóa nhiệm vụ
- `POST /api/tasks/:id/apply` - Ứng tuyển
- `PUT /api/tasks/:id/applications/:appId` - Duyệt ứng tuyển
- `POST /api/tasks/:id/submit` - Nộp bài
- `POST /api/tasks/:id/complete` - Xác nhận hoàn thành

### Users
- `GET /api/users/dashboard` - Dashboard data
- `GET /api/users/profile/:id` - Xem profile người khác

## Cài đặt và chạy dự án

### Prerequisites
- Node.js 
- Docker & Docker Compose

### 1. Clone repository
```bash
git clone [repo-link]
cd VieVerse
```

### 2. Cài đặt dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Cấu hình môi trường

**Backend (.env):**
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=VieVerse
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### 4. Chạy database
```bash
docker-compose up -d
```

### 5. Chạy ứng dụng

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Database Schema

### Users
- Thông tin chung: email, password, name, role, avatar
- Sinh viên: university, major, skills, tokens
- Doanh nghiệp: company_name, industry, description, website

### Tasks
- Thông tin cơ bản: title, description, requirements
- Cấu hình: skills_required, reward_tokens, deadline, difficulty
- Trạng thái: status, max_applicants, location

### Applications
- Liên kết: task_id, student_id
- Theo dõi: status, cover_letter, work_submission
- Timestamps: applied_at, reviewed_at, completed_at

## License

This project is licensed under the Apache-2.0 license.
