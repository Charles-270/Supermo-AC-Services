#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# MCP Health Check Script
# =============================================================================
# Comprehensive health check for all Model Context Protocol (MCP) servers
# configured in your Claude Code environment.
#
# Usage:
#   bash scripts/mcp-health-check.sh [--fix] [--verbose]
#
# Options:
#   --fix      Attempt to fix issues automatically
#   --verbose  Show detailed diagnostic information
#
# Exit codes:
#   0 - All checks passed
#   1 - Some checks failed
#   2 - Critical failure (missing dependencies)
# =============================================================================

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
FIX_ISSUES=false
VERBOSE=false
for arg in "$@"; do
  case $arg in
    --fix) FIX_ISSUES=true ;;
    --verbose) VERBOSE=true ;;
  esac
done

# Track overall status
OVERALL_STATUS=0

# Helper functions
print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo ""
}

print_check() {
  echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
  OVERALL_STATUS=1
}

print_info() {
  if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}ℹ️  $1${NC}"
  fi
}

# =============================================================================
# Check 1: Node.js and npm/npx
# =============================================================================
print_header "1. Node.js Environment"

print_check "Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=$(node --version)
  print_success "Node.js installed: ${NODE_VERSION}"
  print_info "Location: $(which node)"
else
  print_error "Node.js not found. Install Node.js LTS from https://nodejs.org/"
  exit 2
fi

print_check "Checking npx availability..."
if command -v npx >/dev/null 2>&1; then
  NPX_VERSION=$(npx --version)
  print_success "npx available: v${NPX_VERSION}"
  print_info "Location: $(which npx)"
else
  print_error "npx not found. Reinstall Node.js to get npx."
  exit 2
fi

# =============================================================================
# Check 2: MCP Configuration File
# =============================================================================
print_header "2. MCP Configuration"

MCP_CONFIG_PATH="/mnt/c/Users/Ferbert Consult/Claude Project/.mcp.json"
print_check "Checking MCP configuration file..."
if [ -f "${MCP_CONFIG_PATH}" ]; then
  print_success "MCP config found: .mcp.json"

  # Validate JSON syntax
  if jq empty "${MCP_CONFIG_PATH}" 2>/dev/null; then
    print_success "MCP config is valid JSON"
    print_info "Config location: ${MCP_CONFIG_PATH}"
  else
    print_error "MCP config has invalid JSON syntax"
    if [ "$VERBOSE" = true ]; then
      echo "Config contents:"
      cat "${MCP_CONFIG_PATH}"
    fi
  fi

  # List configured servers
  if command -v jq >/dev/null 2>&1; then
    SERVERS=$(jq -r '.mcpServers | keys[]' "${MCP_CONFIG_PATH}" 2>/dev/null || echo "")
    if [ -n "${SERVERS}" ]; then
      print_success "Configured MCP servers: ${SERVERS}"
    else
      print_warning "No MCP servers configured"
    fi
  fi
else
  print_error "MCP config not found at: ${MCP_CONFIG_PATH}"
  print_info "Expected location: .mcp.json in project root"
fi

# =============================================================================
# Check 3: Chrome DevTools MCP
# =============================================================================
print_header "3. Chrome DevTools MCP"

print_check "Checking Chrome remote debugging connection..."

# Function to check Chrome accessibility
check_chrome() {
  local host="$1"
  local port="${2:-9222}"

  if curl -fsS --max-time 2 "http://${host}:${port}/json/version" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

CHROME_ACCESSIBLE=false

# Check localhost
if check_chrome "localhost" "9222"; then
  print_success "Chrome accessible at localhost:9222"
  CHROME_ACCESSIBLE=true

  if [ "$VERBOSE" = true ]; then
    echo ""
    echo "Chrome Info:"
    curl -s http://localhost:9222/json/version | jq '.' 2>/dev/null || curl -s http://localhost:9222/json/version
    echo ""
  fi
fi

# Check Windows host IP
if [ "$CHROME_ACCESSIBLE" = false ]; then
  WINDOWS_IP="$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')" || WINDOWS_IP=""

  if [ -n "${WINDOWS_IP}" ] && check_chrome "${WINDOWS_IP}" "9222"; then
    print_warning "Chrome accessible at Windows IP (${WINDOWS_IP}:9222) but not localhost"
    print_info "This may require MCP config update to use --chrome-host=${WINDOWS_IP}"
    CHROME_ACCESSIBLE=true
  fi
fi

if [ "$CHROME_ACCESSIBLE" = false ]; then
  print_error "Chrome not accessible on port 9222"
  print_info "Chrome must be running with --remote-debugging-port=9222"

  if [ "$FIX_ISSUES" = true ]; then
    print_info "Attempting to launch Chrome with debugging..."
    LAUNCH_SCRIPT="/mnt/c/Users/Ferbert Consult/Claude Project/scripts/launch-chrome-from-wsl.sh"

    if [ -f "${LAUNCH_SCRIPT}" ]; then
      bash "${LAUNCH_SCRIPT}"
    else
      print_warning "Launch script not found: ${LAUNCH_SCRIPT}"
      print_info "Run: cmd.exe /c \"C:\\Users\\Ferbert Consult\\Claude Project\\scripts\\launch-chrome-debug.bat\""
    fi
  else
    echo ""
    print_info "To fix, run one of:"
    echo "  • bash scripts/launch-chrome-from-wsl.sh"
    echo "  • cmd.exe /c \"C:\\Users\\Ferbert Consult\\Claude Project\\scripts\\launch-chrome-debug.bat\""
    echo "  • Run this script with --fix to auto-launch"
  fi
fi

# Check if chrome-devtools-mcp package is available
print_check "Checking chrome-devtools-mcp package..."
if npx -y chrome-devtools-mcp@latest --version >/dev/null 2>&1; then
  print_success "chrome-devtools-mcp package available"
else
  print_warning "chrome-devtools-mcp package check timed out or failed"
  print_info "This is normal - package will be installed on first use"
fi

# =============================================================================
# Check 4: WSL Networking
# =============================================================================
print_header "4. WSL Networking"

print_check "Checking WSL version..."
if command -v wsl.exe >/dev/null 2>&1; then
  WSL_VERSION=$(wsl.exe -l -v 2>/dev/null | grep -i "docker-desktop\|ubuntu" | head -1 || echo "WSL detected")
  print_success "Running in WSL environment"
  print_info "${WSL_VERSION}"
else
  print_warning "Cannot determine WSL version (this is fine if running in WSL)"
fi

print_check "Checking localhost connectivity..."
if curl -fsS --max-time 2 http://localhost 2>/dev/null >/dev/null || [ $? -eq 7 ]; then
  print_success "Can reach localhost (basic connectivity works)"
else
  print_warning "Localhost connectivity issues detected"
  print_info "This might affect Chrome MCP connection"
fi

print_check "Checking Windows host IP..."
WINDOWS_IP="$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')" || WINDOWS_IP=""
if [ -n "${WINDOWS_IP}" ]; then
  print_success "Windows host IP: ${WINDOWS_IP}"
  print_info "Use this if localhost doesn't work from WSL"
else
  print_warning "Could not determine Windows host IP"
fi

# =============================================================================
# Check 5: Development Server
# =============================================================================
print_header "5. Development Server (Optional)"

print_check "Checking if development server is running..."
if curl -fsS --max-time 2 http://localhost:5173 >/dev/null 2>&1; then
  print_success "Vite dev server is running on port 5173"
elif curl -fsS --max-time 2 http://localhost:3000 >/dev/null 2>&1; then
  print_success "Dev server is running on port 3000"
else
  print_info "No dev server detected (this is fine if not developing)"
  print_info "Start with: npm run dev"
fi

# =============================================================================
# Summary
# =============================================================================
print_header "Summary"

if [ $OVERALL_STATUS -eq 0 ]; then
  print_success "All critical checks passed! ✨"
  echo ""
  echo "Your MCP setup is healthy and ready to use."
  echo ""
  echo "Quick tips:"
  echo "  • Use @design-review for comprehensive UI/UX reviews"
  echo "  • Use /design-review for quick design checks"
  echo "  • Add ShadCN components with: npx shadcn@latest add <component>"
  echo ""
else
  print_error "Some checks failed. Please review the issues above."
  echo ""
  echo "Common fixes:"
  echo "  1. Launch Chrome: bash scripts/launch-chrome-from-wsl.sh"
  echo "  2. Restart Claude Code to reconnect MCP servers"
  echo "  3. Run this script with --fix to auto-fix issues"
  echo ""
fi

exit $OVERALL_STATUS
