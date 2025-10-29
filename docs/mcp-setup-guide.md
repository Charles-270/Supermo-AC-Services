# MCP Setup Guide

Complete guide for setting up and troubleshooting Model Context Protocol (MCP) servers for Claude Code in your Supremo AC Services project.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [MCP Servers](#mcp-servers)
4. [Setup Instructions](#setup-instructions)
5. [Troubleshooting](#troubleshooting)
6. [Development Workflow](#development-workflow)

---

## Overview

**What is MCP?**

Model Context Protocol (MCP) is a standardized way for Claude Code to interact with external tools and services. In this project, we use MCP servers to:

- **Chrome DevTools MCP**: Enables Claude to interact with a running Chrome browser for design reviews, screenshot capture, and automated testing.

**Why MCP Matters for This Project:**

- Automates visual testing of your React components
- Captures screenshots at different viewport sizes (mobile, tablet, desktop)
- Validates accessibility compliance (WCAG standards)
- Monitors console errors and network requests
- Essential for `@design-review` agent and `/design-review` command

---

## Quick Start

### 1. Launch Chrome with Remote Debugging

**From Windows (Recommended):**

Double-click or run:
```
C:\Users\Ferbert Consult\Claude Project\scripts\launch-chrome-debug.bat
```

**From WSL:**
```bash
npm run chrome:launch
```

### 2. Verify Connection

```bash
npm run mcp:check
```

You should see: ✅ Chrome accessible at localhost:9222

### 3. Restart Claude Code

After Chrome is running, restart Claude Code to reconnect MCP servers.

---

## MCP Servers

### Chrome DevTools MCP

**Purpose:** Enables browser automation and visual testing

**Configuration:** (in `.mcp.json`)
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "chrome-devtools-mcp@latest",
        "--chrome-port",
        "9222"
      ]
    }
  }
}
```

**Requirements:**
- Chrome must be running with `--remote-debugging-port=9222`
- Accessible from WSL via `localhost:9222` or Windows host IP

**Features:**
- Navigate pages and click elements
- Capture screenshots at different viewport sizes
- Monitor console messages and network requests
- Evaluate JavaScript in browser context
- Test responsive design

---

## Setup Instructions

### Prerequisites

✅ Node.js v18+ and npm/npx installed
✅ Google Chrome installed
✅ WSL 2 (if on Windows)
✅ Project dependencies installed (`npm install`)

### Step-by-Step Setup

#### 1. Verify Your Environment

```bash
# Check Node.js
node --version  # Should be v18+

# Check npm/npx
npx --version   # Should be 7+

# Check Chrome installation
ls "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
```

#### 2. Configure MCP Servers

The `.mcp.json` file in your project root is already configured with Chrome DevTools MCP.

**Current Configuration:**
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "chrome-devtools-mcp@latest",
        "--chrome-port",
        "9222"
      ]
    }
  }
}
```

#### 3. Launch Chrome with Debugging

**Option A: Windows Batch File (Easiest)**
```cmd
# Double-click in File Explorer or run in CMD:
C:\Users\Ferbert Consult\Claude Project\scripts\launch-chrome-debug.bat
```

**Option B: PowerShell**
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\Ferbert Consult\Claude Project\scripts\launch-chrome-debug.ps1"
```

**Option C: From WSL**
```bash
npm run chrome:launch
# or
bash scripts/launch-chrome-from-wsl.sh
```

#### 4. Verify Chrome Connection

```bash
# Quick check
curl http://localhost:9222/json/version

# Comprehensive check
npm run mcp:check

# Verbose diagnostics
npm run mcp:check:verbose
```

**Expected Output:**
```json
{
   "Browser": "Chrome/131.0.6778.140",
   "Protocol-Version": "1.3",
   "User-Agent": "Mozilla/5.0...",
   "WebKit-Version": "537.36"
}
```

#### 5. Restart Claude Code

After Chrome is running:
1. Close Claude Code completely
2. Reopen Claude Code
3. MCP servers will automatically connect

#### 6. Test MCP Integration

In Claude Code, run:
```
/mcp
```

You should see `chrome-devtools` listed and connected.

---

## Troubleshooting

### Issue: "Failed to reconnect to chrome-devtools"

**Cause:** Chrome is not running with remote debugging enabled.

**Solution:**
```bash
# Launch Chrome
npm run chrome:launch

# Verify
curl http://localhost:9222/json/version

# Restart Claude Code
```

---

### Issue: Chrome launches but not accessible from WSL

**Symptoms:**
- Batch script runs successfully
- `curl http://localhost:9222` times out from WSL

**Cause:** WSL networking issue - localhost isn't mapped correctly

**Solution 1: Use Windows Host IP**

```bash
# Get Windows IP
WINDOWS_IP=$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')
echo $WINDOWS_IP

# Test connection
curl http://${WINDOWS_IP}:9222/json/version

# Update .mcp.json to use Windows IP
```

Update `.mcp.json`:
```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "chrome-devtools-mcp@latest",
        "--chrome-host",
        "172.24.208.1",  // Your Windows IP
        "--chrome-port",
        "9222"
      ]
    }
  }
}
```

**Solution 2: Configure Windows Firewall**

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Create new Inbound Rule:
   - Rule Type: Port
   - Protocol: TCP
   - Port: 9222
   - Action: Allow the connection
   - Profile: All
   - Name: "WSL Chrome Debug"

---

### Issue: Port 9222 already in use

**Symptoms:**
- Chrome won't launch
- Error: "Port already in use"

**Solution:**
```bash
# Check what's using port 9222
netstat -ano | grep 9222  # Windows
lsof -i :9222             # WSL

# Kill existing Chrome process
taskkill /F /IM chrome.exe  # Windows

# Relaunch Chrome
npm run chrome:launch
```

---

### Issue: MCP health check fails with "jq not found"

**Cause:** `jq` (JSON processor) not installed in WSL

**Solution:**
```bash
sudo apt update
sudo apt install jq -y
```

---

### Issue: Chrome launches but closes immediately

**Cause:** Chrome is already running without debug mode

**Solution:**
```bash
# Close all Chrome instances
taskkill /F /IM chrome.exe  # Windows

# Wait 2 seconds
sleep 2

# Launch with debugging
npm run chrome:launch
```

---

## Development Workflow

### Daily Development Flow

```bash
# 1. Start your day - check MCP health
npm run mcp:check

# 2. If Chrome isn't running, launch it
npm run chrome:launch

# 3. Start development server
npm run dev

# 4. Work on features...

# 5. Before committing, run design review
# (in Claude Code)
/design-review
```

### Design Review Workflows

#### Quick Design Check (Current Changes)
```
/design-review
```

This will:
- Identify modified components
- Start dev server if needed
- Navigate to affected pages
- Verify design compliance
- Capture screenshots
- Check for errors

#### Comprehensive Design Review (Entire Feature)
```
@design-review Please review the new booking form component
```

This agent provides:
- Full accessibility audit
- Multi-viewport testing (mobile, tablet, desktop)
- Interaction testing (clicks, forms, navigation)
- Performance analysis
- Console error detection
- Visual consistency check

### Using ShadCN Components

**Note:** ShadCN is now used as a direct CLI tool (not via MCP) for better performance.

```bash
# Add a new component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add dialog card badge

# Search for available components
npx shadcn@latest search button

# View component details
npx shadcn@latest view button
```

### NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run mcp:check` | Quick MCP health check |
| `npm run mcp:check:verbose` | Detailed diagnostics |
| `npm run mcp:check:fix` | Auto-fix MCP issues |
| `npm run chrome:launch` | Launch Chrome with debugging |
| `npm run dev` | Start Vite dev server |

---

## Advanced Configuration

### Custom Chrome Port

If port 9222 is unavailable, use a different port:

**1. Update launch script:**
```batch
REM In launch-chrome-debug.bat, change:
--remote-debugging-port=9223
```

**2. Update .mcp.json:**
```json
"args": [
  "/c",
  "npx",
  "-y",
  "chrome-devtools-mcp@latest",
  "--chrome-port",
  "9223"
]
```

### Using Chrome Canary or Chromium

```batch
REM In launch-chrome-debug.bat, update CHROME_PATH:
set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome SxS\Application\chrome.exe
```

### Headless Chrome (CI/CD)

For automated testing without UI:

```batch
start "" "%CHROME_PATH%" --headless --remote-debugging-port=9222
```

---

## Best Practices

### ✅ Do

- Launch Chrome before starting development
- Run `npm run mcp:check` when connection issues occur
- Use `/design-review` before creating pull requests
- Keep Chrome debug instance separate from regular browsing
- Close debug Chrome when done to free resources

### ❌ Don't

- Don't use your regular Chrome profile for debugging
- Don't run multiple Chrome instances with debugging
- Don't forget to restart Claude Code after fixing MCP issues
- Don't commit `.mcp.json` changes unless necessary
- Don't close Chrome while design reviews are running

---

## Getting Help

### Check These First

1. **Is Chrome running?**
   ```bash
   curl http://localhost:9222/json/version
   ```

2. **Is the MCP config valid?**
   ```bash
   cat .mcp.json | jq
   ```

3. **Are dependencies installed?**
   ```bash
   node --version && npx --version
   ```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to reconnect" | Chrome not running | `npm run chrome:launch` |
| "Connection refused" | Wrong port/host | Check `.mcp.json` config |
| "Command not found: npx" | Node.js not installed | Install Node.js LTS |
| "Chrome executable not found" | Chrome not installed | Install Google Chrome |

### Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Project Issues](https://github.com/your-repo/issues) (report bugs here)

---

## Appendix: File Locations

### Scripts

- `scripts/launch-chrome-debug.bat` - Windows Chrome launcher
- `scripts/launch-chrome-debug.ps1` - PowerShell Chrome launcher
- `scripts/launch-chrome-from-wsl.sh` - WSL Chrome launcher (automated)
- `scripts/check-chrome-mcp.sh` - Chrome connectivity check
- `scripts/mcp-health-check.sh` - Comprehensive MCP diagnostics

### Configuration

- `.mcp.json` - MCP server configuration (project root)
- `package.json` - NPM scripts for MCP commands

### Documentation

- `docs/mcp-setup-guide.md` - This guide
- `docs/firebase-architecture.md` - Firebase architecture docs
- `docs/spec.md` - Project specification
- `.claude/context/design-principles.md` - Design system guidelines

---

**Last Updated:** 2025-10-20
**Maintainer:** Supremo AC Development Team
