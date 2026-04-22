/**
 * convergence.ts — ergonomic wrapper for `brain.convergence.*`.
 *
 * The raw API on `brain.convergence` is a thin transport. This module
 * adds the small amount of session-state management the UI needs so
 * components don't reinvent it (current question caching, progress
 * percent, phase lookup).
 *
 * It does **not** hold its own state — callers own the session id and
 * call these helpers as pure async functions. This keeps the module
 * trivially testable and SSR-safe.
 */

import {
    brain,
    type ConvergencePhase,
    type ConvergenceQuestion,
    type ConvergenceSession,
} from './brain';

export type ConvergenceProgress = {
    session: ConvergenceSession;
    currentQuestion: ConvergenceQuestion | null;
    phase: ConvergencePhase | null;
    answeredCount: number;
    totalCount: number;
    /** 0–1 — fraction of questions answered. */
    fraction: number;
    isComplete: boolean;
};

let _questionsCache: ConvergenceQuestion[] | null = null;
let _phasesCache: ConvergencePhase[] | null = null;

async function loadQuestions(): Promise<ConvergenceQuestion[]> {
    if (_questionsCache) return _questionsCache;
    const res = await brain.convergence.questions();
    _questionsCache = res.questions;
    return _questionsCache;
}

async function loadPhases(): Promise<ConvergencePhase[]> {
    if (_phasesCache) return _phasesCache;
    const res = await brain.convergence.phases();
    _phasesCache = res.phases;
    return _phasesCache;
}

/** Test-only: clear the in-memory caches. */
export function _resetConvergenceCache(): void {
    _questionsCache = null;
    _phasesCache = null;
}

export const convergence = {
    /** Start a new birth/onboarding session. Returns its session id. */
    async begin(): Promise<string> {
        const { session_id } = await brain.convergence.beginSession();
        return session_id;
    },

    /** Hydrate full progress: session + the current question + its phase. */
    async progress(sessionId: string): Promise<ConvergenceProgress> {
        const [session, questions, phases] = await Promise.all([
            brain.convergence.getSession(sessionId),
            loadQuestions(),
            loadPhases(),
        ]);

        const totalCount = questions.length;
        const answeredCount = Object.keys(session.answers).length;
        const isComplete = session.complete;

        let currentQuestion: ConvergenceQuestion | null = null;
        let phase: ConvergencePhase | null = null;
        if (!isComplete && session.current_question != null) {
            currentQuestion =
                questions.find((q) => q.id === session.current_question) ?? null;
            if (currentQuestion) {
                phase = phases.find((p) => p.id === currentQuestion!.phase) ?? null;
            }
        }

        return {
            session,
            currentQuestion,
            phase,
            answeredCount,
            totalCount,
            fraction: totalCount > 0 ? answeredCount / totalCount : 0,
            isComplete,
        };
    },

    /**
     * Answer the current question and return refreshed progress. The
     * caller's UI just needs to render whatever this returns next.
     */
    async answer(
        sessionId: string,
        questionId: number,
        answer: unknown,
    ): Promise<ConvergenceProgress> {
        await brain.convergence.submitAnswer(sessionId, questionId, answer);
        return convergence.progress(sessionId);
    },
};
