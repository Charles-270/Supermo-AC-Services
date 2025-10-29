@echo off
REM Launch Chromium (Chrome/Edge) with Remote Debugging Enabled
REM - Binds to 0.0.0.0 so WSL can reach Windows host IP
REM - Supports --no-pause flag for automated launch

setlocal ENABLEDELAYEDEXPANSION

REM Handle optional --no-pause argument
set NO_PAUSE=0
if /I "%1"=="--no-pause" set NO_PAUSE=1

echo Launching Chromium with remote debugging enabled...

REM ---------------------------------------------------------------------------
REM Locate Chrome or Edge
REM ---------------------------------------------------------------------------
set BROWSER_NAME=Chrome
set BROWSER_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

echo Found %BROWSER_NAME% at: %BROWSER_PATH%

REM ---------------------------------------------------------------------------
REM Launch with remote debugging
REM - Port 9222; bind to 0.0.0.0 so WSL can reach Windows host IP
REM - Use a dedicated user-data-dir to avoid profile prompts
REM ---------------------------------------------------------------------------
set USER_DATA_DIR=%LOCALAPPDATA%\%BROWSER_NAME%-Debug

start "" "%BROWSER_PATH%" ^
  --remote-debugging-port=9222 ^
  --remote-debugging-address=0.0.0.0 ^
  --user-data-dir="%USER_DATA_DIR%"

echo.
echo %BROWSER_NAME% launched with remote debugging.
echo Restart Claude Code to connect to Chrome DevTools MCP.
echo.
echo Debug endpoints (check one that works):
echo   - http://localhost:9222/json/version
echo   - http://^<Windows-IP^>:9222/json/version
echo     (In WSL, Windows IP is: $(grep -m1 nameserver /etc/resolv.conf ^| awk "{print $2}"))
echo.
echo Note: Exposing 9222 on 0.0.0.0 allows access from WSL.
echo       Ensure Windows Firewall rules restrict unwanted access.

if %NO_PAUSE%==0 pause
endlocal
