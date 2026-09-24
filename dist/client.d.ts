/**
 * Thin HTTP client for Mirror host memory APIs.
 * Clear errors on 401/404 so dogfood can wait on Builder Railway redeploy.
 */
import type { BoundedThread, ListPinsItem, MemoryNote, MemorySearchRequest, MemorySearchResponse, VoiceProfile, WriteNoteInput } from "./types.js";
import type { MirrorConfig } from "./config.js";
export declare class MirrorApiError extends Error {
    readonly status: number;
    readonly path: string;
    readonly body: unknown;
    constructor(status: number, path: string, body: unknown);
}
export declare class MirrorClient {
    private readonly config;
    constructor(config: MirrorConfig);
    private headers;
    private url;
    private request;
    /**
     * POST /api/memory/search
     * Body: { q, providers?, kinds?, limit? } (legacy `query` also sent).
     * Hits pass through Dreamer shape unchanged (hitId, kind, score, citation, …).
     */
    searchHistory(input: MemorySearchRequest): Promise<MemorySearchResponse>;
    /** GET /api/memory/thread/:id — composite id preferred: provider:conversationId */
    getThread(id: string, opts?: {
        provider?: string;
        maxMessages?: number;
    }): Promise<BoundedThread>;
    /**
     * POST /api/memory/notes — create (no id) or append (id set).
     * Host returns { note, appended }.
     */
    writeNote(input: WriteNoteInput): Promise<{
        note: MemoryNote;
        appended: boolean;
    }>;
    /** GET /api/memory/notes?q=&limit= */
    searchNotes(opts?: {
        q?: string;
        limit?: number;
    }): Promise<{
        notes: MemoryNote[];
        total?: number;
    }>;
    /**
     * GET /api/memory/voice — Your voice profile (preference notes + starters).
     * Empty profile → source "empty" + empty arrays (200, not 404).
     * Soft Pro Capture HOLD — read-only; no billing fields.
     */
    getVoice(): Promise<VoiceProfile>;
    /**
     * list_pins — GET /api/memory/pins when live;
     * else wrap GET /api/archive/search?pinned=1 (already on Railway).
     */
    listPins(opts?: {
        limit?: number;
    }): Promise<ListPinsItem[]>;
}
