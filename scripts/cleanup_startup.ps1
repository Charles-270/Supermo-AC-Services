# Disable unnecessary startup programs
$registryPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# List of programs to disable (non-essential)
$programsToDisable = @(
    "TeraBox",
    "TeraBoxWeb",
    "ScreenRec",
    "electron.app.Loom",
    "TogglTrack",
    "Opera Browser Assistant",
    "Grammarly",
    "MicrosoftEdgeAutoLaunch_032563758DA43FAF1EC04FB8F0E3E5AD",
    "Microsoft Edge Update"
)

Write-Host "Starting cleanup of startup programs..." -ForegroundColor Green

foreach ($program in $programsToDisable) {
    try {
        $value = Get-ItemProperty -Path $registryPath -Name $program -ErrorAction SilentlyContinue
        if ($value) {
            Remove-ItemProperty -Path $registryPath -Name $program -ErrorAction Stop
            Write-Host "Disabled: $program" -ForegroundColor Yellow
        } else {
            Write-Host "Not found in registry: $program" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Error disabling $program" -ForegroundColor Red
    }
}

Write-Host "Startup cleanup complete!" -ForegroundColor Green
Write-Host "Disabled programs can still be launched manually when needed." -ForegroundColor Cyan
