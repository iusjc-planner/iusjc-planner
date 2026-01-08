# Script simple de demarrage des services IUSJ Planner

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IUSJ Planner - Demarrage des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Demarrage d'Eureka Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-eureka-service'; mvn spring-boot:run"
Start-Sleep -Seconds 30

Write-Host "Demarrage d'Auth Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-auth-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage d'User Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-user-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage de Teacher Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-teacher-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage de Room Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-room-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage de Course Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-course-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage de Schedule Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-schedule-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage de School Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-school-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage de Group Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-group-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage du Gateway Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'iusj-gateway-service'; mvn spring-boot:run"
Start-Sleep -Seconds 15

Write-Host "Demarrage du Frontend Angular..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Tous les services sont demarres !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs d'acces:" -ForegroundColor Cyan
Write-Host "  Frontend:        http://localhost:4201" -ForegroundColor White
Write-Host "  API Gateway:     http://localhost:8080" -ForegroundColor White
Write-Host "  Eureka Dashboard: http://localhost:8761" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")