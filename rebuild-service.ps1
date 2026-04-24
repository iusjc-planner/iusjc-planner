#!/usr/bin/env pwsh
# ============================================================
# rebuild-service.ps1 <nom-du-service>
# Rebuild un seul microservice et redémarre son container.
#
# Usage : .\rebuild-service.ps1 iusj-auth-service
# ============================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ServiceName)) {
    Write-Host "Service '$ServiceName' introuvable." -ForegroundColor Red
    exit 1
}

Write-Host "--- Building $ServiceName ---" -ForegroundColor Yellow
Push-Location $ServiceName
try {
    mvn clean package -DskipTests --no-transfer-progress -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec du build Maven pour $ServiceName" -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}

Write-Host "--- Redemarrage du container ---" -ForegroundColor Yellow
docker-compose up --build -d $ServiceName

Write-Host "OK: $ServiceName redémarre." -ForegroundColor Green
