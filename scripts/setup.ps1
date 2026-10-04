# Chạy: .\scripts\setup.ps1
# Yêu cầu: Đã cài Node.js (>= 18)

$ErrorActionPreference = "Stop"

Write-Host "==> 1. Cài đặt dependencies cho Backend (ExpressJS)..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\expressjs"
npm install

Write-Host "==> 2. Khởi tạo Prisma Client cho SQLite..." -ForegroundColor Cyan
npx prisma generate

Write-Host "==> 3. Cập nhật schema vào SQLite Database..." -ForegroundColor Cyan
npx prisma db push

Write-Host "==> 4. Seed dữ liệu mẫu..." -ForegroundColor Cyan
npx prisma db seed

Write-Host "==> 5. Cài đặt dependencies cho Frontend (ReactJS)..." -ForegroundColor Cyan
Set-Location -Path "$PSScriptRoot\..\reactjs"
npm install

Set-Location -Path "$PSScriptRoot\.."

Write-Host ""
Write-Host "==> Khởi tạo môi trường Local thành công!" -ForegroundColor Green
Write-Host "Cách chạy dự án:"
Write-Host "  Terminal 1 (Backend):  cd expressjs; npm run dev   --> http://localhost:4000"
Write-Host "  Terminal 2 (Frontend): cd reactjs; npm run dev     --> http://localhost:3000"
Write-Host ""
Write-Host "Tài khoản đăng nhập demo:"
Write-Host "  - Admin:   admin@clinic.test    / Admin123!"
Write-Host "  - Staff:   staff@clinic.test    / Staff123!"
Write-Host "  - Patient: patient@clinic.test  / Patient123!"
