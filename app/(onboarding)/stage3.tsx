import React, { useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { ConvergenceFlow } from '@/components/onboarding/ConvergenceFlow';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { SkipButton } from '@/components/onboarding/SkipButton';
import { brain } from '@/lib/brain';
import { useUserStore } from '@/store/user';

/**
 * Map brain Convergence question ids → local profile keys.
 *
 * The local QASystem flow this stage previously hosted asked 10 keyed
 * questions and wrote them into the user store. The brain's Convergence
 * is the canonical version of that same ritual — 40 questions instead
 * of 10, but driven by the same intent: "calibrate Sallie to this
 * person." Stages 5 and 6 still read the keyed answers from the local
 * store, so when the brain session completes we project the relevant
 * answers across using this table.
 *
 * Question ids chosen by matching the QASystem keys against the brain's
 * questions.json. Anything without a clear match (e.g. "title",
 * "location", "season") is intentionally left out — stage5 already
 * handles missing fields gracefully.
 */
const CONVERGENCE_TO_PROFILE: Record<number, string> = {
  38: 'name',          // visage — "name you want me to call you"
  6: 'mission',        // leopard — "grand vision shall we manifest together"
  10: 'dare',          // leopard — "what risks are worth taking"
  4: 'decisionStyle',  // obsidian — "sacred protocol when perspectives diverge"
  1: 'nonnegotiable',  // obsidian — "sacred boundary I must never cross"
  11: 'rhythm',        // leopard — "how shall we celebrate our victories"
  15: 'aesthetics',    // peacock — "what is true beauty to us"
};

export default function Stage3() {
  const { setOnboardingAnswers } = useUserStore();

  const handleComplete = useCallback(async (sessionId: string) => {
    // Pull the completed session and project its answers into the local
    // store under the keys downstream stages still consume. Failures
    // here mustn't block onboarding — the user just answered 40
    // questions, the worst case is downstream stages fall back to
    // their default copy ("my counterpart" etc.).
    try {
      const session = await brain.convergence.getSession(sessionId);
      const mapped: Record<string, string> = {};
      for (const [qidStr, key] of Object.entries(CONVERGENCE_TO_PROFILE)) {
        const entry = session.answers[qidStr];
        if (entry?.value != null) {
          mapped[key] = String(entry.value).trim();
        }
      }
      if (Object.keys(mapped).length > 0) {
        setOnboardingAnswers(mapped);
      }
    } catch {
      // brain unreachable post-completion — non-fatal, continue.
    }
    router.push('/(onboarding)/stage4' as any);
  }, [setOnboardingAnswers]);

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <OnboardingStage>
      <SkipButton onSkip={handleSkip} />
      <ProgressIndicator currentStep={3} totalSteps={6} />
      <Text style={styles.title}>The Calibration</Text>
      <ConvergenceFlow onComplete={handleComplete} />
    </OnboardingStage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#f5f5f5',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'SpaceMono',
  },
});