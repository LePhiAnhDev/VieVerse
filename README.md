# VieVerse - Blockchain-Powered Student-Company Platform

VieVerse là một nền tảng kết nối sinh viên và doanh nghiệp thông qua công nghệ blockchain, cho phép tạo và quản lý các nhiệm vụ thực tế với hệ thống token và reputation.

## 🚀 Tính năng chính

### Cho Sinh viên
- Đăng ký và tạo hồ sơ trên blockchain
- Tìm kiếm và ứng tuyển vào các nhiệm vụ
- Nhận token thưởng khi hoàn thành nhiệm vụ
- Xây dựng reputation score
- Tham gia các khóa học và sự kiện

### Cho Doanh nghiệp
- Đăng ký và xác minh trên blockchain
- Tạo và quản lý nhiệm vụ
- Tìm kiếm tài năng trẻ
- Đánh giá và thưởng token cho sinh viên
- Theo dõi hiệu suất dự án

### Hệ thống Blockchain
- Smart contracts cho quản lý user, task, token
- Hệ thống reputation và verification
- Token VVT (VieVerse Token) cho thưởng
- IPFS integration cho lưu trữ file
- Gas optimization và retry mechanisms

## 🏗️ Kiến trúc hệ thống

```
VieVerse/
├── frontend/          # React + Vite frontend
├── backend/           # Express.js API server
├── blockchain/        # Hardhat + Smart contracts + Service
│   ├── contracts/     # Solidity smart contracts
│   ├── service/       # Blockchain API service
│   └── test/          # Contract tests
└── docker-compose.yml # Docker configuration
```

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** + **Lucide React**
- **React Router** + **React Query**
- **Web3.js** + **MetaMask integration**

### Backend
- **Node.js** + **Express.js**
- **Sequelize ORM** + **PostgreSQL**
- **JWT Authentication**
- **Rate limiting** + **Security middleware**


### Blockchain
- **Hardhat** + **Ethers.js**
- **Solidity** smart contracts
- **Sepolia Testnet**
- **IPFS** (Pinata) integration

## 🔧 Smart Contracts

### VieVerseTaskVerification
- Quản lý đăng ký user (student/company)
- Tạo và quản lý nhiệm vụ
- Hệ thống verification và reputation

### VieVerseToken (VVT)
- ERC-20 token cho thưởng
- Mint/burn functionality
- Transfer và balance tracking

### VieVerseTokenUtility
- Khóa học và sự kiện
- Certification system
- Reward redemption

## 📡 API Endpoints

### Backend API (Port 5000)
- `POST /api/auth/register` - Đăng ký user
- `POST /api/auth/login` - Đăng nhập
- `GET /api/users/dashboard` - Dashboard data
- `GET /api/tasks` - Danh sách nhiệm vụ

### Blockchain API (Port 5001)
- `POST /api/student/register` - Đăng ký student
- `POST /api/company/register` - Đăng ký company
- `POST /api/task/create` - Tạo nhiệm vụ
- `GET /api/token/balance/:address` - Token balance
- `GET /api/reputation/:address` - Reputation score

## 🧪 Testing

### Smart Contract Tests
```bash
cd blockchain
npm test
```

### API Tests
```bash
cd backend
npm test
```

## 🚀 Deployment

### Docker
```bash
docker-compose up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Start backend: `cd backend && npm start`
3. Start blockchain service: `cd blockchain && npm run start:service`

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.


## Create file .env for API on Frontend
VITE_API_URL=http://localhost:5000
## Create file .env for API on Backend
##SET MAIL OTP (SMTP)
`MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=studentchain.dev@gmail.com
MAIL_PASS=erhv frkx okeq dygq`
## Install nodemailer for Verify Email Link on Backend
```bash
npm install 
npm install nodemailer
```

