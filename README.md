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

## 📦 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd VieVerse
```

### 2. Cài đặt dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Blockchain
cd blockchain && npm install
```

### 3. Cấu hình environment variables

#### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/vieverse
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

#### Blockchain Service (.env)
```env
BLOCKCHAIN_SERVICE_PORT=5001
SEPOLIA_URL=https://sepolia.infura.io/v3/your-infura-key
PRIVATE_KEY=your-private-key
INTERNAL_SERVICE_KEY=your-internal-key
PINATA_API_KEY=your-pinata-key
PINATA_API_SECRET=your-pinata-secret
```

### 4. Khởi động các service

#### Terminal 1: Backend
```bash
cd backend
npm start
```

#### Terminal 2: Blockchain Service
```bash
cd blockchain
npm run start:service
```

#### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

### 5. Truy cập ứng dụng
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Blockchain Service**: http://localhost:5001

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

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push branch: `git push origin feature/new-feature`
5. Tạo Pull Request

## 📞 Support

- **Email**: support@vieverse.com
- **Documentation**: [API_ENDPOINTS.md](API_ENDPOINTS.md)
- **Issues**: GitHub Issues

---

**VieVerse** - Kết nối tài năng trẻ với cơ hội thực tế! 🚀
