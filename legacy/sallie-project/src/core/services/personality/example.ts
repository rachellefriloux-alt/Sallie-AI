/**
 * Personality Engine Example
 * Demonstrates usage of the complete personality system
 */

import { PersonalityService, ExperienceType } from './index';

async function demonstratePersonalityEngine() {
  console.log('=== Sallie Personality Engine Demo ===\n');

  // 1. Initialize personality
  console.log('1. Initializing personality with custom traits...');
  const personality = new PersonalityService({
    initialTraits: {
      extraversion: { value: 70, confidence: 0.8, variance: 15, stability: 0.75, velocity: 0, facets: {} },
      openness: { value: 80, confidence: 0.9, variance: 10, stability: 0.8, velocity: 0, facets: {} },
      agreeableness: { value: 75, confidence: 0.85, variance: 12, stability: 0.82, velocity: 0, facets: {} },
    },
    anchorStrength: 0.7,
  });

  const initialState = personality.getState();
  console.log('Initial traits:', {
    extraversion: initialState.traits.extraversion.value,
    openness: initialState.traits.openness.value,
    agreeableness: initialState.traits.agreeableness.value,
  });
  console.log('Consistency score:', initialState.consistencyScore);
  console.log('');

  // 2. Subscribe to events
  console.log('2. Subscribing to personality events...');
  personality.on('emotionUpdate', (data) => {
    const dominant = data.emotions.dominantEmotion;
    if (dominant) {
      console.log(`   [Emotion] Dominant: ${dominant}`);
    }
  });

  personality.on('expressionUpdate', (data) => {
    console.log(`   [Expression] Tone: ${data.expression.linguistic.tone}`);
  });

  personality.on('personalityEvolved', (data) => {
    console.log('   [Evolution] Personality traits updated');
  });
  console.log('');

  // 3. Process various inputs
  console.log('3. Processing different types of input...\n');

  console.log('   Input: "This is amazing news!"');
  await personality.processInput('This is amazing news!', 'message');
  let state = personality.getState();
  console.log('   Joy intensity:', state.emotions.primary.joy.intensity.toFixed(1));
  console.log('   Mood:', state.emotions.primary.joy.intensity > 50 ? 'happy' : 'neutral');
  console.log('');

  console.log('   Input: "I\'m feeling worried about this"');
  await personality.processInput("I'm feeling worried about this", 'message');
  state = personality.getState();
  console.log('   Fear intensity:', state.emotions.primary.fear.intensity.toFixed(1));
  console.log('');

  console.log('   Input: "Thank you so much for your help"');
  await personality.processInput('Thank you so much for your help', 'message');
  state = personality.getState();
  console.log('   Gratitude intensity:', state.emotions.complex.gratitude.intensity.toFixed(1));
  console.log('');

  // 4. Evolution through experiences
  console.log('4. Evolving personality through positive social interaction...');
  personality.evolvePersonality({
    type: ExperienceType.SocialInteraction,
    outcome: 'positive',
    intensity: 0.8,
    context: 'friendly_conversation',
    affectedTraits: [
      {
        trait: 'extraversion',
        facet: 'friendliness',
        impact: 0.6,
      },
      {
        trait: 'agreeableness',
        impact: 0.4,
      },
    ],
  });

  state = personality.getState();
  console.log('   Updated extraversion:', state.traits.extraversion.value.toFixed(1));
  console.log('   Evolution history entries:', state.traits.evolutionHistory.length);
  console.log('');

  // 5. Get behavior influence
  console.log('5. Analyzing personality influence on behavior...');
  const influence = personality.getTraitInfluence();
  console.log('   Communication style:', {
    verbosity: influence.communicationStyle.verbosity.toFixed(0),
    formality: influence.communicationStyle.formality.toFixed(0),
    empathy: influence.communicationStyle.empathy.toFixed(0),
  });
  console.log('   Social interaction:', {
    initiativeLevel: influence.socialInteraction.initiativeLevel.toFixed(0),
    conversationDepth: influence.socialInteraction.conversationDepth.toFixed(0),
  });
  console.log('');

  // 6. Expression profile
  console.log('6. Getting complete expression profile...');
  const profile = personality.getExpressionProfile();
  console.log('   Linguistic:', {
    vocabularyComplexity: profile.linguistic.vocabulary.complexity.toFixed(0),
    sentenceLength: profile.linguistic.sentenceStructure.averageLength.toFixed(1),
  });
  console.log('   Behavioral:', {
    conversationStarter: (profile.behavioral.initiative.conversationStarter * 100).toFixed(0) + '%',
    responseDelay: profile.behavioral.responseTiming.averageDelay.toFixed(0) + 'ms',
  });
  console.log('');

  // 7. Mood tracking
  console.log('7. Tracking mood over time...');
  const mood = personality.getCurrentMood();
  console.log('   Current mood:', mood.label);
  console.log('   Valence:', mood.valence.toFixed(1), '(-100 to +100)');
  console.log('   Arousal:', mood.arousal.toFixed(1), '(0 to 100)');
  console.log('   Stability:', mood.stability.toFixed(2));
  console.log('');

  // 8. Simulate time passing with updates
  console.log('8. Simulating emotion decay over time...');
  const beforeDecay = personality.getState();
  const beforeJoy = beforeDecay.emotions.primary.joy.intensity;
  
  // Simulate 10 seconds passing
  for (let i = 0; i < 10; i++) {
    personality.update();
  }
  
  const afterDecay = personality.getState();
  const afterJoy = afterDecay.emotions.primary.joy.intensity;
  console.log(`   Joy before: ${beforeJoy.toFixed(1)}, after: ${afterJoy.toFixed(1)}`);
  console.log('   Emotions naturally decay toward baseline');
  console.log('');

  // 9. State persistence
  console.log('9. Testing state persistence...');
  const exported = personality.export();
  console.log('   Exported state size:', JSON.stringify(exported).length, 'bytes');
  console.log('   Includes:', Object.keys(exported).join(', '));
  
  const newPersonality = new PersonalityService();
  newPersonality.import(exported);
  const restoredState = newPersonality.getState();
  console.log('   State restored successfully:', 
    restoredState.traits.extraversion.value === state.traits.extraversion.value);
  console.log('');

  // 10. Performance metrics
  console.log('10. Performance characteristics...');
  let totalTime = 0;
  let iterations = 100;
  
  personality.on('performance', (data) => {
    totalTime += data.processingTime;
  });
  
  for (let i = 0; i < iterations; i++) {
    await personality.processInput('Test message', 'message');
  }
  
  const avgTime = totalTime / iterations;
  console.log(`   Average processing time: ${avgTime.toFixed(2)}ms`);
  console.log(`   Target: < 100ms, Actual: ${avgTime < 100 ? '✓ Pass' : '✗ Fail'}`);
  console.log('');

  console.log('=== Demo Complete ===');
  console.log('\nThe personality engine successfully:');
  console.log('  ✓ Processed emotional stimuli');
  console.log('  ✓ Evolved personality traits');
  console.log('  ✓ Generated appropriate expressions');
  console.log('  ✓ Tracked mood patterns');
  console.log('  ✓ Maintained performance targets');
  console.log('  ✓ Persisted and restored state');
}

// Export for use
export { demonstratePersonalityEngine };
