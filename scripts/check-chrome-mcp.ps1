<#
Checks Chrome DevTools MCP prerequisites on Windows:
1) Node/npx available
2) Chrome running with remote debugging on port 9222
3) MCP config present and parsable

Usage:
  powershell -ExecutionPolicy Bypass -File scripts/check-chrome-mcp.ps1
#>

Write-Host "=== Chrome DevTools MCP Check ===" -ForegroundColor Cyan

# 1) Check Node/npx presence
$npxCmd = Get-Command npx -ErrorAction SilentlyContinue
if (-not $npxCmd) {
  Write-Host "[!] npx not found in PATH" -ForegroundColor Red
  Write-Host "    Install Node.js LTS from https://nodejs.org and reopen apps." -ForegroundColor Yellow
} else {
  try {
    $npxVersion = npx -v 2>$null
    Write-Host "[OK] npx found (version $npxVersion)" -ForegroundColor Green
  } catch {
    Write-Host "[!] npx present but failed to run" -ForegroundColor Red
  }
}

# 2) Check MCP config file
$repoRoot = (Get-Location).Path
$mcpPath = Join-Path $repoRoot "mcp.json"
if (Test-Path $mcpPath) {
  Write-Host "[OK] Found mcp.json at: $mcpPath" -ForegroundColor Green
  try {
    $mcp = Get-Content $mcpPath -Raw | ConvertFrom-Json
    if ($mcp.mcpServers.'chrome-devtools') {
      Write-Host "[OK] Config contains 'chrome-devtools' server" -ForegroundColor Green
      $args = $mcp.mcpServers.'chrome-devtools'.args -join ' '
      Write-Host "     Command: $($mcp.mcpServers.'chrome-devtools'.command) $args"
    } else {
      Write-Host "[!] 'chrome-devtools' server entry missing in mcp.json" -ForegroundColor Red
    }
  } catch {
    Write-Host "[!] Failed to parse mcp.json: $($_.Exception.Message)" -ForegroundColor Red
  }
} else {
  Write-Host "[!] mcp.json not found in repo root" -ForegroundColor Red
}

# 3) Check Chrome remote debugging endpoint
$endpoint = "http://localhost:9222/json/version"
try {
  $resp = Invoke-WebRequest -UseBasicParsing -Uri $endpoint -TimeoutSec 3
  if ($resp.StatusCode -eq 200) {
    Write-Host "[OK] Chrome remote debugging is reachable on 9222" -ForegroundColor Green
  } else {
    Write-Host "[!] Endpoint responded with status $($resp.StatusCode)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "[!] Cannot reach Chrome debugging at $endpoint" -ForegroundColor Red
  Write-Host "    Tip: Run scripts/launch-chrome-debug.ps1 to start Chrome with --remote-debugging-port=9222" -ForegroundColor Yellow
}

# 4) Check Chrome process (informational)
try {
  $chromeProcs = Get-Process chrome -ErrorAction SilentlyContinue
  if ($chromeProcs) {
    Write-Host "[Info] Chrome processes detected: $(@($chromeProcs).Count)" -ForegroundColor Gray
  } else {
    Write-Host "[Info] No Chrome process detected" -ForegroundColor Gray
  }
} catch {}

Write-Host "=== Check complete ===" -ForegroundColor Cyan

