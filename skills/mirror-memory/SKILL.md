---
name: mirror-memory
description: >-
  Use Mirror Memory MCP tools to search Hudson/Asa's shared chat vault and
  durable notes across ChatGPT, Claude, and Grok. Prefer when the user asks
  what was decided, to find an old thread, to pin/list pins, or to write a note
  other agents should see later.
---

# Mirror Memory

Shared agent memory for **Mirror** (Aftermodel rename later). Soft Pro / Capture monetization is **HOLD** — do not pitch Soft Pro when using these tools.

## When to search vs write

| Intent | Tool | Notes |
|---|---|---|
| "What did we decide…?" / find old chat | `search_history` | Use first. Pass a concrete `q`. |
| Need full conversation | `get_thread` | Use `citation.threadId` + `citation.provider` (or composite `provider:id`). |
| Show starred threads | `list_pins` | Pins are a **flag on threads**, not notes. |
| Durable fact for later agents | `write_note` | Short title; meaningful tags; set `sourceAgent`. |
| Browse notes only | `search_notes` | Or `search_history` with `kinds: ["note"]`. |
| Extend an existing note | `append_memory` | Pass `noteId` when known; else creates a note tagged `memory`. |

## Citations (required)

Every `search_history` hit is Dreamer-shaped:

- `kind`: `message` | `thread` | `note` | `pin`
- `hitId`, `score`, `provider`
- **`citation`**: `{ label, deepLink, threadId?, messageId?, noteId?, provider?, pinned? }`

**Always** show `citation.label` and navigate via `citation.deepLink` or `get_thread` with the thread id. Message hits also carry SearchMatch `snippet` (`text`, `matchStart`, `matchEnd`) — **display only**, not the source of truth.

Never paste raw vault dumps or full thread bodies into third-party surfaces. Bound reads via `get_thread`.

## Auth / errors

- Token: `MIRROR_MEMORY_TOKEN` (Mirror session or extension sync Bearer).
- Host: `MIRROR_API_BASE` (default Railway).
- **404** on `/api/memory/*` → Builder has not redeployed yet; say so clearly and stop retrying.
- **401** → token missing/wrong; ask Hudson to paste a fresh sync token.

## Out of scope

- Soft Pro convert / Capture claims / Chrome store
- Resend / email digests
- Exfiltrating vault contents to third parties
