# BookSoul Launcher - starts the Python ML backend and opens Edge
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  BookSoul - Literary Identity Engine"    -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Check Python virtual environment
$venvPython = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    $venvPython = "python"
    Write-Host "[INFO]  No venv found - using system Python" -ForegroundColor Yellow
} else {
    Write-Host "[OK]    Using venv Python" -ForegroundColor Green
}

# Check if port 8000 is already occupied
$alreadyRunning = $false
try {
    $conn = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $alreadyRunning = $true }
} catch {
    $alreadyRunning = $false
}

$backendJob = $null

if ($alreadyRunning) {
    Write-Host "[INFO]  Port 8000 already occupied - backend appears to be running." -ForegroundColor Yellow
} else {
    Write-Host "[START] Launching Python ML backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
    $backendJob = Start-Process `
        -FilePath $venvPython `
        -ArgumentList "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000" `
        -WorkingDirectory $PSScriptRoot `
        -PassThru `
        -WindowStyle Normal

    Write-Host "[OK]    Backend process started (PID $($backendJob.Id))" -ForegroundColor Green

    # Wait for backend to become responsive
    Write-Host "[WAIT]  Waiting for backend to finish loading dataset..." -ForegroundColor Yellow
    $maxWait = 90
    $waited  = 0
    $ready   = $false

    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        try {
            $resp = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/search?q=test" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
            if ($resp.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {
            # still starting up
        }
        if (($waited % 10) -eq 0) {
            Write-Host "         ... still loading ($waited s elapsed)" -ForegroundColor DarkGray
        }
    }

    if ($ready) {
        Write-Host "[OK]    ML Engine is live! (took $waited s)" -ForegroundColor Green
    } else {
        Write-Host "[WARN]  Backend did not respond within ${maxWait}s - opening in offline mode." -ForegroundColor Yellow
    }
}

# Open BookSoul in Microsoft Edge
$htmlPath = Join-Path $PSScriptRoot "BookSoul.html"
$fileUrl  = "file:///" + $htmlPath.Replace('\', '/')

Write-Host ""
Write-Host "[OPEN]  Launching BookSoul in Microsoft Edge..." -ForegroundColor Cyan
try {
    Start-Process "msedge" $fileUrl
    Write-Host "[OK]    Edge opened successfully." -ForegroundColor Green
} catch {
    Write-Host "[WARN]  Could not launch Edge, trying default browser..." -ForegroundColor Yellow
    Start-Process $fileUrl
}

Write-Host ""
Write-Host "[RUNNING] BookSoul is live!" -ForegroundColor Green
Write-Host "          Frontend:  $fileUrl" -ForegroundColor DarkGray
Write-Host "          Backend:   http://127.0.0.1:8000" -ForegroundColor DarkGray
Write-Host "          API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor DarkGray
Write-Host ""

Read-Host "Press ENTER to shut down the backend and exit"

if ($null -ne $backendJob -and -not $backendJob.HasExited) {
    Write-Host "[STOP]  Stopping backend..." -ForegroundColor Yellow
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    Write-Host "[OK]    Backend stopped." -ForegroundColor Green
}
