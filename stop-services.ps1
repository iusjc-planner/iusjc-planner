# Script simple d'arret des services IUSJ Planner

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IUSJ Planner - Arret des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stocker le PID de la console actuelle pour la protéger
$currentPID = $PID
Write-Host "Console actuelle protegee (PID: $currentPID)" -ForegroundColor Cyan

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
$closedPorts = 0
foreach ($port in $ports) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            $processId = $connection.OwningProcess
            # Ne pas fermer si c'est le processus actuel
            if ($processId -ne $currentPID) {
                Write-Host "  Liberation du port $port (PID: $processId)..." -ForegroundColor Gray
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                $closedPorts++
            }
        }
    } catch {
        # Ignorer les erreurs
    }
}
Write-Host "  $closedPorts port(s) liberes" -ForegroundColor Green

# Fermeture sélective des consoles de services
Write-Host "Fermeture des consoles de services..." -ForegroundColor Yellow
try {
    $closedWindows = 0

    # Mots-clés pour identifier les consoles de services
    $serviceKeywords = @("eureka", "auth-service", "user-service", "gateway", "mvn", "spring-boot", "ng serve", "angular", "iusj")
    
    # Fermer les PowerShell avec des titres de services (sauf la console actuelle)
    $powershellProcesses = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $currentPID }
    foreach ($process in $powershellProcesses) {
        try {
            $windowTitle = ""
            if ($process.MainWindowTitle) {
                $windowTitle = $process.MainWindowTitle.ToLower()
            }
            
            $isServiceWindow = $false
            foreach ($keyword in $serviceKeywords) {
                if ($windowTitle -like "*$keyword*") {
                    $isServiceWindow = $true
                    break
                }
            }
            
            if ($isServiceWindow) {
                Write-Host "  Fermeture de la console PowerShell de service (PID: $($process.Id))..." -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $closedWindows++
            }
        } catch {
            # Ignorer les erreurs
        }
    }

    # Fermer les CMD avec des titres de services
    $cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue
    foreach ($process in $cmdProcesses) {
        try {
            $windowTitle = ""
            if ($process.MainWindowTitle) {
                $windowTitle = $process.MainWindowTitle.ToLower()
            }
            
            $isServiceWindow = $false
            foreach ($keyword in $serviceKeywords) {
                if ($windowTitle -like "*$keyword*") {
                    $isServiceWindow = $true
                    break
                }
            }
            
            if ($isServiceWindow) {
                Write-Host "  Fermeture de la console CMD de service (PID: $($process.Id))..." -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $closedWindows++
            }
        } catch {
            # Ignorer les erreurs
        }
    }

    # Approche alternative : fermer les consoles PowerShell/CMD qui n'ont pas de fenêtre principale visible
    # (souvent les consoles lancées par des scripts)
    $powershellProcesses = Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object { 
        $_.Id -ne $currentPID -and 
        ($_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null)
    }
    foreach ($process in $powershellProcesses) {
        try {
            Write-Host "  Fermeture de console PowerShell en arriere-plan (PID: $($process.Id))..." -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $closedWindows++
        } catch {
            # Ignorer les erreurs
        }
    }

    $cmdProcesses = Get-Process -Name "cmd" -ErrorAction SilentlyContinue | Where-Object { 
        $_.MainWindowTitle -eq "" -or $_.MainWindowTitle -eq $null
    }
    foreach ($process in $cmdProcesses) {
        try {
            Write-Host "  Fermeture de console CMD en arriere-plan (PID: $($process.Id))..." -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            $closedWindows++
        } catch {
            # Ignorer les erreurs
        }
    }

    if ($closedWindows -gt 0) {
        Write-Host "  $closedWindows console(s) de services fermees" -ForegroundColor Green
    } else {
        Write-Host "  Aucune console de service a fermer" -ForegroundColor Gray
    }

} catch {
    Write-Host "  Erreur lors de la fermeture des consoles: $($_.Exception.Message)" -ForegroundColor Red
}

# Nettoyage final - processus orphelins
Write-Host "Nettoyage final..." -ForegroundColor Yellow
try {
    $cleanedProcesses = 0
    
    # Tuer les processus Maven
    $mavenProcesses = Get-Process -ErrorAction SilentlyContinue | Where-Object { 
        $_.ProcessName -like "*maven*" -or $_.ProcessName -like "*mvn*"
    }
    foreach ($process in $mavenProcesses) {
        try {
            if ($process.Id -ne $currentPID) {
                Write-Host "  Arret du processus Maven (PID: $($process.Id))..." -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $cleanedProcesses++
            }
        } catch {
            # Ignorer les erreurs
        }
    }

    # Tuer les processus npm
    $npmProcesses = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -like "*npm*" }
    foreach ($process in $npmProcesses) {
        try {
            if ($process.Id -ne $currentPID) {
                Write-Host "  Arret du processus NPM (PID: $($process.Id))..." -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                $cleanedProcesses++
            }
        } catch {
            # Ignorer les erreurs
        }
    }

    Write-Host "  $cleanedProcesses processus orphelins nettoyes" -ForegroundColor Green
} catch {
    Write-Host "  Erreur lors du nettoyage: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Tous les services sont arretes !" -ForegroundColor Green
Write-Host "  Console actuelle preservee !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redemarrer les services, executez: .\start-services.ps1" -ForegroundColor Yellow
Write-Host ""