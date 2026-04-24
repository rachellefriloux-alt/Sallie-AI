/**
 * knowledge.ts — typed client for the brain's `/knowledge/*` proxy.
 *
 * The mobile app talks to the *brain*, not the knowledge service
 * directly — this keeps the phone with a single backend URL and lets the
 * brain orchestrate retrieval-augmented generation later. See
 * `lib/brain.ts` for the base URL plumbing this reuses.
 */

import { BrainError, getBrainBaseUrl } from './brain';

export type KnowledgeHit = {
    id: string;
    score: number;
    text: string;
    metadata: Record<string, unknown>;
};

export type KnowledgeQueryResponse = {
    query: string;
    upstream: string;
    hits: KnowledgeHit[];
};

export type KnowledgeHealth = {
    upstream: string;
    ok: boolean;
};

async function request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = 15000,
): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const url = `${getBrainBaseUrl()}${path}`;
    try {
        const res = await fetch(url, {
            ...init,
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                ...(init.body ? { 'Content-Type': 'application/json' } : {}),
                ...(init.headers ?? {}),
            },
        });
        if (!res.ok) {
            let detail = res.statusText;
            try {
                const body = await res.json();
                if (body && typeof body.detail === 'string') detail = body.detail;
            } catch {
                /* non-JSON error body */
            }
            throw new BrainError(`knowledge ${res.status}: ${detail}`, res.status);
        }
        return (await res.json()) as T;
    } catch (err) {
        if (err instanceof BrainError) throw err;
        const msg = err instanceof Error ? err.message : String(err);
        throw new BrainError(`knowledge unreachable at ${url}: ${msg}`);
    } finally {
        clearTimeout(timer);
    }
}

export const knowledge = {
    /** Is the upstream knowledge service answering? */
    health: () => request<KnowledgeHealth>('/knowledge/health'),

    /**
     * Vector-search the indexed corpus.
     * @param query  natural-language question
     * @param limit  max hits to return (1–50, defaults to 5 server-side)
     */
    query: (query: string, limit?: number) =>
        request<KnowledgeQueryResponse>('/knowledge/query', {
            method: 'POST',
            body: JSON.stringify(
                limit === undefined ? { query } : { query, limit },
            ),
        }),
};
