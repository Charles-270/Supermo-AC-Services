@echo off
REM Starts Codex CLI with this repo's MCP config
REM Usage: scripts\start-codex-with-mcp.bat

setlocal
REM Resolve repo root as parent of this scripts folder
set SCRIPT_DIR=%~dp0
for %%I in ("%SCRIPT_DIR%..") do set REPO_ROOT=%%~fI
set MCP_JSON=%REPO_ROOT%\mcp.json

echo Repo root: %REPO_ROOT%
if not exist "%MCP_JSON%" (
  echo ERROR: mcp.json not found at %MCP_JSON%
  exit /b 1
)

REM Optional: quick reachability check for Chrome debugging endpoint
powershell -NoProfile -Command ^
  "try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:9222/json/version' -TimeoutSec 2; ^
          if ($r.StatusCode -eq 200) { Write-Host '[OK] Chrome remote debugging reachable on 9222' -ForegroundColor Green } ^
          else { Write-Host ('[!] Chrome debugging responded with status ' + $r.StatusCode) -ForegroundColor Yellow } ^
        } catch { Write-Host '[!] Could not reach Chrome on http://localhost:9222. Launch it with scripts/launch-chrome-debug.bat' -ForegroundColor Yellow }"

echo Starting Codex (global MCP config from %%USERPROFILE%%\.codex)...
codex

endlocal
