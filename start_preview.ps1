$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host "Starting Ryan Collins Portfolio RC2 at http://localhost:8000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the preview server." -ForegroundColor DarkGray
py -m http.server 8000
