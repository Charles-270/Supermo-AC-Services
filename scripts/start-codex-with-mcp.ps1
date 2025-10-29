<#
Starts Codex CLI and points it to this repo's MCP config.

Usage:
  powershell -ExecutionPolicy Bypass -File scripts/start-codex-with-mcp.ps1

Notes:
- Ensure Chrome is running with remote debugging (use scripts/launch-chrome-debug.ps1)
- Codex must be installed and available on PATH
#>

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path | Split-Path -Parent
$mcpPath = Join-Path $repoRoot 'mcp.json'

Write-Host "Repo root: $repoRoot"
if (-not (Test-Path $mcpPath)) {
  Write-Host "ERROR: mcp.json not found at $mcpPath" -ForegroundColor Red
  exit 1
}

# Optional: quick check for Chrome DevTools endpoint
try {
  $resp = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:9222/json/version' -TimeoutSec 2
  if ($resp.StatusCode -eq 200) {
    Write-Host "[OK] Chrome remote debugging reachable on 9222" -ForegroundColor Green
  } else {
    Write-Host "[!] Chrome debugging responded with status $($resp.StatusCode)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "[!] Could not reach Chrome on http://localhost:9222. Launch it with scripts/launch-chrome-debug.ps1" -ForegroundColor Yellow
}

Write-Host "Starting Codex (global MCP config from %USERPROFILE%\\.codex)..." -ForegroundColor Cyan
& codex
