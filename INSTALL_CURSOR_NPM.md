# Mirror Memory — Cursor (npm)

**Status:** LIVE — `mirror-memory-mcp@0.1.1`. Soft Pro Capture **HOLD**.

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "npx",
      "args": ["-y", "mirror-memory-mcp@0.1.1"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "{{TOKEN}}"
      }
    }
  }
}
```

1. Sign in → `/memory` → **Connect** → **Cursor** → **Copy Cursor config**.
2. Paste into `~/.cursor/mcp.json` under `mcpServers`.
3. Reload MCP (Settings → MCP toggle, or reload window).
4. On `/memory`, **Test connection**.

Windows: `%USERPROFILE%\.cursor\mcp.json`. Soft Pro Capture **HOLD**.
