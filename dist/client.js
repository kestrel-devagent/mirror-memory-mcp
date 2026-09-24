/**
 * Thin HTTP client for Mirror host memory APIs.
 * Clear errors on 401/404 so dogfood can wait on Builder Railway redeploy.
 */
import { requireToken } from "./config.js";
export class MirrorApiError extends Error {
    status;
    path;
    body;
    constructor(status, path, body) {
        const msg = typeof body === "object" &&
            body &&
            ("error" in body || "message" in body)
            ? String(body.error ??
                body.message)
            : typeof body === "string"
                ? body.slice(0, 200)
                : `HTTP ${status}`;
        const suffix = status === 404
            ? " Route missing — unexpected after deploy 61cd4f3d; check MIRROR_API_BASE path."
            : status === 401
                ? " Check MIRROR_MEMORY_TOKEN (session or extension sync Bearer)."
                : "";
        super(`Mirror API ${status} ${path}: ${msg}${suffix}`);
        this.name = "MirrorApiError";
        this.status = status;
        this.path = path;
        this.body = body;
    }
}
async function parseBody(res) {
    const text = await res.text();
    if (!text)
        return null;
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
export class MirrorClient {
    config;
    constructor(config) {
        this.config = config;
    }
    headers(json = true) {
        const token = requireToken(this.config);
        const h = {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        };
        if (json)
            h["Content-Type"] = "application/json";
        return h;
    }
    url(path, query) {
        const u = new URL(path.replace(/^\//, ""), this.config.apiBase + "/");
        if (query) {
            for (const [k, v] of Object.entries(query)) {
                if (v !== undefined && v !== "")
                    u.searchParams.set(k, v);
            }
        }
        return u.toString();
    }
    async request(method, path, opts) {
        const url = this.url(path, opts?.query);
        let res;
        try {
            res = await fetch(url, {
                method,
                headers: this.headers(opts?.body !== undefined),
                body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
            });
        }
        catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            throw new Error(`Mirror API network error ${method} ${path}: ${reason}. Is MIRROR_API_BASE reachable?`);
        }
        const body = await parseBody(res);
        if (res.status === 404 && opts?.allow404)
            return null;
        if (!res.ok) {
            throw new MirrorApiError(res.status, path, body);
        }
        return body;
    }
    /**
     * POST /api/memory/search
     * Body: { q, providers?, kinds?, limit? } (legacy `query` also sent).
     * Hits pass through Dreamer shape unchanged (hitId, kind, score, citation, …).
     */
    async searchHistory(input) {
        const body = {
            q: input.q,
            query: input.q,
            limit: input.limit,
        };
        if (input.providers?.length)
            body.providers = input.providers;
        if (input.kinds?.length)
            body.kinds = input.kinds;
        const raw = (await this.request("POST", "/api/memory/search", {
            body,
        }));
        const hits = Array.isArray(raw?.hits) ? raw.hits : [];
        return {
            query: raw?.query ?? input.q,
            hits,
            hitCount: raw?.hitCount ?? hits.length,
            truncated: Boolean(raw?.truncated),
        };
    }
    /** GET /api/memory/thread/:id — composite id preferred: provider:conversationId */
    async getThread(id, opts) {
        const encoded = encodeURIComponent(id);
        const query = {};
        if (opts?.provider)
            query.provider = opts.provider;
        if (opts?.maxMessages != null)
            query.maxMessages = String(opts.maxMessages);
        const raw = (await this.request("GET", `/api/memory/thread/${encoded}`, {
            query,
        }));
        if (raw && typeof raw === "object" && "thread" in raw && raw.thread) {
            return raw.thread;
        }
        return raw;
    }
    /**
     * POST /api/memory/notes — create (no id) or append (id set).
     * Host returns { note, appended }.
     */
    async writeNote(input) {
        const body = {
            title: input.title,
            body: input.body,
            tags: input.tags,
            sourceAgent: input.sourceAgent,
            sourceThread: input.sourceThread,
        };
        if (input.id)
            body.id = input.id;
        const raw = (await this.request("POST", "/api/memory/notes", {
            body,
        }));
        if (raw && typeof raw === "object" && "note" in raw && raw.note) {
            return { note: raw.note, appended: Boolean(raw.appended) };
        }
        return { note: raw, appended: Boolean(input.id) };
    }
    /** GET /api/memory/notes?q=&limit= */
    async searchNotes(opts) {
        const raw = (await this.request("GET", "/api/memory/notes", {
            query: {
                q: opts?.q,
                limit: opts?.limit != null ? String(opts.limit) : undefined,
            },
        }));
        if (Array.isArray(raw))
            return { notes: raw, total: raw.length };
        return {
            notes: Array.isArray(raw.notes) ? raw.notes : [],
            total: raw.total,
        };
    }
    /**
     * list_pins — GET /api/memory/pins when live;
     * else wrap GET /api/archive/search?pinned=1 (already on Railway).
     */
    async listPins(opts) {
        const memoryPins = (await this.request("GET", "/api/memory/pins", {
            query: {
                limit: opts?.limit != null ? String(opts.limit) : undefined,
            },
            allow404: true,
        }));
        if (memoryPins) {
            const pins = Array.isArray(memoryPins)
                ? memoryPins
                : memoryPins.pins ?? [];
            return opts?.limit ? pins.slice(0, opts.limit) : pins;
        }
        // Fallback: live archive search pinned filter.
        const archive = (await this.request("GET", "/api/archive/search", {
            query: {
                pinned: "1",
                maxMatches: opts?.limit != null ? String(opts.limit) : "100",
            },
        }));
        const convos = archive.conversations ?? [];
        return convos
            .filter((c) => c.pinned !== false)
            .slice(0, opts?.limit ?? 100)
            .map((c) => {
            const pinnedAt = c.pinnedAt == null
                ? new Date(0).toISOString()
                : typeof c.pinnedAt === "number"
                    ? new Date(c.pinnedAt).toISOString()
                    : String(c.pinnedAt);
            return {
                provider: c.provider,
                conversationId: c.id,
                title: c.title || c.id,
                pinnedAt,
                citation: {
                    label: c.title || c.id,
                    deepLink: `/archive?provider=${encodeURIComponent(c.provider)}&id=${encodeURIComponent(c.id)}`,
                    threadId: c.id,
                    provider: c.provider,
                    pinned: true,
                },
            };
        });
    }
}
//# sourceMappingURL=client.js.map