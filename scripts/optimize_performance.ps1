# Optimize Windows for Performance
Write-Host "Optimizing Windows for performance..." -ForegroundColor Green

# Disable visual effects for better performance
Write-Host "`n[1/5] Disabling visual effects..." -ForegroundColor Cyan

$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects"
Set-ItemProperty -Path $path -Name "VisualFXSetting" -Value 2 -ErrorAction SilentlyContinue

$animations = @(
    "TaskbarAnimations",
    "DragFullWindows",
    "FontSmoothing",
    "ListviewAlphaSelect",
    "ListviewShadow"
)

foreach ($anim in $animations) {
    Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name $anim -Value 0 -ErrorAction SilentlyContinue
}
Write-Host "Visual effects disabled" -ForegroundColor Yellow

# Disable Windows Search indexing for better disk performance
Write-Host "[2/5] Adjusting search indexing..." -ForegroundColor Cyan
try {
    Stop-Service "WSearch" -Force -ErrorAction Stop
    Set-Service "WSearch" -StartupType Manual -ErrorAction Stop
    Write-Host "Search indexing optimized" -ForegroundColor Yellow
} catch {
    Write-Host "Search indexing adjustment skipped" -ForegroundColor Gray
}

# Disable SuperFetch (SysMain) - not needed on HDDs
Write-Host "[3/5] Disabling SuperFetch..." -ForegroundColor Cyan
try {
    Stop-Service "SysMain" -Force -ErrorAction Stop
    Set-Service "SysMain" -StartupType Disabled -ErrorAction Stop
    Write-Host "SuperFetch disabled" -ForegroundColor Yellow
} catch {
    Write-Host "SuperFetch adjustment skipped" -ForegroundColor Gray
}

# Disable Windows Tips and Suggestions
Write-Host "[4/5] Disabling Windows tips..." -ForegroundColor Cyan
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" -Name "SubscribedContent-338389Enabled" -Value 0 -ErrorAction SilentlyContinue
Write-Host "Windows tips disabled" -ForegroundColor Yellow

# Disable background apps
Write-Host "[5/5] Optimizing background apps..." -ForegroundColor Cyan
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications" -Name "GlobalUserDisabled" -Value 1 -ErrorAction SilentlyContinue
Write-Host "Background apps optimized" -ForegroundColor Yellow

Write-Host "`nPerformance optimization complete!" -ForegroundColor Green
Write-Host "Please restart your computer for all changes to take effect." -ForegroundColor Cyan
