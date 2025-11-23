# Script simple d'arret des services IUSJ Planner

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IUSJ Planner - Arret des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Arreter les processus Java (Spring Boot)
Write-Host "Arret des services Spring Boot..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    $count = 0
    foreach ($process in $javaProcesses) {
        try {
            Write-Host "  Arret du processus Java (PID: $($process.Id))..." -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $count++
        } catch {
            # Ignorer les erreurs
        }
    }
    Write-Host "  $count service(s) Spring Boot arretes" -ForegroundColor Green
} else {
    Write-Host "  Aucun service Spring Boot en cours" -ForegroundColor Gray
}

# Arreter les processus Node.js (Angular)
Write-Host "Arret du Frontend Angular..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $count = 0
    foreach ($process in $nodeProcesses) {
        try {
            Write-Host "  Arret du processus Node (PID: $($process.Id))..." -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $count++
        } catch {
            # Ignorer les erreurs
        }
    }
    Write-Host "  $count processus Node.js arretes" -ForegroundColor Green
} else {
    Write-Host "  Aucun processus Node.js en cours" -ForegroundColor Gray
}

# Liberation des ports
Write-Host "Verification des ports..." -ForegroundColor Yellow
$ports = @(8761, 8080, 8081, 8082, 4200, 4201)
foreach ($port in $ports) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            Write-Host "  Liberation du port $port (PID: $processId)..." -ForegroundColor Gray
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    } catch {
        # Ignorer les erreurs
    }
}
Write-Host "  Ports verifies et liberes" -ForegroundColor Green

# Fermeture des fenêtres de terminaux
Write-Host "Fermeture des fenetres de terminaux..." -ForegroundColor Yellow
try {
    # Fermer les fenêtres PowerShell supplémentaires (sauf celle actuelle)
    $currentPID = $PID
    $powershellProcesses = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $currentPID }
    if ($powershellProcesses) {
        $count = 0
        foreach ($process in $powershellProcesses) {
            try {
                # Vérifier si le processus a une fenêtre
                if ($process.MainWindowTitle -ne "") {
                    Write-Host "  Fermeture de la fenetre PowerShell (PID: $($process.Id))..." -ForegroundColor Gray
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    $count++
                }
            } catch {
                # Ignorer les erreurs
            }
        }
        if ($count -gt 0) {
            Write-Host "  $count fenetre(s) PowerShell fermees" -ForegroundColor Green
        }
    }

    # Fermer les fenêtres CMD
    $cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue
    if ($cmdProcesses) {
        $count = 0
        foreach ($process in $cmdProcesses) {
            try {
                # Vérifier si le processus a une fenêtre
                if ($process.MainWindowTitle -ne "") {
                    Write-Host "  Fermeture de la fenetre CMD (PID: $($process.Id))..." -ForegroundColor Gray
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    $count++
                }
            } catch {
                # Ignorer les erreurs
            }
        }
        if ($count -gt 0) {
            Write-Host "  $count fenetre(s) CMD fermees" -ForegroundColor Green
        }
    }

    # Fermer les fenêtres Windows Terminal qui pourraient contenir des services
    $wtProcesses = Get-Process -Name "WindowsTerminal" -ErrorAction SilentlyContinue
    if ($wtProcesses) {
        Write-Host "  Note: Des fenetres Windows Terminal sont ouvertes" -ForegroundColor Gray
        Write-Host "  Vous devrez peut-etre les fermer manuellement si elles contiennent des services" -ForegroundColor Gray
    }

    Write-Host "  Fenetres de terminaux traitees" -ForegroundColor Green
} catch {
    Write-Host "  Erreur lors de la fermeture des terminaux: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Tous les services sont arretes !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redemarrer les services, executez: .\start-services.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")