param(
    [switch]$UseLegacyFrontend
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IUSJ Planner - Demarrage des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Import-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Host "Attention: fichier .env non trouve." -ForegroundColor Red
        Write-Host "Creez .env a partir de .env.example puis relancez." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Chargement des variables d'environnement..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  OK $key" -ForegroundColor Green
        }
    }
}

function Start-IusjService {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ServiceName,
        [Parameter(Mandatory = $true)]
        [string]$ServicePath,
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [int]$WaitSeconds = 12
    )

    if (-not (Test-Path $ServicePath)) {
        Write-Host "[WARN] Dossier introuvable: $ServicePath" -ForegroundColor Yellow
        return
    }

    Write-Host "Compilation et demarrage de $ServiceName (port $Port)..." -ForegroundColor Yellow
    $command = "cd '$ServicePath'; mvn clean package -DskipTests; if (`$?) { java -jar target/$ServiceName-0.0.1-SNAPSHOT.jar }"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command | Out-Null
    Start-Sleep -Seconds $WaitSeconds
}

Import-EnvFile
Write-Host "Variables chargees." -ForegroundColor Green
Write-Host ""

# Demarrage ordre: registry -> services metier -> gateway
Start-IusjService -ServiceName "iusj-eureka-service" -ServicePath "iusj-eureka-service" -Port 8761 -WaitSeconds 30
Start-IusjService -ServiceName "iusj-auth-service" -ServicePath "iusj-auth-service" -Port 8082
Start-IusjService -ServiceName "iusj-user-service" -ServicePath "iusj-user-service" -Port 8081
Start-IusjService -ServiceName "iusj-teacher-service" -ServicePath "iusj-teacher-service" -Port 8083
Start-IusjService -ServiceName "iusj-room-service" -ServicePath "iusj-room-service" -Port 8084
Start-IusjService -ServiceName "iusj-course-service" -ServicePath "iusj-course-service" -Port 8085
Start-IusjService -ServiceName "iusj-schedule-service" -ServicePath "iusj-schedule-service" -Port 8086
Start-IusjService -ServiceName "iusj-school-service" -ServicePath "iusj-school-service" -Port 8087
Start-IusjService -ServiceName "iusj-group-service" -ServicePath "iusj-group-service" -Port 8088
Start-IusjService -ServiceName "iusj-student-service" -ServicePath "iusj-student-service" -Port 8089
Start-IusjService -ServiceName "iusj-resource-service" -ServicePath "iusj-resource-service" -Port 8090
Start-IusjService -ServiceName "iusj-notification-service" -ServicePath "iusj-notification-service" -Port 8092
Start-IusjService -ServiceName "iusj-gateway-service" -ServicePath "iusj-gateway-service" -Port 8080

if ($UseLegacyFrontend) {
    Write-Host "Demarrage frontend legacy (/frontend)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm start" | Out-Null
    $frontendUrl = "http://localhost:4200 (frontend legacy)"
} else {
    Write-Host "Demarrage frontend cible (/web)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'web'; npm start" | Out-Null
    $frontendUrl = "http://localhost:4200 (web cible)"
}

Start-Sleep -Seconds 12

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Tous les services sont demarres" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs d'acces:" -ForegroundColor Cyan
Write-Host "  Frontend:         $frontendUrl" -ForegroundColor White
Write-Host "  API Gateway:      http://localhost:8080" -ForegroundColor White
Write-Host "  Eureka Dashboard: http://localhost:8761" -ForegroundColor White
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Auth Service:         http://localhost:8082" -ForegroundColor White
Write-Host "  User Service:         http://localhost:8081" -ForegroundColor White
Write-Host "  Teacher Service:      http://localhost:8083" -ForegroundColor White
Write-Host "  Room Service:         http://localhost:8084" -ForegroundColor White
Write-Host "  Course Service:       http://localhost:8085" -ForegroundColor White
Write-Host "  Schedule Service:     http://localhost:8086" -ForegroundColor White
Write-Host "  School Service:       http://localhost:8087" -ForegroundColor White
Write-Host "  Group Service:        http://localhost:8088" -ForegroundColor White
Write-Host "  Student Service:      http://localhost:8089" -ForegroundColor White
Write-Host "  Resource Service:     http://localhost:8090" -ForegroundColor White
Write-Host "  Notification Service: http://localhost:8092" -ForegroundColor White
Write-Host ""
Write-Host "Astuce: utilisez -UseLegacyFrontend pour lancer /frontend temporairement." -ForegroundColor Gray
