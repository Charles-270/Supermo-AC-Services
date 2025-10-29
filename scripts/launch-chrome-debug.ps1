# Launch Chrome with Remote Debugging Enabled
# Required for Chrome DevTools MCP to connect

# Close existing Chrome instances (optional - uncomment if needed)
# Write-Host "Closing existing Chrome instances..."
# Stop-Process -Name chrome -ErrorAction SilentlyContinue
# Start-Sleep -Seconds 2

# Find Chrome executable
$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeExe = $path
        break
    }
}

if (-not $chromeExe) {
    Write-Host "ERROR: Chrome executable not found!" -ForegroundColor Red
    Write-Host "Please install Google Chrome or update the path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found Chrome at: $chromeExe" -ForegroundColor Green

# Launch Chrome with remote debugging on port 9222
Write-Host "Launching Chrome with remote debugging enabled (port 9222)..." -ForegroundColor Cyan

$chromeArgs = @(
    "--remote-debugging-port=9222",
    "--user-data-dir=$env:LOCALAPPDATA\Google\Chrome-Debug"
)

Start-Process -FilePath $chromeExe -ArgumentList $chromeArgs

Write-Host "`nChrome launched successfully!" -ForegroundColor Green
Write-Host "You can now restart Claude Code to connect to Chrome DevTools MCP." -ForegroundColor Yellow
Write-Host "`nDebug endpoint: http://localhost:9222" -ForegroundColor Cyan
