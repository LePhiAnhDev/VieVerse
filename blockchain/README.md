# VieVerse Blockchain Platform

VieVerse là nền tảng blockchain kết nối sinh viên và doanh nghiệp thông qua các nhiệm vụ thực tế, xác thực minh bạch, thưởng token và hệ thống uy tín. Dưới đây là hướng dẫn sử dụng, triển khai và tích hợp 3 smart contract chính của hệ thống.

## Smart Contracts

### 1. VieVerseToken (ERC-20)

- Token phần thưởng cho sinh viên khi hoàn thành nhiệm vụ.
- Có thể mint, burn, transfer.

### 2. VieVerseTaskVerification

- Quản lý nhiệm vụ (task), xác thực, chấm điểm, phát thưởng tự động.
- Hệ thống điểm uy tín (reputation) cho sinh viên.
- Bảo mật: chống reentrancy, kiểm soát truy cập, rate limit, emergency stop.

### 3. VieVerseTokenUtility

- Cho phép sinh viên sử dụng token để mua khoá học, đổi phần thưởng, tham gia sự kiện, nhận chứng chỉ.
- Quản lý event, course, reward, certification.

## Tính Năng Chính

- **Tạo & xác thực nhiệm vụ thực chiến** giữa doanh nghiệp và sinh viên.
- **Phát thưởng token tự động** khi hoàn thành nhiệm vụ.
- **Điểm uy tín minh bạch, không thể chỉnh sửa** (on-chain).
- **Đổi token lấy khoá học, phần thưởng, sự kiện, chứng chỉ.**
- **Tích hợp IPFS lưu trữ sản phẩm, feedback, portfolio thực chiến.**

## Hướng Dẫn Deploy

### 1. Cài đặt

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` dựa trên `env.example` và điền thông tin:

```
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_private_key_here
```

### 3. Deploy lên Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Sau khi deploy, thông tin địa chỉ và ABI contract sẽ được lưu ở file:

```
deployed-contracts.json
```

### 4. Lấy địa chỉ & ABI contract

Ví dụ nội dung file `deployed-contracts.json`:

```json
{
  "VieVerseToken": {
    "address": "0x...",
    "abi": [ ... ]
  },
  "VieVerseTaskVerification": {
    "address": "0x...",
    "abi": [ ... ]
  },
  "VieVerseTokenUtility": {
    "address": "0x...",
    "abi": [ ... ]
  }
}
```

## Ví dụ sử dụng contract

### Tạo nhiệm vụ mới (company)

```js
await contract.createTask(
  "Thiết kế landing page",
  "Thiết kế giao diện cho sản phẩm mới",
  ethers.parseEther("10"),
  deadlineTimestamp
);
```

### Sinh viên nhận và nộp bài

```js
await contract.acceptTask(taskId);
await contract.submitTask(taskId, "QmIPFSHash");
```

### Doanh nghiệp xác thực & chấm điểm

```js
await contract.verifyTask(taskId, 90, 95, 100, "Làm rất tốt!");
```

### Đổi token lấy khoá học/sự kiện

```js
await tokenUtility.redeemReward(rewardId);
await tokenUtility.joinEvent(eventId);
```

## Kiểm thử

```bash
npm run test
```

## Bảo mật & tối ưu

- Sử dụng OpenZeppelin, kiểm soát truy cập chặt chẽ.
- Chống reentrancy, kiểm soát rate limit, emergency stop.
- Test coverage cao, kiểm tra mọi logic quan trọng.

## Đóng góp

- Fork repo, tạo branch mới, thêm test, gửi pull request.

## License

MIT License
