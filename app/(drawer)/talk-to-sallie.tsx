/**
 * Talk to Sallie — calls the brain's /synthesis/respond endpoint.
 *
 * This is the first end-to-end "ask a question, get a grounded answer"
 * surface in the app. It sits on top of `lib/brain.ts` so we share the
 * same base URL, error type, and timeout handling as every other
 * brain-touching screen.
 *
 * Behaviour:
 *  - Submitting an empty question is disabled (the brain would 422 anyway).
 *  - Errors are caught and shown inline; a retry doesn't drop the draft.
 *  - When the knowledge service is down the brain still returns 200 with
 *    `knowledge_available=false`; we surface that as an "ungrounded"
 *    badge so users know the answer isn't sourced.
 *  - Citations are listed with their score so it's obvious which source
 *    drove which `[n]` reference in the answer.
 */
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '@/components/ThemeSystem';
import {
    brain,
    BrainError,
    getBrainBaseUrl,
    type RespondResponse,
} from '@/lib/brain';

type Status =
    | { kind: 'idle' }
    | { kind: 'asking' }
    | { kind: 'answered'; data: RespondResponse }
    | { kind: 'error'; message: string };

const MAX_QUERY_CHARS = 4000;

export default function TalkToSallieScreen() {
    const { theme } = useTheme();
    const [draft, setDraft] = useState('');
    const [status, setStatus] = useState<Status>({ kind: 'idle' });

    const ask = useCallback(async () => {
        const query = draft.trim();
        if (!query) return;
        setStatus({ kind: 'asking' });
        try {
            const data = await brain.synthesis.respond(query);
            setStatus({ kind: 'answered', data });
        } catch (err) {
            setStatus({
                kind: 'error',
                message:
                    err instanceof BrainError
                        ? err.message
                        : `Could not reach Sallie at ${getBrainBaseUrl()}.`,
            });
        }
    }, [draft]);

    const canSubmit =
        status.kind !== 'asking' &&
        draft.trim().length > 0 &&
        draft.length <= MAX_QUERY_CHARS;

    const styles = makeStyles(theme);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.heading}>Ask Sallie anything</Text>
                <Text style={styles.sub}>
                    She'll search her knowledge and answer with sources.
                </Text>

                <TextInput
                    style={styles.input}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="What's on your mind?"
                    placeholderTextColor={theme.colors.text.secondary}
                    multiline
                    maxLength={MAX_QUERY_CHARS}
                    editable={status.kind !== 'asking'}
                />

                <TouchableOpacity
                    style={[styles.button, !canSubmit && styles.buttonDisabled]}
                    onPress={ask}
                    disabled={!canSubmit}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canSubmit }}
                >
                    {status.kind === 'asking' ? (
                        <ActivityIndicator color={theme.colors.text.primary} />
                    ) : (
                        <Text style={styles.buttonText}>Ask</Text>
                    )}
                </TouchableOpacity>

                {status.kind === 'error' && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{status.message}</Text>
                    </View>
                )}

                {status.kind === 'answered' && (
                    <AnswerView data={status.data} />
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

function AnswerView({ data }: { data: RespondResponse }) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);
    return (
        <View style={styles.answerBox}>
            <View style={styles.badgeRow}>
                <View
                    style={[
                        styles.badge,
                        data.knowledge_available
                            ? styles.badgeGrounded
                            : styles.badgeUngrounded,
                    ]}
                >
                    <Text style={styles.badgeText}>
                        {data.knowledge_available ? 'GROUNDED' : 'UNGROUNDED'}
                    </Text>
                </View>
                <Text style={styles.metaText}>
                    {data.citations.length} source
                    {data.citations.length === 1 ? '' : 's'}
                </Text>
            </View>

            <Text style={styles.answerText}>{data.answer}</Text>

            {data.citations.length > 0 && (
                <View style={styles.citations}>
                    <Text style={styles.citationsHeading}>Sources</Text>
                    {data.citations.map((c, i) => (
                        <View key={c.id} style={styles.citationRow}>
                            <Text style={styles.citationIndex}>[{i + 1}]</Text>
                            <View style={styles.citationBody}>
                                <Text style={styles.citationTitle}>{c.title}</Text>
                                <Text style={styles.citationMeta}>
                                    {c.id} · score {c.score.toFixed(3)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

function makeStyles(theme: ReturnType<typeof useTheme>['theme']) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        scroll: { padding: 16, paddingBottom: 48 },
        heading: {
            color: theme.colors.text.primary,
            fontFamily: 'SpaceMono',
            fontSize: 22,
            fontWeight: '600',
            marginBottom: 4,
        },
        sub: {
            color: theme.colors.text.secondary,
            fontFamily: 'SpaceMono',
            fontSize: 13,
            marginBottom: 16,
        },
        input: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text.primary,
            borderColor: theme.colors.border.medium,
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            minHeight: 100,
            fontSize: 16,
            textAlignVertical: 'top',
            marginBottom: 12,
        },
        button: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 16,
        },
        buttonDisabled: { opacity: 0.4 },
        buttonText: {
            color: theme.colors.text.primary,
            fontFamily: 'SpaceMono',
            fontSize: 16,
            fontWeight: '600',
        },
        errorBox: {
            backgroundColor: theme.colors.surface,
            borderColor: '#ff8888',
            borderWidth: 1,
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
        },
        errorText: {
            color: '#ff8888',
            fontFamily: 'SpaceMono',
            fontSize: 14,
        },
        answerBox: {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border.medium,
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
        },
        badgeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        badge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
        },
        badgeGrounded: { backgroundColor: '#1f6f3f' },
        badgeUngrounded: { backgroundColor: '#7a5a1f' },
        badgeText: {
            color: '#f5f5f5',
            fontFamily: 'SpaceMono',
            fontSize: 11,
            letterSpacing: 1,
        },
        metaText: {
            color: theme.colors.text.secondary,
            fontFamily: 'SpaceMono',
            fontSize: 12,
        },
        answerText: {
            color: theme.colors.text.primary,
            fontFamily: 'SpaceMono',
            fontSize: 15,
            lineHeight: 22,
        },
        citations: {
            marginTop: 16,
            borderTopColor: theme.colors.border.medium,
            borderTopWidth: 1,
            paddingTop: 12,
        },
        citationsHeading: {
            color: theme.colors.text.secondary,
            fontFamily: 'SpaceMono',
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 8,
        },
        citationRow: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        citationIndex: {
            color: theme.colors.text.secondary,
            fontFamily: 'SpaceMono',
            fontSize: 13,
            width: 32,
        },
        citationBody: { flex: 1 },
        citationTitle: {
            color: theme.colors.text.primary,
            fontFamily: 'SpaceMono',
            fontSize: 14,
        },
        citationMeta: {
            color: theme.colors.text.secondary,
            fontFamily: 'SpaceMono',
            fontSize: 11,
            marginTop: 2,
        },
    });
}
