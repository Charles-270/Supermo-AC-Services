#!/usr/bin/env bash
set -euo pipefail

echo "=== Chrome DevTools MCP Check (WSL/Linux) ==="

if command -v npx >/dev/null 2>&1; then
  echo "[OK] npx found: $(npx -v)"
else
  echo "[!] npx not found. Install Node.js (e.g., via nvm)"
fi

URL=${1:-http://localhost:9222/json/version}
if command -v curl >/dev/null 2>&1; then
  if curl -fsS --max-time 3 "$URL" >/dev/null; then
    echo "[OK] Chrome remote debugging reachable at $URL"
  else
    echo "[!] Cannot reach Chrome at $URL"
    echo "    - Start Chrome on Windows with debug: scripts/launch-chrome-debug.bat"
    echo "    - From WSL, you can run: cmd.exe /c \"\\\"C:\\Users\\Ferbert Consult\\Claude Project\\scripts\\launch-chrome-debug.bat\\\"\""
    # Try Windows host IP automatically
    WINDOWS_IP="$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')" || WINDOWS_IP=""
    if [ -n "${WINDOWS_IP}" ]; then
      if curl -fsS --max-time 3 "http://${WINDOWS_IP}:9222/json/version" >/dev/null; then
        echo "[OK] Chrome reachable at Windows host IP: http://${WINDOWS_IP}:9222/json/version"
        echo "    Tip: Use this host for MCP: CHROME_HOST=${WINDOWS_IP} bash scripts/install-global-codex-mcp.sh"
      else
        echo "[!] Still unreachable at Windows host IP (${WINDOWS_IP})"
        echo "    Try visiting http://${WINDOWS_IP}:9222/json/version in a browser."
      fi
    else
      echo "    - If localhost fails from WSL, try Windows host IP:"
      echo "      WINDOWS_IP=\$(grep -m1 nameserver /etc/resolv.conf | awk '{print \$2}')"
      echo "      curl \"http://\${WINDOWS_IP}:9222/json/version\""
    fi
  fi
else
  echo "[!] curl not found; install curl to test connectivity"
fi

echo "=== Check complete ==="
