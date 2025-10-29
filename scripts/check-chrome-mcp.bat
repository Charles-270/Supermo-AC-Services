@echo off
REM Quick checks for Chrome DevTools MCP on Windows
REM Usage: scripts\check-chrome-mcp.bat

echo === Chrome DevTools MCP Check ===

REM 1) Check npx presence
where npx >nul 2>nul
if errorlevel 1 (
  echo [!] npx not found in PATH
  echo     Install Node.js LTS from https://nodejs.org and reopen apps.
) else (
  for /f "usebackq delims=" %%v in (`npx -v`) do set NPX_VER=%%v
  echo [OK] npx found (version %NPX_VER%)
)

REM 2) Check mcp.json presence
if exist mcp.json (
  echo [OK] Found mcp.json at %cd%\mcp.json
) else (
  echo [!] mcp.json not found in repo root
)

REM 3) Check Chrome remote debugging endpoint
powershell -NoProfile -Command ^
  "$u='http://localhost:9222/json/version'; ^
   try { $r=Invoke-WebRequest -UseBasicParsing -Uri $u -TimeoutSec 3; ^
         if ($r.StatusCode -eq 200) { Write-Host '[OK] Chrome remote debugging is reachable on 9222' -ForegroundColor Green } ^
         else { Write-Host ('[!] Endpoint responded with status ' + $r.StatusCode) -ForegroundColor Yellow } ^
   } catch { Write-Host ('[!] Cannot reach Chrome debugging at ' + $u) -ForegroundColor Red; ^
             Write-Host '    Tip: Run scripts/launch-chrome-debug.bat to start Chrome with --remote-debugging-port=9222' -ForegroundColor Yellow }"

echo === Check complete ===

