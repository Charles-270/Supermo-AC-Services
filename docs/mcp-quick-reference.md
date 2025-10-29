# MCP Quick Reference Card

## 🚀 Quick Start (30 seconds)

```bash
# 1. Launch Chrome
npm run chrome:launch

# 2. Check health
npm run mcp:check

# 3. Restart Claude Code
```

---

## 📋 Essential Commands

### Launch Chrome
```bash
npm run chrome:launch                    # From WSL
# OR
C:\...\scripts\launch-chrome-debug.bat   # From Windows
```

### Health Checks
```bash
npm run mcp:check                        # Quick check
npm run mcp:check:verbose                # Detailed diagnostics
npm run mcp:check:fix                    # Auto-fix issues
curl http://localhost:9222/json/version  # Direct Chrome check
```

### Development
```bash
npm run dev                              # Start Vite server
/design-review                           # Quick design check (in Claude)
@design-review <description>             # Full design review (in Claude)
```

### ShadCN Components
```bash
npx shadcn@latest add <component>        # Add component
npx shadcn@latest search <query>         # Search components
```

---

## 🔧 Troubleshooting

### Chrome Not Accessible
```bash
# 1. Check if Chrome is running
curl http://localhost:9222/json/version

# 2. If not, launch it
npm run chrome:launch

# 3. If still failing, check Windows IP
WINDOWS_IP=$(grep -m1 nameserver /etc/resolv.conf | awk '{print $2}')
curl http://${WINDOWS_IP}:9222/json/version

# 4. Update .mcp.json to use Windows IP if needed
```

### Port Already in Use
```bash
# Kill existing Chrome
taskkill /F /IM chrome.exe    # Windows

# Relaunch
npm run chrome:launch
```

### MCP Connection Failed
```bash
# 1. Fix the issue
npm run mcp:check:fix

# 2. Restart Claude Code
# (Close and reopen)

# 3. Verify
/mcp
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.mcp.json` | MCP server config |
| `scripts/launch-chrome-from-wsl.sh` | WSL Chrome launcher |
| `scripts/mcp-health-check.sh` | Health diagnostics |
| `docs/mcp-setup-guide.md` | Complete guide |

---

## 🎯 Common Workflows

### Before Starting Work
```bash
npm run mcp:check && npm run dev
```

### Before Creating PR
```
/design-review
```

### When MCP Breaks
```bash
npm run mcp:check:fix
# Then restart Claude Code
```

---

## 💡 Pro Tips

- Keep Chrome debug window open while developing
- Run `mcp:check` if you see connection errors
- Use `@design-review` for major UI changes
- ShadCN works better as CLI (not via MCP)
- Restart Claude Code after fixing MCP issues

---

## 🆘 Emergency Commands

```bash
# Nuclear option - restart everything
taskkill /F /IM chrome.exe              # Kill Chrome
npm run chrome:launch                    # Relaunch Chrome
# Restart Claude Code
npm run mcp:check                        # Verify

# Check logs
npm run mcp:check:verbose                # See what's wrong
```

---

**Need more help?** See `docs/mcp-setup-guide.md`
