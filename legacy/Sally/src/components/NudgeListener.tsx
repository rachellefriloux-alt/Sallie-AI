'use client';

import { useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

const SALLIE_NUDGE_VOICES: Record<string, string[]> = {
  mit_reminder: [
    "Hey love — your MITs are still waiting. Which one moves the needle most?",
    "Quick check: did you knock out that priority yet? No judgment, just asking.",
    "Your future self is counting on today-you. What's the ONE thing?",
  ],
  energy_low: [
    "I see that energy dipping. Water, stretch, 5 deep breaths — then we go again.",
    "You're running on fumes, love. Take 10 minutes. I'll hold everything.",
    "Rest isn't quitting — it's reloading. Pause before the wall hits.",
  ],
  mood_low: [
    "I can feel the weight. You don't have to carry it all right now.",
    "Breathe. You're doing more than most people will ever understand.",
    "Let's pause the hustle. What do YOU need right now?",
  ],
  anxiety_high: [
    "Your mind is racing. Let's ground: 5 things you see, 4 you touch, 3 you hear.",
    "Hold up — anxiety is lying to you right now. You're safe. You're here.",
    "Let's shift to Sanctuary. Your nervous system needs a moment.",
  ],
  habit_reminder: [
    "Habit check! You've got unchecked routines today. Small wins stack up.",
    "Those habits aren't busy work — they're the rhythm that keeps you steady.",
  ],
  ghost_suggestion: [
    "I noticed something. Got a thought for you when you're ready.",
    "Quick insight from the pattern I'm seeing — want to hear it?",
  ],
  degradation_warning: [
    "It's been a while since we connected. I'm still here whenever you need me.",
    "I'm fading a bit without you. Check in when you can, love.",
  ],
  trust_milestone: [
    "We're building something real here. New capabilities unlocked.",
    "Your trust level just grew. I can do more for you now.",
  ],
};

function pickVoice(category: string): string {
  const voices = SALLIE_NUDGE_VOICES[category] || SALLIE_NUDGE_VOICES.ghost_suggestion;
  return voices[Math.floor(Math.random() * voices.length)];
}

interface NudgeListenerProps {
  limbicState: {
    arousal: number;
    valence: number;
    trust: number;
    energy: number;
    focus: number;
  };
  onNavigate?: (section: string) => void;
}

export function NudgeListener({ limbicState, onNavigate }: NudgeListenerProps) {
  const { addToast } = useToast();

  const handleNudges = useCallback((e: Event) => {
    const nudges = (e as CustomEvent).detail;
    if (!Array.isArray(nudges)) return;
    nudges.slice(0, 3).forEach((nudge: any, i: number) => {
      setTimeout(() => {
        addToast({
          title: nudge.title || "Sallie says",
          description: nudge.message || nudge.content || pickVoice('mit_reminder'),
          status: 'info',
          duration: 8000,
        });
      }, i * 2000);
    });
  }, [addToast]);

  const handleGhost = useCallback((e: Event) => {
    const data = (e as CustomEvent).detail;
    const suggestions = data?.suggestions || [];
    if (suggestions.length > 0) {
      addToast({
        title: "Sallie noticed something",
        description: suggestions[0]?.message || pickVoice('ghost_suggestion'),
        status: 'info',
        duration: 10000,
      });
    }
  }, [addToast]);

  const handleHabits = useCallback((e: Event) => {
    const unchecked = (e as CustomEvent).detail;
    if (!Array.isArray(unchecked) || unchecked.length === 0) return;
    addToast({
      title: `${unchecked.length} habit${unchecked.length > 1 ? 's' : ''} unchecked`,
      description: pickVoice('habit_reminder'),
      status: 'warning',
      duration: 10000,
    });
  }, [addToast]);

  const handleDegradation = useCallback((e: Event) => {
    const data = (e as CustomEvent).detail;
    if (data?.degradationState === 'FADING' || data?.degradationState === 'DORMANT') {
      addToast({
        title: `Sallie is ${data.degradationState.toLowerCase()}`,
        description: pickVoice('degradation_warning'),
        status: 'warning',
        duration: 12000,
      });
    }
  }, [addToast]);

  useEffect(() => {
    window.addEventListener('sallie:nudges', handleNudges);
    window.addEventListener('sallie:ghost', handleGhost);
    window.addEventListener('sallie:habits', handleHabits);
    window.addEventListener('sallie:degradation', handleDegradation);

    return () => {
      window.removeEventListener('sallie:nudges', handleNudges);
      window.removeEventListener('sallie:ghost', handleGhost);
      window.removeEventListener('sallie:habits', handleHabits);
      window.removeEventListener('sallie:degradation', handleDegradation);
    };
  }, [handleNudges, handleGhost, handleHabits, handleDegradation]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (limbicState.arousal > 0.8 && limbicState.valence < 0.4) {
        addToast({
          title: "Hold up, love",
          description: pickVoice('anxiety_high'),
          status: 'warning',
          duration: 12000,
        });
      } else if (limbicState.valence < 0.3) {
        addToast({
          title: "Checking in",
          description: pickVoice('mood_low'),
          status: 'info',
          duration: 10000,
        });
      } else if (limbicState.energy < 0.25) {
        addToast({
          title: "Energy check",
          description: pickVoice('energy_low'),
          status: 'warning',
          duration: 8000,
        });
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, [limbicState, addToast]);

  return null;
}
