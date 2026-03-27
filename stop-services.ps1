Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IUSJ Planner - Arret des services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$currentPid = $PID
Write-Host "Console actuelle preservee (PID: $currentPid)" -ForegroundColor Cyan

function Stop-IusjJavaProcesses {
    Write-Host "Arret des services Java IUSJ..." -ForegroundColor Yellow

    $killed = 0
    $javaProcesses = Get-CimInstance Win32_Process -Filter "name = 'java.exe'"
    foreach ($proc in $javaProcesses) {
        $cmd = ($proc.CommandLine | Out-String)
        if ($cmd -match "iusj-.*-service") {
            try {
                Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
                Write-Host "  Arret Java PID=$($proc.ProcessId)" -ForegroundColor Gray
                $killed++
            } catch {
                # ignorer
            }
        }
    }

    Write-Host "  $killed processus Java IUSJ arretes" -ForegroundColor Green
}

function Stop-FrontendNodeProcesses {
    Write-Host "Arret des frontends Node (web/frontend)..." -ForegroundColor Yellow

    $killed = 0
    $nodeProcesses = Get-CimInstance Win32_Process -Filter "name = 'node.exe'"
    foreach ($proc in $nodeProcesses) {
        $cmd = ($proc.CommandLine | Out-String)
        if ($cmd -match "\\web\\|\\frontend\\|ng serve") {
            try {
                Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
                Write-Host "  Arret Node PID=$($proc.ProcessId)" -ForegroundColor Gray
                $killed++
            } catch {
                # ignorer
            }
        }
    }

    Write-Host "  $killed processus Node arretes" -ForegroundColor Green
}

function Clear-IusjPorts {
    Write-Host "Liberation des ports IUSJ..." -ForegroundColor Yellow
    $ports = @(8761, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090, 8092, 4200, 4201)
    $closed = 0

    foreach ($port in $ports) {
        try {
            $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            foreach ($conn in $connections) {
                if ($conn.OwningProcess -ne $currentPid -and $conn.OwningProcess -ne 0) {
                    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                    Write-Host "  Port $port libere (PID=$($conn.OwningProcess))" -ForegroundColor Gray
                    $closed++
                }
            }
        } catch {
            # ignorer
        }
    }

    Write-Host "  $closed operation(s) de liberation effectuee(s)" -ForegroundColor Green
}

Stop-IusjJavaProcesses
Stop-FrontendNodeProcesses
Clear-IusjPorts

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Arret termine" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pour redemarrer: .\\start-services.ps1" -ForegroundColor Yellow
