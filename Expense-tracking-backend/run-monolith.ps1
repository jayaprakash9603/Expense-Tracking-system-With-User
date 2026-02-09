# Expense Tracking System - Monolithic Mode Startup Script
# This script builds and runs all services as a single monolithic application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expense Tracking System (Monolith Mode)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend root
$backendDir = $PSScriptRoot
Set-Location $backendDir

# Check if common-library needs to be built
Write-Host "Step 1: Building common-library..." -ForegroundColor Yellow
Set-Location "$backendDir\common-library"
$commonBuild = mvn clean install -DskipTests 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build common-library" -ForegroundColor Red
    Write-Host $commonBuild
    exit 1
}
Write-Host "Common library built successfully!" -ForegroundColor Green

# Build the monolithic service
Write-Host ""
Write-Host "Step 2: Building monolithic-service..." -ForegroundColor Yellow
Set-Location "$backendDir\monolithic-service"
$monolithBuild = mvn clean package -DskipTests 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build monolithic-service" -ForegroundColor Red
    Write-Host $monolithBuild
    exit 1
}
Write-Host "Monolithic service built successfully!" -ForegroundColor Green

# Run the monolithic service
Write-Host ""
Write-Host "Step 3: Starting Monolith Service on port 8080..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Endpoints will be available at:" -ForegroundColor Cyan
Write-Host "  - API:      http://localhost:8080/api/*" -ForegroundColor White
Write-Host "  - Swagger:  http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  - Health:   http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

mvn spring-boot:run -Dspring.profiles.active=monolithic
