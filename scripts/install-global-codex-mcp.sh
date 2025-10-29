#!/usr/bin/env bash
set -euo pipefail

# Installs/updates ~/.codex/mcp.json for Codex CLI on Linux/WSL
# - Backs up existing file
# - Adds/updates chrome-devtools MCP server pointing to CHROME_HOST:CHROME_PORT
# Env vars:
#   CHROME_HOST (default: localhost)
#   CHROME_PORT (default: 9222)

CHROME_HOST=${CHROME_HOST:-localhost}
CHROME_PORT=${CHROME_PORT:-9222}

TARGET_DIR="$HOME/.codex"
TARGET_FILE="$TARGET_DIR/mcp.json"

mkdir -p "$TARGET_DIR"

server_json=$(cat <<EOF
{
  "command": "npx",
  "args": [
    "-y",
    "chrome-devtools-mcp@latest",
    "--chrome-host",
    "${CHROME_HOST}",
    "--chrome-port",
    "${CHROME_PORT}"
  ]
}
EOF
)

if command -v jq >/dev/null 2>&1; then
  if [ -f "$TARGET_FILE" ]; then
    cp -f "$TARGET_FILE" "$TARGET_FILE.bak-$(date +%Y%m%d%H%M%S)"
    if jq . >/dev/null 2>&1 <"$TARGET_FILE"; then
      tmp=$(mktemp)
      jq --argjson srv "$server_json" '
        .mcpServers = (.mcpServers // {}) | (.mcpServers["chrome-devtools"] = $srv)
      ' "$TARGET_FILE" >"$tmp"
      mv "$tmp" "$TARGET_FILE"
      echo "[OK] Updated chrome-devtools in $TARGET_FILE"
    else
      echo "[!] Existing $TARGET_FILE not valid JSON; writing fresh config"
      printf '{"mcpServers": {"chrome-devtools": %s}}\n' "$server_json" >"$TARGET_FILE"
      echo "[OK] Wrote new $TARGET_FILE"
    fi
  else
    printf '{"mcpServers": {"chrome-devtools": %s}}\n' "$server_json" >"$TARGET_FILE"
    echo "[OK] Created $TARGET_FILE"
  fi
else
  # Fallback without jq: overwrite after backup
  if [ -f "$TARGET_FILE" ]; then
    cp -f "$TARGET_FILE" "$TARGET_FILE.bak-$(date +%Y%m%d%H%M%S)"
  fi
  printf '{"mcpServers": {"chrome-devtools": %s}}\n' "$server_json" >"$TARGET_FILE"
  echo "[OK] Wrote $TARGET_FILE (no jq merge available)"
fi

echo "Done. Restart Codex CLI to load MCP servers."
