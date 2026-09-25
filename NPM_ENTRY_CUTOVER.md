# npm ENTRY cutover — DONE / LIVE (0.1.1)

**Date:** 2026-09-24  
**Version:** `mirror-memory-mcp@0.1.1`  
**Soft Pro Capture HOLD.** Connect primary ENTRY is npx. Host Connect uses `MIRROR_MCP_NPM_LIVE=1`.

```bash
npm view mirror-memory-mcp version
# → 0.1.1
```

## Live today

- Package: `mirror-memory-mcp@0.1.1`
- ENTRY: `npx -y mirror-memory-mcp@0.1.1`
- Env: `MIRROR_MCP_NPM_LIVE=1` (Railway production)
- Cursor / Claude Desktop: `INSTALL_CURSOR_NPM.md` / `INSTALL_CLAUDE_DESKTOP_NPM.md`
- Clone path = Advanced / local build fallback only (`INSTALL_CURSOR.md` / `INSTALL_CLAUDE_DESKTOP.md`)

## Builder checklist (done)

1. Confirm `npm view mirror-memory-mcp version` → 0.1.1
2. Set Railway `MIRROR_MCP_NPM_LIVE=1`
3. Flip Connect / `MemoryInstallCard` to `buildNpxMcpServersBlock` when `isMcpNpmLive()`
4. Point Cursor + Claude Desktop tabs at INSTALL_*_NPM.md blobs
5. Remount + Copy→Test smoke
6. Soft Pro Capture stays **HOLD**

Code: host `lib/memory-connect.ts` → `MCP_NPM_*`, `buildNpxMcpServersBlock`, `isMcpNpmLive()`.
