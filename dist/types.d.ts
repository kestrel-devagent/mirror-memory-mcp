/**
 * Mirror Memory MCP types — locked to Dreamer RETRIEVAL_CONTRACT.md
 * and Builder lib/memory.ts. Do not invent alternate hit shapes.
 *
 * @see /workspace/ship/brand/RETRIEVAL_CONTRACT.md
 */
/** Vault providers from mirror-parsers + mirror for notes. */
export type Provider = "chatgpt" | "claude" | "grok";
export type MemoryProvider = Provider | "mirror";
export type HitKind = "thread" | "message" | "note" | "pin";
/** Required on every search hit — agents must cite label + deepLink / ids. */
export interface Citation {
    label: string;
    deepLink: string;
    threadId?: string;
    messageId?: string | null;
    noteId?: string;
    provider?: string;
    pinned?: boolean;
}
/**
 * SearchMatch snippet (mirror-parsers) — keep on message/thread hits.
 * Field names are matchStart/matchEnd (live parsers + Dreamer contract).
 */
export interface SearchMatchSnippet {
    text: string;
    matchStart: number;
    matchEnd: number;
}
interface HitBase {
    hitId: string;
    kind: HitKind;
    score: number;
    provider: MemoryProvider;
    citation: Citation;
}
/**
 * message | thread vault hit — SearchMatch fields + citation.
 * (Builder MessageMemoryHit extends SearchMatch.)
 */
export interface MessageOrThreadHit extends HitBase {
    kind: "message" | "thread";
    provider: Provider;
    conversationId: string;
    conversationTitle: string;
    messageId: string | null;
    role: string;
    source: "message" | "title";
    snippet: SearchMatchSnippet;
}
export interface NoteHit extends HitBase {
    kind: "note";
    provider: "mirror";
    note: {
        id: string;
        title: string;
        snippet: string;
        tags: string[];
        sourceAgent: string | null;
        updatedAt: string;
    };
}
/** Optional convenience kind in search; pins are a flag on threads. */
export interface PinHit extends HitBase {
    kind: "pin";
    provider: Provider;
    conversationId: string;
    title: string;
    pinnedAt: string;
}
export type MemoryHit = MessageOrThreadHit | NoteHit | PinHit;
/** POST /api/memory/search body (Dreamer + Builder). */
export interface MemorySearchRequest {
    q: string;
    limit?: number;
    providers?: Provider[];
    kinds?: HitKind[];
}
/** Host search response. */
export interface MemorySearchResponse {
    query: string;
    hits: MemoryHit[];
    hitCount: number;
    truncated: boolean;
}
export interface BoundedThreadMessage {
    id: string;
    role: string;
    text: string;
    createdAt: string | null;
    truncated: boolean;
}
export interface BoundedThread {
    id: string;
    provider: Provider;
    title: string;
    createdAt: string | null;
    updatedAt: string | null;
    messageCount: number;
    messagesReturned: number;
    truncated: boolean;
    messages: BoundedThreadMessage[];
}
export interface MemoryNote {
    id: string;
    title: string;
    body: string;
    tags: string[];
    sourceAgent: string | null;
    sourceThread?: {
        provider: string;
        conversationId: string;
        messageId?: string | null;
    } | null;
    createdAt: string;
    updatedAt: string;
}
export interface WriteNoteInput {
    title?: string;
    body: string;
    tags?: string[];
    sourceAgent?: string;
    sourceThread?: {
        provider: string;
        conversationId: string;
        messageId?: string | null;
    };
    /** When set, host appends body to this note id. */
    id?: string;
}
export interface ListPinsItem {
    provider: Provider | string;
    conversationId: string;
    title: string;
    pinnedAt: string;
    citation: Citation;
}
export interface HostErrorBody {
    error?: string;
    message?: string;
    code?: string;
}
export {};
