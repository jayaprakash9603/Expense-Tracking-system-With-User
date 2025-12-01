#!/usr/bin/env pwsh
# Expense Tracking System - Docker Infrastructure Manager
# This script helps manage Docker infrastructure services

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'build', 'clean', 'status', 'logs', 'help')]
    [string]$Action = 'help'
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $Message" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Start-Infrastructure {
    Write-Header "Starting Infrastructure Services"
    Set-Location $ProjectRoot
    docker-compose up -d
    Write-Host "✅ Infrastructure services started!" -ForegroundColor Green
    Write-Host "`nServices available at:" -ForegroundColor Yellow
    Write-Host "  - MySQL:     localhost:5000" -ForegroundColor White
    Write-Host "  - Redis:     localhost:6379" -ForegroundColor White
    Write-Host "  - Kafka:     localhost:9092" -ForegroundColor White
    Write-Host "  - Zookeeper: localhost:2181" -ForegroundColor White
    Write-Host "  - Kafka UI:  http://localhost:9080" -ForegroundColor White
}

function Start-WithBuild {
    Write-Header "Starting Infrastructure + Building Services"
    Set-Location $ProjectRoot
    docker-compose --profile build up -d
    Write-Host "✅ Infrastructure started and services are building!" -ForegroundColor Green
    Write-Host "`nTo monitor build progress:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs -f maven-builder" -ForegroundColor White
}

function Stop-Infrastructure {
    Write-Header "Stopping All Services"
    Set-Location $ProjectRoot
    docker-compose down
    Write-Host "✅ All services stopped!" -ForegroundColor Green
}

function Restart-Infrastructure {
    Write-Header "Restarting Infrastructure Services"
    Stop-Infrastructure
    Start-Sleep -Seconds 2
    Start-Infrastructure
}

function Clean-Infrastructure {
    Write-Header "Cleaning All Services and Volumes"
    Write-Host "⚠️  This will remove all data including databases!" -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? (yes/no)"
    
    if ($confirmation -eq 'yes') {
        Set-Location $ProjectRoot
        docker-compose down -v
        Write-Host "✅ All services and volumes removed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
    }
}

function Show-Status {
    Write-Header "Service Status"
    Set-Location $ProjectRoot
    docker-compose ps
    
    Write-Host "`n📊 Volume Information:" -ForegroundColor Yellow
    docker volume ls | Select-String "expense"
}

function Show-Logs {
    Write-Header "Service Logs"
    Set-Location $ProjectRoot
    
    Write-Host "Which service logs do you want to view?" -ForegroundColor Yellow
    Write-Host "1. All services" -ForegroundColor White
    Write-Host "2. MySQL" -ForegroundColor White
    Write-Host "3. Kafka" -ForegroundColor White
    Write-Host "4. Redis" -ForegroundColor White
    Write-Host "5. Zookeeper" -ForegroundColor White
    Write-Host "6. Maven Builder" -ForegroundColor White
    
    $choice = Read-Host "Enter choice (1-6)"
    
    switch ($choice) {
        "1" { docker-compose logs -f }
        "2" { docker-compose logs -f mysql }
        "3" { docker-compose logs -f kafka }
        "4" { docker-compose logs -f redis }
        "5" { docker-compose logs -f zookeeper }
        "6" { docker-compose logs -f maven-builder }
        default { Write-Host "Invalid choice" -ForegroundColor Red }
    }
}

function Show-Help {
    Write-Header "Docker Infrastructure Manager - Help"
    
    Write-Host "Usage: .\docker-manager.ps1 [action]`n" -ForegroundColor White
    
    Write-Host "Available Actions:" -ForegroundColor Yellow
    Write-Host "  start    - Start infrastructure services (MySQL, Redis, Kafka, etc.)" -ForegroundColor White
    Write-Host "  build    - Start infrastructure + build all microservices with Maven" -ForegroundColor White
    Write-Host "  stop     - Stop all running services" -ForegroundColor White
    Write-Host "  restart  - Restart all infrastructure services" -ForegroundColor White
    Write-Host "  clean    - Stop services and remove all volumes (CAUTION: Deletes data!)" -ForegroundColor White
    Write-Host "  status   - Show status of all services" -ForegroundColor White
    Write-Host "  logs     - View logs of services" -ForegroundColor White
    Write-Host "  help     - Show this help message" -ForegroundColor White
    
    Write-Host "`nExamples:" -ForegroundColor Yellow
    Write-Host "  .\docker-manager.ps1 start" -ForegroundColor Cyan
    Write-Host "  .\docker-manager.ps1 build" -ForegroundColor Cyan
    Write-Host "  .\docker-manager.ps1 status" -ForegroundColor Cyan
    
    Write-Host "`nQuick Access URLs:" -ForegroundColor Yellow
    Write-Host "  Kafka UI: http://localhost:9080" -ForegroundColor White
    Write-Host "  MySQL:    localhost:5000 (user: root, password: 123456)" -ForegroundColor White
}

# Main execution
switch ($Action) {
    'start'   { Start-Infrastructure }
    'build'   { Start-WithBuild }
    'stop'    { Stop-Infrastructure }
    'restart' { Restart-Infrastructure }
    'clean'   { Clean-Infrastructure }
    'status'  { Show-Status }
    'logs'    { Show-Logs }
    'help'    { Show-Help }
    default   { Show-Help }
}
