#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Launch Chrome with Remote Debugging from WSL
# =============================================================================
# This script launches Chrome on Windows from WSL with remote debugging enabled.
# Required for Chrome DevTools MCP server to connect.
#
# Usage:
#   bash scripts/launch-chrome-from-wsl.sh
#
# What it does:
#   1. Checks if Chrome is already running with debugging
#   2. Launches Chrome from Windows if not running
#   3. Verifies the connection is accessible from WSL
#   4. Provides troubleshooting tips if connection fails
# =============================================================================

echo "=== Launching Chrome with Remote Debugging from WSL ==="
echo ""

# Function to check if Chrome is accessible
check_chrome_accessible() {
  local host="$1"
  local port="${2:-9222}"

  if curl -fsS --max-time 2 "http://${host}:${port}/json/version" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Check if Chrome is already running and accessible
echo "[1/4] Checking if Chrome is already accessible..."
if check_chrome_accessible "localhost" "9222"; then
  echo "✅ Chrome is already running and accessible at localhost:9222"
  echo ""
  curl -s http://localhost:9222/json/version | head -3
  echo ""
  echo "✅ No action needed - Chrome DevTools MCP should work!"
  exit 0
fi

# Try to get Windows host IP
WINDOWS_IP="$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')" || WINDOWS_IP=""

if [ -n "${WINDOWS_IP}" ] && check_chrome_accessible "${WINDOWS_IP}" "9222"; then
  echo "✅ Chrome is accessible at Windows host IP: ${WINDOWS_IP}:9222"
  echo ""
  echo "⚠️  Note: Chrome is accessible via Windows IP, not localhost."
  echo "   You may need to update your MCP config to use: ${WINDOWS_IP}"
  echo ""
  exit 0
fi

echo "ℹ️  Chrome not currently accessible. Launching now..."
echo ""

# Determine which launch script to use
PROJECT_DIR="/mnt/c/Users/Ferbert Consult/Claude Project"
LAUNCH_SCRIPT_BAT="${PROJECT_DIR}/scripts/launch-chrome-debug.bat"
LAUNCH_SCRIPT_PS1="${PROJECT_DIR}/scripts/launch-chrome-debug.ps1"

echo "[2/4] Launching Chrome from Windows..."

# Try batch file first (simpler, more reliable in WSL)
if [ -f "${LAUNCH_SCRIPT_BAT}" ]; then
  echo "   Using: ${LAUNCH_SCRIPT_BAT}"
  # Pass --no-pause so the batch script doesn't block in a detached window
  cmd.exe /c "\"${LAUNCH_SCRIPT_BAT}\" --no-pause" >/dev/null 2>&1 &
  echo "   Chrome launch initiated..."
else
  echo "❌ Launch script not found: ${LAUNCH_SCRIPT_BAT}"
  echo "   Please ensure the launch script exists."
  exit 1
fi

# Wait for Chrome to start
echo ""
echo "[3/4] Waiting for Chrome to start (up to 10 seconds)..."
for i in {1..10}; do
  sleep 1
  printf "."

  if check_chrome_accessible "localhost" "9222"; then
    echo ""
    echo "✅ Chrome started successfully at localhost:9222"
    break
  fi

  # Also check Windows IP
  if [ -n "${WINDOWS_IP}" ] && check_chrome_accessible "${WINDOWS_IP}" "9222"; then
    echo ""
    echo "✅ Chrome started successfully at ${WINDOWS_IP}:9222"
    break
  fi
done
echo ""

# Verify connection
echo "[4/4] Verifying Chrome connection..."
if check_chrome_accessible "localhost" "9222"; then
  echo "✅ SUCCESS! Chrome is accessible at localhost:9222"
  echo ""
  echo "Chrome Version:"
  curl -s http://localhost:9222/json/version | head -3
  echo ""
  echo "🎉 Chrome DevTools MCP is now ready to use!"
  echo ""
  echo "Next steps:"
  echo "  1. Restart Claude Code (to reconnect MCP servers)"
  echo "  2. Run: /mcp to verify connection"
  echo ""
  exit 0
elif [ -n "${WINDOWS_IP}" ] && check_chrome_accessible "${WINDOWS_IP}" "9222"; then
  echo "⚠️  Chrome is accessible at Windows IP: ${WINDOWS_IP}:9222"
  echo "   But NOT accessible via localhost from WSL."
  echo ""
  echo "Troubleshooting:"
  echo "  - Windows Firewall may be blocking localhost connections from WSL"
  echo "  - Update .mcp.json to use --chrome-host=${WINDOWS_IP}"
  echo "  - Or configure Windows to allow WSL localhost access"
  echo ""
  echo "To update MCP config:"
  echo "  Edit .mcp.json and change chrome-port args to:"
  echo "    \"--chrome-host\", \"${WINDOWS_IP}\", \"--chrome-port\", \"9222\""
  echo ""
  exit 1
else
  echo "❌ Chrome launch failed or not accessible after 10 seconds"
  echo ""
  echo "Troubleshooting steps:"
  echo "  1. Check if Chrome is installed at a standard location"
  echo "  2. Manually run: cmd.exe /c \"${LAUNCH_SCRIPT_BAT}\""
  echo "  3. Check Windows Task Manager for Chrome processes"
  echo "  4. Try visiting http://localhost:9222 in a browser"
  echo "  5. Check Windows Firewall settings"
  echo ""
  echo "Common issues:"
  echo "  - Chrome not installed or wrong path in launch script"
  echo "  - Port 9222 already in use by another process"
  echo "  - Windows Firewall blocking the connection"
  echo "  - WSL networking configuration issues"
  echo ""
  exit 1
fi
