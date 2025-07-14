## Run database in docker
```
docker-compose up -d
```

## Create file .env in backend/
```
# ───── Environment ─────
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# ───── Database Configuration ─────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vieverse
DB_USER=postgres
DB_PASSWORD=password

# Optional: Full database URL (used by some ORMs like Prisma, Sequelize, etc.)
DATABASE_URL=postgresql://postgres:password@localhost:5432/vieverse

# ───── JWT Authentication ─────
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# ───── Internal Service Access ─────
INTERNAL_SERVICE_KEY=vieverse_internal_key
INTERNAL_SERVICE_IPS=127.0.0.1,192.168.1.100
```

## Create file .env in blockchain/
```
# ───── Blockchain Network Configuration ─────
SEPOLIA_URL=https://sepolia.infura.io/v3/<your_infura_project_id>
MAINNET_URL=https://mainnet.infura.io/v3/<your_infura_project_id>
INFURA_URL=https://sepolia.infura.io/v3/<your_infura_project_id>

# ───── Private Key (Use environment secrets manager in production) ─────
PRIVATE_KEY=<your_private_key_here>

# ───── Etherscan API Key ─────
ETHERSCAN_API_KEY=<your_etherscan_api_key_here>

# ───── Gas Reporter Configuration ─────
REPORT_GAS=true

# ───── Internal Service Configuration ─────
BLOCKCHAIN_SERVICE_PORT=5001
INTERNAL_SERVICE_KEY=<your_internal_service_key_here>
MAIN_BACKEND_IPS=127.0.0.1

# ───── Pinata (IPFS Upload Service) ─────
PINATA_API_KEY=<your_pinata_api_key_here>
PINATA_API_SECRET=<your_pinata_api_secret_key_here>

# ───── Environment Mode ─────
NODE_ENV=test
```

## Run blockchain
```
cd blockchain
npm install
npx hardhat run scripts/deploy.js --network sepolia
npm run start:service
```

## Run backend
```
cd backend
npm install
npm run dev
```

## Run frontend
```
cd frontend
npm install 
npm run dev
```
