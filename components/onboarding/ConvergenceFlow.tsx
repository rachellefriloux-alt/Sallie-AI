/**
 * ConvergenceFlow — drives the real backend Convergence flow.
 *
 * Differs from `QASystem.tsx` (which hard-codes 10 questions in a local
 * Zustand store): this component talks to the brain at
 * `/convergence/sessions/*`, supports the full 40-question bank, and
 * shows phase + progress metadata returned by the server.
 *
 * Drop-in usage from any onboarding stage:
 *
 *   <ConvergenceFlow onComplete={() => router.replace('/')} />
 *
 * The component fetches its own session on mount and never persists
 * outside the brain — mobile is a thin client. If the brain is
 * unreachable it surfaces a retry UI instead of silently failing.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { OnboardingButton } from './OnboardingButton';
import { BrainError } from '@/lib/brain';
import { convergence, type ConvergenceProgress } from '@/lib/convergence';

interface ConvergenceFlowProps {
    onComplete: (sessionId: string) => void;
}

type Status =
    | { kind: 'starting' }
    | { kind: 'ready'; progress: ConvergenceProgress }
    | { kind: 'submitting'; progress: ConvergenceProgress }
    | { kind: 'error'; message: string };

export function ConvergenceFlow({ onComplete }: ConvergenceFlowProps) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>({ kind: 'starting' });
    const [draft, setDraft] = useState('');

    const begin = useCallback(async () => {
        setStatus({ kind: 'starting' });
        try {
            const sid = await convergence.begin();
            const progress = await convergence.progress(sid);
            setSessionId(sid);
            setStatus({ kind: 'ready', progress });
        } catch (err) {
            setStatus({
                kind: 'error',
                message:
                    err instanceof BrainError
                        ? err.message
                        : 'Could not reach Sallie. Is the brain running?',
            });
        }
    }, []);

    useEffect(() => {
        begin();
    }, [begin]);

    // Auto-finish when the server marks the session complete.
    useEffect(() => {
        if (status.kind === 'ready' && status.progress.isComplete && sessionId) {
            onComplete(sessionId);
        }
    }, [status, sessionId, onComplete]);

    const submit = useCallback(async () => {
        if (status.kind !== 'ready' || !sessionId) return;
        const q = status.progress.currentQuestion;
        if (!q) return;
        const value = draft.trim();
        if (!value) return;
        setStatus({ kind: 'submitting', progress: status.progress });
        try {
            const next = await convergence.answer(sessionId, q.id, value);
            setDraft('');
            setStatus({ kind: 'ready', progress: next });
        } catch (err) {
            setStatus({
                kind: 'error',
                message:
                    err instanceof BrainError
                        ? err.message
                        : 'Could not save your answer. Try again?',
            });
        }
    }, [status, sessionId, draft]);

    if (status.kind === 'starting') {
        return (
            <View style={styles.container}>
                <ActivityIndicator color="#f5f5f5" />
                <Text style={styles.subtle}>Awakening…</Text>
            </View>
        );
    }

    if (status.kind === 'error') {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{status.message}</Text>
                <OnboardingButton title="Try again" onPress={begin} />
            </View>
        );
    }

    const progress = status.progress;
    const q = progress.currentQuestion;

    if (progress.isComplete || !q) {
        // useEffect above will fire onComplete; render a graceful pause.
        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>Convergence complete.</Text>
                <ActivityIndicator color="#f5f5f5" />
            </View>
        );
    }

    const submitting = status.kind === 'submitting';
    const pct = Math.round(progress.fraction * 100);

    return (
        <View style={styles.container}>
            {progress.phase && (
                <Text style={[styles.phase, { color: progress.phase.color || '#888' }]}>
                    {progress.phase.name.toUpperCase()}
                </Text>
            )}
            <Text style={styles.questionText}>{q.text}</Text>

            <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder="Speak plainly…"
                placeholderTextColor="#888"
                multiline
                editable={!submitting}
            />

            <OnboardingButton
                title={submitting ? 'Saving…' : 'Continue'}
                onPress={submit}
            />

            <Text style={styles.progressText}>
                {progress.answeredCount} of {progress.totalCount} · {pct}%
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
    },
    phase: {
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    questionText: {
        color: '#f5f5f5',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'SpaceMono',
    },
    input: {
        backgroundColor: '#333',
        color: '#f5f5f5',
        borderRadius: 8,
        padding: 15,
        width: '100%',
        minHeight: 80,
        fontSize: 16,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    progressText: {
        color: '#888',
        fontSize: 14,
        marginTop: 10,
    },
    subtle: {
        color: '#888',
        fontSize: 14,
        marginTop: 12,
        fontFamily: 'SpaceMono',
    },
    error: {
        color: '#ff8888',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'SpaceMono',
    },
});
