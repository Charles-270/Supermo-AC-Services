# Clean temporary files and system clutter
Write-Host "Starting system cleanup..." -ForegroundColor Green
$totalFreed = 0

# Function to safely remove files
function Remove-Files {
    param([string]$Path, [string]$Description)
    try {
        if (Test-Path $Path) {
            $sizeBefore = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            Get-ChildItem $Path -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
            $sizeAfter = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            $freed = [math]::Round(($sizeBefore - $sizeAfter) / 1MB, 2)
            $script:totalFreed += $freed
            Write-Host "Cleaned $Description : ${freed}MB freed" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Partial cleanup of $Description" -ForegroundColor Gray
    }
}

# 1. Clean user temp folder
Write-Host "`n[1/6] Cleaning user temp folder..." -ForegroundColor Cyan
Remove-Files -Path "$env:TEMP\*" -Description "User Temp"

# 2. Clean Windows temp folder
Write-Host "[2/6] Cleaning Windows temp folder..." -ForegroundColor Cyan
Remove-Files -Path "C:\Windows\Temp\*" -Description "Windows Temp"

# 3. Clean Windows Prefetch
Write-Host "[3/6] Cleaning Prefetch..." -ForegroundColor Cyan
Remove-Files -Path "C:\Windows\Prefetch\*" -Description "Prefetch"

# 4. Clean Recent Items
Write-Host "[4/6] Cleaning Recent Items..." -ForegroundColor Cyan
Remove-Files -Path "$env:APPDATA\Microsoft\Windows\Recent\*" -Description "Recent Items"

# 5. Empty Recycle Bin
Write-Host "[5/6] Emptying Recycle Bin..." -ForegroundColor Cyan
try {
    Clear-RecycleBin -Force -ErrorAction Stop
    Write-Host "Recycle Bin emptied" -ForegroundColor Yellow
} catch {
    Write-Host "Recycle Bin partial cleanup" -ForegroundColor Gray
}

# 6. Clean Windows Update Cache
Write-Host "[6/6] Cleaning Windows Update cache..." -ForegroundColor Cyan
try {
    Stop-Service wuauserv -Force -ErrorAction SilentlyContinue
    Remove-Files -Path "C:\Windows\SoftwareDistribution\Download\*" -Description "Update Cache"
    Start-Service wuauserv -ErrorAction SilentlyContinue
} catch {
    Write-Host "Update cache partial cleanup" -ForegroundColor Gray
}

Write-Host "`nCleanup complete! Total space freed: ${totalFreed}MB" -ForegroundColor Green
