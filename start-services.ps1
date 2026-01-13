# Script de demarrage des services IUSJ Planner avec compilation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IUSJ Planner - Demarrage des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Charger les variables d'environnement depuis .env
Write-Host "Chargement des variables d'environnement..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "  OK $key" -ForegroundColor Green
        }
    }
    Write-Host "Variables d'environnement chargees avec succes!" -ForegroundColor Green
} else {
    Write-Host "Attention: Fichier .env non trouve!" -ForegroundColor Red
    Write-Host "Veuillez creer un fichier .env a partir de .env.example" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Fonction pour compiler et lancer un service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port,
        [int]$WaitSeconds = 15
    )
    
    Write-Host "Compilation et demarrage de $ServiceName (port $Port)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ServicePath'; mvn clean package -DskipTests; if (`$?) { java -jar target/$ServiceName-0.0.1-SNAPSHOT.jar }"
    Start-Sleep -Seconds $WaitSeconds
}

# Demarrage d'Eureka en premier (30 secondes pour qu'il soit pret)
Start-Service -ServiceName "iusj-eureka-service" -ServicePath "iusj-eureka-service" -Port 8761 -WaitSeconds 30

# Demarrage des autres services
Start-Service -ServiceName "iusj-auth-service" -ServicePath "iusj-auth-service" -Port 8082
Start-Service -ServiceName "iusj-user-service" -ServicePath "iusj-user-service" -Port 8081
Start-Service -ServiceName "iusj-teacher-service" -ServicePath "iusj-teacher-service" -Port 8083
Start-Service -ServiceName "iusj-room-service" -ServicePath "iusj-room-service" -Port 8084
Start-Service -ServiceName "iusj-course-service" -ServicePath "iusj-course-service" -Port 8085
Start-Service -ServiceName "iusj-schedule-service" -ServicePath "iusj-schedule-service" -Port 8086
Start-Service -ServiceName "iusj-school-service" -ServicePath "iusj-school-service" -Port 8087
Start-Service -ServiceName "iusj-group-service" -ServicePath "iusj-group-service" -Port 8088
Start-Service -ServiceName "iusj-gateway-service" -ServicePath "iusj-gateway-service" -Port 8080

Write-Host "Demarrage du Frontend Angular..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm start"
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Tous les services sont demarres !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs d'acces:" -ForegroundColor Cyan
Write-Host "  Frontend:         http://localhost:4200" -ForegroundColor White
Write-Host "  API Gateway:      http://localhost:8080" -ForegroundColor White
Write-Host "  Eureka Dashboard: http://localhost:8761" -ForegroundColor White
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "  Auth Service:     http://localhost:8082" -ForegroundColor White
Write-Host "  User Service:     http://localhost:8081" -ForegroundColor White
Write-Host "  Teacher Service:  http://localhost:8083" -ForegroundColor White
Write-Host "  Room Service:     http://localhost:8084" -ForegroundColor White
Write-Host "  Course Service:   http://localhost:8085" -ForegroundColor White
Write-Host "  Schedule Service: http://localhost:8086" -ForegroundColor White
Write-Host "  School Service:   http://localhost:8087" -ForegroundColor White
Write-Host "  Group Service:    http://localhost:8088" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
