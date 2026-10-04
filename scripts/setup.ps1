# Chạy: .\scripts\setup.ps1
# Yêu cầu: Docker Desktop đang chạy

$ErrorActionPreference = "Stop"

Write-Host "==> 1. Build & start containers..." -ForegroundColor Cyan
docker compose up --build -d

Write-Host "==> 2. Chờ PostgreSQL healthy..." -ForegroundColor Cyan
$maxWait = 60
$elapsed = 0
while ($elapsed -lt $maxWait) {
    $ready = docker compose exec -T postgres pg_isready -U postgres -d medical_appointment 2>$null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
    $elapsed++
}
if ($elapsed -ge $maxWait) {
    Write-Host "[ERROR] PostgreSQL không sẵn sàng sau $maxWait giây." -ForegroundColor Red
    exit 1
}

Write-Host "==> 3. Generate Prisma client..." -ForegroundColor Cyan
docker compose exec -T backend npx prisma generate

Write-Host "==> 4. Push schema xuống DB..." -ForegroundColor Cyan
docker compose exec -T backend npx prisma db push --accept-data-loss

Write-Host "==> 5. Seed dữ liệu..." -ForegroundColor Cyan
docker compose exec -T backend npx prisma db seed

Write-Host ""
Write-Host "==> Xong!" -ForegroundColor Green
Write-Host "   Frontend : http://localhost:3000"
Write-Host "   Backend  : http://localhost:4000"
Write-Host "   pgAdmin  : http://localhost:5050"
Write-Host ""
Write-Host "   Account:"
Write-Host "   admin@clinic.test    / Admin123!"
Write-Host "   staff@clinic.test    / Staff123!"
Write-Host "   patient@clinic.test  / Patient123!"
