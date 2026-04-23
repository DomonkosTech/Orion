$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
$issFile = Join-Path $scriptDir "OrionSetup.iss"

$candidates = @(
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
)

$iscc = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1

if (-not $iscc) {
    Write-Host "Inno Setup 6 was not found."
    Write-Host "Install it from https://jrsoftware.org/isinfo.php and rerun this script."
    exit 1
}

Write-Host "Building Orion installer with $iscc"
& $iscc "/DRepoRoot=$repoRoot" $issFile

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Installer build completed."
