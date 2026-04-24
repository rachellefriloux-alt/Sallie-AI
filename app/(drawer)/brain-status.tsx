/**
 * Brain Status — live view of the local Sallie Brain service.
 *
 * Shows liveness, readiness, and per-system status from the FastAPI
 * brain at services/brain. This is the first phone↔brain connection;
 * later phases use the same `lib/brain.ts` client to drive Convergence,
 * Limbic queries, etc.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/components/ThemeSystem';
import {
    brain,
    BrainError,
    getBrainBaseUrl,
    type ReadyResponse,
    type SystemStatus,
} from '@/lib/brain';

type Status =
    | { kind: 'loading' }
    | { kind: 'ok'; data: ReadyResponse }
    | { kind: 'error'; message: string };

// ---- per-system detail formatting --------------------------------------
//
// The brain returns rich per-system fields (synthesis counters, limbic
// emotion, memory sizes, etc.) on top of the base `running` flag. We
// render a compact one-or-two-line summary under each row. Stub systems
// that only expose `name`/`running` fall through and show nothing extra,
// keeping the list quiet for the systems that aren't doing real work yet.

function formatRelativeTime(iso: string): string {
    const ts = Date.parse(iso);
    if (Number.isNaN(ts)) return iso;
    const deltaMs = Date.now() - ts;
    if (deltaMs < 0) return 'just now';
    const sec = Math.floor(deltaMs / 1000);
    if (sec < 5) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
}

function formatNumber(n: unknown): string | null {
    if (typeof n !== 'number' || !Number.isFinite(n)) return null;
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function getString(sys: SystemStatus, key: string): string | null {
    const v = sys[key];
    return typeof v === 'string' && v.length > 0 ? v : null;
}

function getNumber(sys: SystemStatus, key: string): number | null {
    const v = sys[key];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Returns up to two human-readable detail lines for a system, or `null`
 * when the system only has the base running/down state.
 */
function describeSystem(name: string, sys: SystemStatus): string[] {
    const lines: string[] = [];
    switch (name) {
        case 'synthesis': {
            const total = getNumber(sys, 'responses_total');
            const lastQuery = getString(sys, 'last_query');
            const lastCites = getNumber(sys, 'last_citation_count');
            const lastAt = getString(sys, 'last_at');
            const grounded = sys['last_knowledge_available'];
            if (total !== null) {
                lines.push(
                    `${total} response${total === 1 ? '' : 's'}` +
                    (lastAt ? ` · last ${formatRelativeTime(lastAt)}` : ''),
                );
            }
            if (lastQuery) {
                const cites =
                    lastCites !== null
                        ? ` (${lastCites} cite${lastCites === 1 ? '' : 's'}${
                              grounded === false ? ', ungrounded' : ''
                          })`
                        : '';
                lines.push(`"${lastQuery}"${cites}`);
            }
            break;
        }
        case 'limbic': {
            const emotion = getString(sys, 'dominant_emotion');
            const valence = formatNumber(getNumber(sys, 'valence'));
            const arousal = formatNumber(getNumber(sys, 'arousal'));
            const parts: string[] = [];
            if (emotion) parts.push(emotion);
            if (valence !== null) parts.push(`v=${valence}`);
            if (arousal !== null) parts.push(`a=${arousal}`);
            if (parts.length) lines.push(parts.join(' · '));
            break;
        }
        case 'memory': {
            const working = getNumber(sys, 'working_size');
            const episodic = getNumber(sys, 'episodic_size');
            const parts: string[] = [];
            if (working !== null) parts.push(`working ${working}`);
            if (episodic !== null) parts.push(`episodic ${episodic}`);
            if (parts.length) lines.push(parts.join(' · '));
            break;
        }
        case 'monologue': {
            const buffered = getNumber(sys, 'buffered');
            if (buffered !== null) {
                lines.push(`${buffered} buffered`);
            }
            break;
        }
        default:
            break;
    }
    return lines;
}

export default function BrainStatusScreen() {
    const { theme } = useTheme();
    const [status, setStatus] = useState<Status>({ kind: 'loading' });
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await brain.ready();
            setStatus({ kind: 'ok', data });
        } catch (err) {
            const message =
                err instanceof BrainError ? err.message : String(err);
            setStatus({ kind: 'error', message });
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }, [load]);

    const colors = theme.colors;

    return (
        <ScrollView
            style={[
                styles.container,
                { backgroundColor: colors.background },
            ]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <Text style={[styles.title, { color: colors.text.primary }]}>
                🧠 Brain Status
            </Text>
            <Text style={[styles.url, { color: colors.text.secondary }]}>
                {getBrainBaseUrl()}
            </Text>

            {status.kind === 'loading' && (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={[styles.muted, { color: colors.text.secondary }]}>
                        contacting brain…
                    </Text>
                </View>
            )}

            {status.kind === 'error' && (
                <View
                    style={[
                        styles.card,
                        { backgroundColor: colors.surface },
                    ]}
                >
                    <Text style={[styles.cardTitle, { color: colors.error }]}>
                        offline
                    </Text>
                    <Text style={[styles.muted, { color: colors.text.secondary }]}>
                        {status.message}
                    </Text>
                    <TouchableOpacity onPress={onRefresh} style={styles.retry}>
                        <Text style={{ color: colors.text.primary }}>retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {status.kind === 'ok' && (
                <>
                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: colors.surface,
                                borderColor: status.data.ready
                                    ? colors.success
                                    : colors.warning,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.cardTitle,
                                {
                                    color: status.data.ready
                                        ? colors.success
                                        : colors.warning,
                                },
                            ]}
                        >
                            {status.data.ready ? 'all systems online' : 'partial'}
                        </Text>
                        <Text
                            style={[styles.muted, { color: colors.text.secondary }]}
                        >
                            {Object.keys(status.data.systems).length} systems
                        </Text>
                    </View>

                    {Object.entries(status.data.systems).map(([name, sys]) => {
                        const detailLines = describeSystem(name, sys);
                        return (
                            <View
                                key={name}
                                style={[
                                    styles.row,
                                    { backgroundColor: colors.surface },
                                ]}
                            >
                                <View style={styles.rowHeader}>
                                    <View style={styles.rowLeft}>
                                        <View
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor: sys.running
                                                        ? colors.success
                                                        : colors.error,
                                                },
                                            ]}
                                        />
                                        <Text style={{ color: colors.text.primary }}>
                                            {name}
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.muted,
                                            { color: colors.text.secondary },
                                        ]}
                                    >
                                        {sys.running ? 'running' : 'down'}
                                    </Text>
                                </View>
                                {detailLines.map((line, idx) => (
                                    <Text
                                        key={idx}
                                        style={[
                                            styles.detail,
                                            { color: colors.text.secondary },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        {line}
                                    </Text>
                                ))}
                            </View>
                        );
                    })}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    url: { fontSize: 12, marginBottom: 20, fontFamily: 'SpaceMono' },
    center: { alignItems: 'center', padding: 40, gap: 12 },
    card: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 6,
    },
    cardTitle: { fontSize: 18, fontWeight: '600' },
    muted: { fontSize: 13 },
    row: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 6,
        gap: 4,
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    detail: {
        fontSize: 12,
        marginLeft: 20,
    },
    retry: {
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(127,127,127,0.4)',
    },
});
