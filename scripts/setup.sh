#!/bin/bash
# Chạy: bash scripts/setup.sh
# Hoặc: ./scripts/setup.sh (sau khi chmod +x)

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "==> 1. Cài đặt dependencies cho Backend (ExpressJS)..."
cd "$DIR/../expressjs"
npm install

echo "==> 2. Khởi tạo Prisma Client cho SQLite..."
npx prisma generate

echo "==> 3. Cập nhật schema vào SQLite Database..."
npx prisma db push

echo "==> 4. Seed dữ liệu mẫu..."
npx prisma db seed

echo "==> 5. Cài đặt dependencies cho Frontend (ReactJS)..."
cd "$DIR/../reactjs"
npm install

cd "$DIR/.."

echo ""
echo "==> Khởi tạo môi trường Local thành công!"
echo "Cách chạy dự án:"
echo "  Terminal 1 (Backend):  cd expressjs && npm run dev   --> http://localhost:4000"
echo "  Terminal 2 (Frontend): cd reactjs && npm run dev     --> http://localhost:3000"
echo ""
echo "Tài khoản đăng nhập demo:"
echo "  - Admin:   admin@clinic.test    / Admin123!"
echo "  - Staff:   staff@clinic.test    / Staff123!"
echo "  - Patient: patient@clinic.test  / Patient123!"
