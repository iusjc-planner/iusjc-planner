#!/usr/bin/env pwsh
# ============================================================
# build-and-deploy.ps1
# Build tous les microservices Maven localement,
# puis lance docker-compose.
# ============================================================

$ErrorActionPreference = "Stop"

$services = @(
    "iusj-eureka-service",
    "iusj-auth-service",
    "iusj-user-service",
    "iusj-teacher-service",
    "iusj-room-service",
    "iusj-course-service",
    "iusj-schedule-service",
    "iusj-school-service",
    "iusj-group-service",
    "iusj-student-service",
    "iusj-notification-service",
    "iusj-report-service",
    "iusj-resource-service",
    "iusj-event-service",
    "iusj-gateway-service"
)

Write-Host "=== Build des microservices Maven ===" -ForegroundColor Cyan

$failed = @()

foreach ($service in $services) {
    Write-Host "`n--- Building $service ---" -ForegroundColor Yellow
    Push-Location $service
    try {
        mvn clean package -DskipTests --no-transfer-progress -q
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ECHEC: $service" -ForegroundColor Red
            $failed += $service
        } else {
            Write-Host "OK: $service" -ForegroundColor Green
        }
    } finally {
        Pop-Location
    }
}

if ($failed.Count -gt 0) {
    Write-Host "`n=== ECHECS ===" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    Write-Host "`nCorrige les erreurs ci-dessus avant de relancer." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Tous les JARs sont prets ===" -ForegroundColor Green

Write-Host "`n=== Lancement de docker-compose ===" -ForegroundColor Cyan
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n=== Deploiement reussi ===" -ForegroundColor Green
    Write-Host "Frontend : http://localhost" -ForegroundColor White
    Write-Host "Gateway  : http://localhost:8080" -ForegroundColor White
    Write-Host "Eureka   : http://localhost:8761" -ForegroundColor White
} else {
    Write-Host "`nEchec docker-compose. Verifie les logs avec : docker-compose logs" -ForegroundColor Red
    exit 1
}
