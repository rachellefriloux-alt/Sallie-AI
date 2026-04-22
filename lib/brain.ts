/**
 * brain.ts — typed HTTP client for the Sallie Brain service
 * (services/brain). Used by the mobile app to talk to the
 * locally-running FastAPI brain over HTTP.
 *
 * Configure the base URL via:
 *   - EXPO_PUBLIC_BRAIN_URL (preferred — works in Expo at build time)
 *   - or the `setBrainBaseUrl()` helper at runtime.
 *
 * Defaults to http://10.0.2.2:8000 on Android (emulator → host loopback)
 * and http://localhost:8000 elsewhere.
 */

import { Platform } from 'react-native';

// ---- types ----------------------------------------------------------------

export type SystemStatus = {
    name: string;
    running: boolean;
    [key: string]: unknown;
};

export type ReadyResponse = {
    ready: boolean;
    systems: Record<string, SystemStatus>;
};

export type ConvergencePhase = {
    id: string;
    name: string;
    description: string;
    color: string;
    theme: string;
    energy: string;
    start_question: number;
    end_question: number;
};

export type ConvergenceQuestion = {
    id: number;
    phase: string;
    text: string;
    purpose: string;
    extraction_key: string;
    phase_name: string;
    phase_description: string;
    depth_level: string;
    emotional_weight: number;
    neural_impact: number;
    bonding_potential: number;
    answer_type: string;
    options?: string[];
    fields?: string[];
    shapes?: string[];
};

export type ConvergenceSession = {
    id: string;
    started_at: string;
    current_question: number | null;
    answers: Record<string, { value: unknown; answered_at: string }>;
    complete: boolean;
};

export class BrainError extends Error {
    constructor(message: string, public readonly status?: number) {
        super(message);
        this.name = 'BrainError';
    }
}

// ---- base URL handling ----------------------------------------------------

function defaultBaseUrl(): string {
    const fromEnv = process.env.EXPO_PUBLIC_BRAIN_URL;
    if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, '');
    // Android emulator can't reach the host's localhost directly; 10.0.2.2 is
    // its alias for the host machine.
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
    return 'http://localhost:8000';
}

let baseUrl = defaultBaseUrl();

export function setBrainBaseUrl(url: string): void {
    baseUrl = url.replace(/\/$/, '');
}

export function getBrainBaseUrl(): string {
    return baseUrl;
}

// ---- request helper -------------------------------------------------------

async function request<T>(
    path: string,
    init: RequestInit = {},
    timeoutMs = 5000,
): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(`${baseUrl}${path}`, {
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
            throw new BrainError(`brain ${res.status}: ${detail}`, res.status);
        }
        return (await res.json()) as T;
    } catch (err) {
        if (err instanceof BrainError) throw err;
        const msg = err instanceof Error ? err.message : String(err);
        throw new BrainError(`brain unreachable at ${baseUrl}: ${msg}`);
    } finally {
        clearTimeout(timer);
    }
}

// ---- public API -----------------------------------------------------------

export const brain = {
    /** Liveness — does the brain process answer? */
    health: () => request<{ status: string }>('/health'),

    /** Readiness — are all 9 systems up? */
    ready: () => request<ReadyResponse>('/ready'),

    /** All 9 systems with their per-system state. */
    listSystems: () =>
        request<{ systems: Record<string, SystemStatus> }>('/systems'),

    convergence: {
        phases: () =>
            request<{ phases: ConvergencePhase[]; total_questions: number }>(
                '/convergence/phases',
            ),
        questions: () =>
            request<{ questions: ConvergenceQuestion[]; count: number }>(
                '/convergence/questions',
            ),
        question: (id: number) =>
            request<ConvergenceQuestion>(`/convergence/questions/${id}`),
        beginSession: () =>
            request<{ session_id: string }>('/convergence/sessions', {
                method: 'POST',
            }),
        getSession: (sid: string) =>
            request<ConvergenceSession>(`/convergence/sessions/${sid}`),
        submitAnswer: (sid: string, questionId: number, answer: unknown) =>
            request<ConvergenceSession>(
                `/convergence/sessions/${sid}/answer`,
                {
                    method: 'POST',
                    body: JSON.stringify({ question_id: questionId, answer }),
                },
            ),
    },
};
