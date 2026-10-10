# Hệ Thống Đặt Lịch Khám Bệnh (Medical Appointment System)

Dự án website đặt lịch khám bệnh trực tuyến được xây dựng với kiến trúc Client-Server hiện đại:
- **Frontend**: React 19, Vite, TailwindCSS, Lucide Icons, React Hook Form, Zustand, Axios.
- **Backend**: Node.js, Express.js (kiến trúc MVC), Prisma ORM.
- **Cơ sở dữ liệu**: SQLite (file-based lưu trữ cục bộ, gọn nhẹ, không phụ thuộc service ngoài).

---

## 1. Cấu trúc thư mục dự án

```text
medical-appointment-system/
├── expressjs/                      # Backend (Express.js + Prisma + SQLite)
│   ├── prisma/
│   │   ├── schema.prisma           # Định nghĩa cấu trúc database Prisma
│   │   ├── seed.js                 # Script nạp dữ liệu khởi tạo (bác sĩ, dịch vụ, tài khoản)
│   │   └── data/medical.db         # File cơ sở dữ liệu SQLite
│   └── src/
│       ├── config/                 # Cấu hình môi trường, Prisma client, JWT
│       ├── controllers/            # Xử lý request & response HTTP
│       ├── middleware/             # Xác thực auth, phân quyền, validate Zod, logging
│       ├── routes/                 # Định tuyến API (/api/auth, /api/appointments, ...)
│       ├── schemas/                # Zod schema validation
│       ├── services/               # Nghiệp vụ logic chính của hệ thống
│       ├── app.js                  # Khởi tạo Express app & gắn middleware
│       └── server.js               # Điểm khởi động server
│
├── reactjs/                        # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── api/                    # Cấu hình Axios client
│   │   ├── components/             # UI Components (Navbar, BookingModal, Admin Shell, ...)
│   │   ├── context/                # AuthContext quản lý phiên đăng nhập
│   │   ├── pages/                  # Trang người bệnh (Patient Portal) & Quản trị (Admin)
│   │   ├── styles/                 # CSS toàn cục
│   │   ├── App.jsx                 # Component gốc & Router
│   │   └── main.jsx                # Điểm khởi động React
│   └── vite.config.js              # Cấu hình Vite & Proxy /api sang backend
│
└── scripts/                        # Script tiện ích thiết lập nhanh môi trường
    ├── setup.ps1                   # Khởi tạo tự động cho Windows PowerShell
    └── setup.sh                    # Khởi tạo tự động cho Linux / macOS / WSL
```

> **Lưu ý:** Toàn bộ các mã nguồn test tự động cũ (Playwright, Selenium, scripts test độc lập) đã được dọn sạch để dự án gọn gàng, tập trung tối đa vào mã nguồn chạy thực tế.

---

## 2. Hướng dẫn chạy dự án trên máy Local

Dự án hiện chạy hoàn toàn trên môi trường **Node.js Local** sử dụng **SQLite**, không cần Docker, PostgreSQL hay pgAdmin.

### Yêu cầu môi trường
- Đã cài đặt **Node.js** (khuyến nghị phiên bản 18.x trở lên).
- **npm** (đi kèm Node.js).

---

### Cách 1: Thiết lập tự động bằng Script (Khuyến nghị cho máy mới)

- **Trên Windows (PowerShell):**
  ```powershell
  .\scripts\setup.ps1
  ```

- **Trên Linux / macOS / WSL:**
  ```bash
  bash scripts/setup.sh
  ```

Script sẽ tự động cài đặt `node_modules` cho cả 2 thư mục, sinh Prisma Client, cập nhật schema và nạp sẵn dữ liệu mẫu vào SQLite.

---

### Cách 2: Thiết lập thủ công từng bước

#### Bước 1: Khởi động Backend (Terminal 1)
```bash
cd expressjs

# Cài đặt thư viện
npm install

# Sinh Prisma Client
npx prisma generate

# Tạo bảng dữ liệu vào file SQLite
npx prisma db push

# (Tùy chọn) Nạp dữ liệu mẫu ban đầu nếu mới khởi tạo DB
npm run prisma:seed

# Khởi chạy server backend
npm run dev
```
👉 Backend sẽ chạy tại: **`http://localhost:4000`**  
👉 Kiểm tra trạng thái API: **`http://localhost:4000/api/health`**

#### Bước 2: Khởi động Frontend (Terminal 2)
```bash
cd reactjs

# Cài đặt thư viện
npm install

# Khởi chạy dev server
npm run dev
```
👉 Frontend sẽ chạy tại: **`http://localhost:3000`**

*(Frontend đã được cấu hình proxy tự động chuyển tiếp toàn bộ request bắt đầu bằng `/api` sang `http://localhost:4000`, không lo bị lỗi CORS).*

---

## 3. Tài khoản đăng nhập mẫu (Demo Accounts)

Sau khi seed dữ liệu (`npm run prisma:seed`), hệ thống có sẵn các tài khoản sau:

| Vai trò | Email | Mật khẩu | Mô tả chức năng |
|---|---|---|---|
| **Admin** | `admin@clinic.test` | `Admin123!` | Tài khoản có sẵn, duyệt lịch hẹn và quản lý bác sĩ, chuyên khoa, dịch vụ |
| **Patient** | `patient@clinic.test` | `Patient123!` | Bệnh nhân tự đăng ký để đặt lịch và theo dõi lịch khám |

---

## 4. Quản lý Cơ sở dữ liệu (SQLite & Prisma)

- **File Database:** Được lưu tại `expressjs/prisma/data/medical.db`.
- **Xem và sửa dữ liệu trực quan bằng Prisma Studio (GUI):**
  ```bash
  cd expressjs
  npx prisma studio
  ```
  *(Mở trình duyệt tại `http://localhost:5555` để xem toàn bộ bảng và dữ liệu)*

### Danh sách các bảng chính:
- `User`: Tài khoản người dùng (Admin, Staff, Patient, Doctor).
- `Doctor`: Hồ sơ bác sĩ (học vị, kinh nghiệm, chuyên khoa).
- `Specialty`: Danh mục chuyên khoa y tế.
- `Service`: Danh mục dịch vụ khám & giá tiền.
- `Appointment`: Thông tin phiếu đặt lịch hẹn khám của bệnh nhân.
- `WorkingSchedule`: Khung giờ làm việc theo ngày trong tuần của bác sĩ.
- `ScheduleException`: Lịch nghỉ phép hoặc lịch làm việc đột xuất.

---

## 5. Lưu ý khi Deploy lên Render (Production)

Vì hệ thống sử dụng SQLite (file-based):
1. Khi triển khai Backend lên Render (Web Service), cần gắn thêm **Render Persistent Disk** (ví dụ mount tại `/app/data`).
2. Thiết lập biến môi trường trên Render:
   - `NODE_ENV=production`
   - `PORT=4000`
   - `DATABASE_URL=file:/app/data/medical.db`
   - `JWT_SECRET=your_jwt_secret_key`
3. Nhờ Persistent Disk, file cơ sở dữ liệu `medical.db` sẽ được giữ nguyên vẹn qua các lần khởi động lại hoặc deploy mới.
