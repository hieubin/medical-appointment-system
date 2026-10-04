#!/bin/bash
# Chạy: bash scripts/setup.sh
# Hoặc: ./scripts/setup.sh (sau khi chmod +x)

set -e

echo "==> 1. Build & start containers..."
docker compose up --build -d

echo "==> 2. Chờ PostgreSQL healthy..."
until docker compose exec -T postgres pg_isready -U postgres -d medical_appointment > /dev/null 2>&1; do
  sleep 1
done

echo "==> 3. Generate Prisma client..."
docker compose exec -T backend npx prisma generate

echo "==> 4. Push schema xuống DB..."
docker compose exec -T backend npx prisma db push --accept-data-loss

echo "==> 5. Seed dữ liệu..."
docker compose exec -T backend npx prisma db seed

echo ""
echo "==> Xong!"
echo "   Frontend : http://localhost:3000"
echo "   Backend  : http://localhost:4000"
echo "   pgAdmin  : http://localhost:5050"
echo ""
echo "   Account:"
echo "   admin@clinic.test    / Admin123!"
echo "   staff@clinic.test    / Staff123!"
echo "   patient@clinic.test  / Patient123!"
