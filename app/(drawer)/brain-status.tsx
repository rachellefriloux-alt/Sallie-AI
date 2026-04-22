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
} from '@/lib/brain';

type Status =
    | { kind: 'loading' }
    | { kind: 'ok'; data: ReadyResponse }
    | { kind: 'error'; message: string };

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

                    {Object.entries(status.data.systems).map(([name, sys]) => (
                        <View
                            key={name}
                            style={[
                                styles.row,
                                { backgroundColor: colors.surface },
                            ]}
                        >
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
                                style={[styles.muted, { color: colors.text.secondary }]}
                            >
                                {sys.running ? 'running' : 'down'}
                            </Text>
                        </View>
                    ))}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 6,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    retry: {
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(127,127,127,0.4)',
    },
});
