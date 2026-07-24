# Build versioned Docker images for monolith + frontend (local).
# Maven builds the monolith JAR outside Docker (reuses target/*.jar if present).
#
# Usage:
#   .\scripts\docker-build.ps1              # reuse JAR if present, else mvn + docker build
#   .\scripts\docker-build.ps1 -RebuildJar  # force mvn clean install -P monolithic
#   .\scripts\docker-build.ps1 -WithGitSha  # also tag :<version>-<gitsha>
#   .\scripts\docker-build.ps1 -Push        # push version + latest tags to registry

param(
    [switch]$RebuildJar,
    [switch]$WithGitSha,
    [switch]$Push
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

function Read-VersionFile {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "VERSION file not found at $Path"
    }
    return (Get-Content $Path -Raw).Trim()
}

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$appVersion = if ($env:APP_VERSION) {
    $env:APP_VERSION
} elseif ($env:MONOLITH_VERSION) {
    $env:MONOLITH_VERSION
} else {
    Read-VersionFile (Join-Path $repoRoot "VERSION")
}
$registry = if ($env:DOCKER_REGISTRY) { $env:DOCKER_REGISTRY } else { "jayaprakash9603" }

$gitSha = ""
if ($WithGitSha -or $env:IMAGE_TAG_WITH_GIT_SHA -eq "true") {
    $gitSha = (git rev-parse --short HEAD 2>$null)
    if (-not $gitSha) { $gitSha = "local" }
}

$backendDir = Join-Path $repoRoot "expense-tracking-backend"
$monolithTargetDir = Join-Path $backendDir "monolithic-service\target"
$expectedJar = Join-Path $monolithTargetDir "monolithic-service-$appVersion.jar"
$existingJars = @()
if (Test-Path $monolithTargetDir) {
    $existingJars = @(Get-ChildItem -Path $monolithTargetDir -Filter "*.jar" -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -notlike "*.original" })
}

$needsMaven = $RebuildJar -or -not (Test-Path $expectedJar)
if (-not $needsMaven -and $existingJars.Count -eq 0) {
    $needsMaven = $true
}

if ($needsMaven) {
    Write-Host "Building monolith JAR with Maven (-P monolithic)..." -ForegroundColor Cyan
    Push-Location $backendDir
    try {
        mvn clean install -P monolithic -DskipTests
        if ($LASTEXITCODE -ne 0) { throw "Maven build failed with exit code $LASTEXITCODE" }
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "Reusing existing JAR: $expectedJar" -ForegroundColor Green
}

$monolithImage = "$registry/expense-tracker-monolith"
$frontendImage = "$registry/expense-tracker-frontend"

Write-Host "Building Docker images (release $appVersion)..." -ForegroundColor Cyan
$env:APP_VERSION = $appVersion
$env:DOCKER_REGISTRY = $registry

docker compose build monolith frontend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

docker tag "${monolithImage}:${appVersion}" "${monolithImage}:latest"
docker tag "${frontendImage}:${appVersion}" "${frontendImage}:latest"

if ($gitSha) {
    docker tag "${monolithImage}:${appVersion}" "${monolithImage}:${appVersion}-${gitSha}"
    docker tag "${frontendImage}:${appVersion}" "${frontendImage}:${appVersion}-${gitSha}"
    Write-Host "Also tagged: ${monolithImage}:${appVersion}-${gitSha}" -ForegroundColor Green
}

Write-Host ""
Write-Host "Built images:" -ForegroundColor Green
Write-Host "  ${monolithImage}:${appVersion}"
Write-Host "  ${frontendImage}:${appVersion}"
Write-Host "  ${monolithImage}:latest (alias)"
Write-Host "  ${frontendImage}:latest (alias)"

if ($Push) {
    Write-Host ""
    Write-Host "Pushing images..." -ForegroundColor Yellow
    docker push "${monolithImage}:${appVersion}"
    docker push "${monolithImage}:latest"
    docker push "${frontendImage}:${appVersion}"
    docker push "${frontendImage}:latest"
    if ($gitSha) {
        docker push "${monolithImage}:${appVersion}-${gitSha}"
        docker push "${frontendImage}:${appVersion}-${gitSha}"
    }
    Write-Host "Push complete." -ForegroundColor Green
}

Write-Host ""
Write-Host "Start stack: docker compose up -d" -ForegroundColor Cyan
