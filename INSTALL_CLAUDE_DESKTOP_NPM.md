# Mirror Memory — Claude Desktop (npm cutover draft)

> **NOT LIVE YET.** Do not run this `npx` config until `npm view mirror-memory-mcp version` greens. Until then use the clone path in README / INSTALL_*.md.

**Status:** DRAFT until `npm view mirror-memory-mcp version` returns a version. Do not ship this ENTRY on Connect until then. Soft Pro Capture **HOLD**.

**Package name (future):** `mirror-memory-mcp`  
**Live host:** https://web-production-0e178.up.railway.app  
**Sibling (pre-npm / clone path):** [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md)

---

## One sitting (post-publish)

1. Sign in → `/memory` → **Connect your agents** → **Claude Desktop**.
2. Copy the npm config below (Connect UI will use this once Builder flips ENTRY).
3. Paste into `~/Library/Application Support/Claude/claude_desktop_config.json` under `mcpServers` (merge if you already have other servers).
4. **Fully quit** Claude Desktop (**Cmd-Q** — closing the window is not enough), then relaunch.
5. On `/memory`, **Test connection**, or ask Claude:
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

No clone. No `npm install && npm run build`. No absolute path to `dist/index.js`.

---

## Config blob (ENTRY after publish)

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "npx",
      "args": ["-y", "mirror-memory-mcp@0.1.0"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "{{TOKEN}}"
      }
    }
  }
}
```

After first publish, Connect may pin `@0.1.0` or float to latest — Builder picks one policy; do not invent a different package name.

**Windows / Linux Claude config paths differ; same `mcpServers` block.** Soft Pro Capture **HOLD**.

---

## Builder cutover (one swap)

When `npm view mirror-memory-mcp version` greens:

1. Flip Connect / `MemoryInstallCard` ENTRY from `node` + `{{ENTRY}}` path → `npx` + `-y mirror-memory-mcp@<published>`.
2. Point Claude Desktop + Cursor tabs at this blob (same command/args/env).
3. Drop founder Mac paths and clone+build copy from the stranger path.
4. Remount + Dreamer Copy→Test smoke.
5. Soft Pro Capture stays **HOLD**.

Until then: keep honest clone/download path live; this file is inventory only.
