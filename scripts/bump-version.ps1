# Bump monolith VERSION file and sync monolithic-service/pom.xml
# Usage:
#   .\scripts\bump-version.ps1 patch   # 1.1.0 -> 1.1.1
#   .\scripts\bump-version.ps1 minor   # 1.1.0 -> 1.2.0
#   .\scripts\bump-version.ps1 major   # 1.1.0 -> 2.0.0
#   .\scripts\bump-version.ps1 1.2.0   # set explicit version

param(
    [Parameter(Mandatory = $true)]
    [string]$Part
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"
$pomFile = Join-Path $repoRoot "expense-tracking-backend\monolithic-service\pom.xml"
$envExample = Join-Path $repoRoot ".env.example"

$current = (Get-Content $versionFile -Raw).Trim()
if ($Part -match '^\d+\.\d+\.\d+$') {
    $newVersion = $Part
} else {
    $segments = $current.Split('.')
    if ($segments.Count -ne 3) { throw "Invalid current version: $current" }
    $major = [int]$segments[0]
    $minor = [int]$segments[1]
    $patch = [int]$segments[2]
    switch ($Part.ToLower()) {
        "major" { $major++; $minor = 0; $patch = 0 }
        "minor" { $minor++; $patch = 0 }
        "patch" { $patch++ }
        default { throw "Use patch|minor|major or an explicit x.y.z version" }
    }
    $newVersion = "$major.$minor.$patch"
}

Set-Content -Path $versionFile -Value $newVersion -NoNewline
(Get-Content $pomFile -Raw) -replace '(<artifactId>monolithic-service</artifactId>\s*<version>)[^<]+(</version>)', "`${1}$newVersion`${2}" | Set-Content $pomFile -NoNewline
(Get-Content $envExample -Raw) -replace '(?m)^APP_VERSION=.*$', "APP_VERSION=$newVersion" | Set-Content $envExample -NoNewline
if ((Get-Content $envExample -Raw) -match 'MONOLITH_VERSION=') {
    (Get-Content $envExample -Raw) -replace '(?m)^MONOLITH_VERSION=.*$', "MONOLITH_VERSION=$newVersion" | Set-Content $envExample -NoNewline
}

Write-Host "Version bumped: $current -> $newVersion" -ForegroundColor Green
Write-Host "Updated: VERSION, monolithic-service/pom.xml, .env.example (APP_VERSION)" -ForegroundColor Green
Write-Host "Rebuild: .\scripts\docker-build.ps1" -ForegroundColor Cyan
