# npm ENTRY cutover (prep only — NOT LIVE)

**Soft Pro Capture HOLD.** Do **not** flip live Connect ENTRY to `npx` until:

```bash
npm view mirror-memory-mcp version
# must print a version (e.g. 0.1.0). Today: 404.
```

## Live today (honest)

- Clone: `https://github.com/kestrel-devagent/mirror-memory-mcp.git`
- ENTRY: absolute path to `dist/index.js` (Connect placeholder `/path/to/mirror-memory-mcp/dist/index.js`)
- Claude Desktop: see `INSTALL_CLAUDE_DESKTOP.md`

## After registry greens (Builder one sitting)

1. Confirm `npm view mirror-memory-mcp version`.
2. Set Railway/env `MIRROR_MCP_NPM_LIVE=1` only after Strategist OK.
3. Flip Connect / `MemoryInstallCard` to use `buildNpxMcpServersBlock` (or equivalent) instead of `node` + path ENTRY.
4. Point Cursor + Claude Desktop tabs at INSTALL_*_NPM.md blobs.
5. Remount Dreamer Copy→Test smoke.
6. Soft Pro Capture stays **HOLD**.

Code ready: `lib/memory-connect.ts` → `MCP_NPM_*`, `buildNpxMcpServersBlock`, `isMcpNpmLive()` (default false).
