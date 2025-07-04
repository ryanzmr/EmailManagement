# Run the backend application using the portable environment

# Set working directory and path variables using relative paths
$RootDir = Join-Path $PSScriptRoot "..\..\"
$BackendDir = Join-Path $RootDir "backend"
$EnvPython = Join-Path $BackendDir "portable_venv\Scripts\python.exe"
$ActivateScript = Join-Path $BackendDir "portable_venv\Scripts\activate.ps1"

# Check if portable environment exists
if (-not (Test-Path $EnvPython)) {
    Write-Host "Portable environment not found. Setting it up first..." -ForegroundColor Yellow
    & (Join-Path $PSScriptRoot "setup.ps1")
}

Write-Host "Starting application with portable Python environment..." -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8000" -ForegroundColor Cyan

# Activate the environment and run the application
& $ActivateScript
Write-Host "Portable Python environment activated." -ForegroundColor Green

# Change to backend directory, run the app, then return
$CurrentLocation = Get-Location
Set-Location -Path $BackendDir
python run.py
Set-Location -Path $CurrentLocation

# Deactivate the environment
deactivate
Write-Host "Portable Python environment deactivated." -ForegroundColor Green
