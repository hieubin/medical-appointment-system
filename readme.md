# medical-appointment-system

## Cấu trúc

```
reactjs/                      # React + Vite
  src/
    api/axios.js
    assets/
    components/
    context/
    pages/patient | admin
    styles/
    App.jsx

expressjs/                    # Express MVC + Prisma + SQLite
  prisma/
    schema.prisma             # SQLite database schema
    data/medical.db           # SQLite database file (gitignored)
  src/
    config/
    models/
    views/
    controllers/
    services/
    middleware/
    routes/
    app.js
    server.js
```

## Chạy cả project

### Cách 1: Docker (khuyến nghị - deploy Render)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api/health
- Database: SQLite file `./expressjs/data/medical.db`

### Cách 2: Local (Node.js)

```bash
# Backend
cd expressjs
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (terminal khác)
cd reactjs
npm install
npm run dev
```

## Deploy Render (SQLite persistent)

1. Tạo repo trên GitHub
2. Connect GitHub → Render
3. Tạo Web Service cho backend:
   - Root Directory: `expressjs`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `node src/server.js`
   - Environment: Node
4. Tạo persistent disk `medical-data` (1GB)
5. Set environment variable: `DATABASE_URL=file:/app/data/medical.db`
6. Deploy!

## Test

```bash
# Database tests (SQLite CRUD)
cd expressjs
node test-db.mjs

# E2E interface tests (Playwright)
cd tests
npm install
npx playwright install chromium
node test.mjs
```

## Database

- **Provider**: SQLite (file-based, no external service)
- **Location**: `expressjs/data/medical.db`
- **Prisma**: ORM với schema đơn giản, không cần migration server
- **Deploy**: Render persistent disk giữ data giữa các lần restart

### Các bảng

| Table | Mô tả |
|-------|--------|
| User | Tài khoản (admin, staff, patient) |
| Doctor | Thông tin bác sĩ |
| Specialty | Chuyên khoa |
| Service | Dịch vụ khám |
| Appointment | Lịch hẹn |
| WorkingSchedule | Lịch làm việc |
| ScheduleException | Ngày nghỉ/giờ đặc biệt |

---

## Setup nhanh máy mới

**PowerShell (Windows):**
```powershell
.\scripts\setup.ps1
```

**Bash (Linux/Mac/WSL):**
```bash
bash scripts/setup.sh
```

---

Production: `docker compose -f docker-compose.prod.yml up --build`
