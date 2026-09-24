# Mirror Memory — Connect your agents (Cursor)

**Goal:** Cursor (and Claude Desktop / Devin local) can read/write your Mirror vault as shared memory.

**Live host:** https://web-production-0e178.up.railway.app  
**Package source (pre-npm):** https://github.com/kestrel-devagent/mirror-memory-mcp  
**Sibling:** [INSTALL_CLAUDE_DESKTOP.md](./INSTALL_CLAUDE_DESKTOP.md)

**Acceptance gate:** Connect copies config → Test connection PASS → one plain-English prompt finds a citation.

---

## Until npm is live (clone)

```bash
git clone https://github.com/kestrel-devagent/mirror-memory-mcp.git
cd mirror-memory-mcp && npm install && npm run build
```

ENTRY = absolute path to `…/mirror-memory-mcp/dist/index.js` on your machine.  
Placeholder in Connect UI: `/path/to/mirror-memory-mcp/dist/index.js`

**After npm (NOT LIVE YET):** do not invent `npx mirror-memory-mcp` until `npm view mirror-memory-mcp version` greens.

---

## Fast path (preferred)

1. Clone + build (above).
2. Sign in → open **Memory**: https://web-production-0e178.up.railway.app/memory
3. Under **Connect**, pick **Cursor**.
4. Set the package path to your local `dist/index.js`, then **Copy Cursor config**.
5. Paste into `~/.cursor/mcp.json` under `mcpServers` (merge if you already have other servers).
6. Reload Cursor MCP (Settings → MCP toggle, or reload window).
7. Back on `/memory`, click **Test connection**.
8. In Cursor chat:  
   > Search my Mirror notes for “MCP dogfood note” and show the citation.

---

## Manual fallback (if Connect UI is down)

1. On `/memory`, mint/copy a token.
2. Put this in `~/.cursor/mcp.json` (replace ENTRY + token):

```json
{
  "mcpServers": {
    "mirror-memory": {
      "command": "node",
      "args": ["/path/to/mirror-memory-mcp/dist/index.js"],
      "env": {
        "MIRROR_API_BASE": "https://web-production-0e178.up.railway.app",
        "MIRROR_MEMORY_TOKEN": "<paste token>"
      }
    }
  }
}
```

3. Reload MCP. Remint token on 401.

---

## Notes

- Soft Pro Capture: **HOLD** — no Soft Pro convert / Capture gates on Connect.
- Devin: use the **Devin (local)** tab only — cloud Devin cannot use Mac STDIO.
- Config blobs for Builder: `connect/CLIENT_CONFIGS.md` + `connect/client-configs.json`.
