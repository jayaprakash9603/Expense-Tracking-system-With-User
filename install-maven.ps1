#!/usr/bin/env pwsh
# Maven Installation Script for Windows (No Admin Required)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Maven Installation Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$mavenVersion = "3.9.6"
$mavenUrl = "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = "$env:USERPROFILE\apache-maven"
$mavenHome = "$installDir\apache-maven-$mavenVersion"
$downloadFile = "$env:TEMP\apache-maven-$mavenVersion.zip"

Write-Host "📥 Configuration:" -ForegroundColor Yellow
Write-Host "  Maven Version: $mavenVersion" -ForegroundColor White
Write-Host "  Install Location: $installDir" -ForegroundColor White
Write-Host "  Maven Home: $mavenHome`n" -ForegroundColor White

# Check if Maven is already installed
if (Test-Path $mavenHome) {
    Write-Host "✅ Maven $mavenVersion is already installed at: $mavenHome" -ForegroundColor Green
    $reinstall = Read-Host "Do you want to reinstall? (yes/no)"
    if ($reinstall -ne "yes") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Host "Removing existing installation..." -ForegroundColor Yellow
    Remove-Item -Path $mavenHome -Recurse -Force
}

# Create installation directory
Write-Host "📁 Creating installation directory..." -ForegroundColor Yellow
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download Maven
Write-Host "📥 Downloading Maven $mavenVersion..." -ForegroundColor Yellow
Write-Host "  URL: $mavenUrl" -ForegroundColor White
try {
    Invoke-WebRequest -Uri $mavenUrl -OutFile $downloadFile -UseBasicParsing
    Write-Host "✅ Download completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download Maven: $_" -ForegroundColor Red
    exit 1
}

# Extract Maven
Write-Host "`n📦 Extracting Maven..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $downloadFile -DestinationPath $installDir -Force
    Write-Host "✅ Extraction completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to extract Maven: $_" -ForegroundColor Red
    exit 1
}

# Clean up download file
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item -Path $downloadFile -Force
Write-Host "✅ Cleanup completed!" -ForegroundColor Green

# Set environment variables (User level - no admin required)
Write-Host "`n🔧 Setting up environment variables..." -ForegroundColor Yellow

# Set MAVEN_HOME
[Environment]::SetEnvironmentVariable("MAVEN_HOME", $mavenHome, "User")
Write-Host "  ✅ MAVEN_HOME = $mavenHome" -ForegroundColor Green

# Add Maven to PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$mavenBinPath = "$mavenHome\bin"

if ($currentPath -notlike "*$mavenBinPath*") {
    $newPath = "$currentPath;$mavenBinPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "  ✅ Added Maven to PATH" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Maven is already in PATH" -ForegroundColor Yellow
}

# Update current session PATH
$env:MAVEN_HOME = $mavenHome
$env:Path = "$env:Path;$mavenBinPath"

# Verify installation
Write-Host "`n🔍 Verifying Maven installation..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $mavenVersionOutput = & "$mavenHome\bin\mvn.cmd" --version 2>&1
    Write-Host "`n✅ Maven installed successfully!`n" -ForegroundColor Green
    Write-Host $mavenVersionOutput -ForegroundColor White
} catch {
    Write-Host "❌ Maven verification failed: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Installation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Maven Version:  $mavenVersion" -ForegroundColor White
Write-Host "Install Path:   $mavenHome" -ForegroundColor White
Write-Host "MAVEN_HOME:     $mavenHome" -ForegroundColor White
Write-Host "Binary Path:    $mavenHome\bin" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "  You need to RESTART YOUR TERMINAL for Maven to work in new sessions." -ForegroundColor Yellow
Write-Host "  Or run this command in the current session:" -ForegroundColor Yellow
Write-Host "  `$env:Path = [System.Environment]::GetEnvironmentVariable('Path','User') + ';' + [System.Environment]::GetEnvironmentVariable('Path','Machine')" -ForegroundColor Cyan

Write-Host "`n✅ To verify Maven in a new terminal, run:" -ForegroundColor Green
Write-Host "  mvn --version`n" -ForegroundColor Cyan

Write-Host "🎉 Installation completed successfully!" -ForegroundColor Green
