<#
Install or update global Codex MCP config at %USERPROFILE%\.codex\mcp.json
- Creates the directory if missing
- Backs up existing mcp.json with a timestamp
- Merges/sets the 'chrome-devtools' server entry

Usage:
  powershell -ExecutionPolicy Bypass -File scripts/install-global-codex-mcp.ps1
#>

$ErrorActionPreference = 'Stop'

function Ensure-ChromeDevtoolsMcp {
  param(
    [Parameter(Mandatory=$true)][string]$TargetFile
  )

  $serverConfig = [pscustomobject]@{
    command = 'npx'
    args    = @('-y','chrome-devtools-mcp@latest','--chrome-port','9222')
  }

  if (Test-Path $TargetFile) {
    Write-Host "Found existing mcp.json, creating backup..." -ForegroundColor Yellow
    $backup = "$TargetFile.bak-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $TargetFile $backup -Force
    Write-Host "Backup created: $backup" -ForegroundColor Gray

    try {
      $raw = Get-Content $TargetFile -Raw
      $json = $raw | ConvertFrom-Json
    } catch {
      Write-Host "Existing JSON could not be parsed. Writing a fresh config." -ForegroundColor Red
      $json = $null
    }

    if ($null -eq $json) {
      $json = [pscustomobject]@{}
    }

    if ($null -eq $json.mcpServers -or -not ($json.PSObject.Properties.Name -contains 'mcpServers')) {
      $json | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([pscustomobject]@{}) -Force
    }

    $serversObj = $json.mcpServers
    if ($null -eq $serversObj) {
      $serversObj = [pscustomobject]@{}
      $json.mcpServers = $serversObj
    }

    # Add or replace 'chrome-devtools' entry
    Add-Member -InputObject $serversObj -NotePropertyName 'chrome-devtools' -NotePropertyValue $serverConfig -Force

    ($json | ConvertTo-Json -Depth 10) | Set-Content -Encoding UTF8 $TargetFile
    Write-Host "Updated chrome-devtools entry in $TargetFile" -ForegroundColor Green
  } else {
    $doc = [pscustomobject]@{ mcpServers = [pscustomobject]@{} }
    $doc.mcpServers | Add-Member -NotePropertyName 'chrome-devtools' -NotePropertyValue $serverConfig -Force
    New-Item -ItemType File -Path $TargetFile -Force | Out-Null
    ($doc | ConvertTo-Json -Depth 10) | Set-Content -Encoding UTF8 $TargetFile
    Write-Host "Created new MCP config at $TargetFile" -ForegroundColor Green
  }
}

try {
  $targetDir  = Join-Path $env:USERPROFILE '.codex'
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "Created directory: $targetDir" -ForegroundColor Green
  }
  $targetFile = Join-Path $targetDir 'mcp.json'
  Ensure-ChromeDevtoolsMcp -TargetFile $targetFile
  Write-Host "Done. Restart Codex CLI to load MCP servers." -ForegroundColor Cyan
} catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}
