<template>
  <div id="app" :style="computedBackgroundStyle" :class="{ 'dynamic-gradient-active': dynamicGradientEnabled }">
    <consent-dialog v-if="consentRequired" :reasons="consentReasons" :dependency-diff="dependencyDiff" @accept="grantConsent" @decline="declineConsent" />
    <template v-else>
      <onboarding-core v-if="!onboarded" @onboarded="handleOnboarded" />
      <div v-else>
        <div class="scenario-bar">
          <button v-for="scenario in scenarios" :key="scenario" @click="respondToUser(userProfile.name, scenario)">{{ capitalize(scenario) }}</button>
        </div>
        <div style="margin-bottom:12px; display:flex; gap:8px;">
          <input v-model="adHocGoal" placeholder="Enter goal e.g. summarize &quot;text here&quot;" style="flex:1; padding:6px 8px; border:1px solid #ccc; border-radius:6px;" />
          <button style="background:#4f46e5; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;" @click="executeGoal">Run</button>
        </div>
        <safe-svg :svg="patternSVG" component-class="visual-bg" />
        <safe-svg :svg="avatarSVG" component-class="persona-avatar" />
        <emotion-overlay :emotion="emotion" :message="emotionMessage" />
        <insight-card :insight="insight" />
        <div style="position:absolute; top:12px; left:12px; display:flex; gap:8px; z-index:50;">
          <button style="background:#222; color:#fff; border:1px solid #444; padding:6px 10px; border-radius:6px; cursor:pointer; font-size:12px;" @click="toggleTransparency">Transparency</button>
        </div>
        <div v-if="hasFullAccess" style="position:relative;">
          <voice-console />
          <safe-svg :svg="emotionMeterSVG" component-class="emotion-meter" />
          <safe-svg :svg="voiceWaveformSVG" component-class="voice-waveform" />
          <task-panel :tasks="tasks" />
          <feature-flags-panel @updated="flagsUpdated" />
          <plugin-registry-panel />
          <transparency-panel :open="showTransparency" :decision="lastDecision" :provenance="lastProvenance" :calibration="riskCalibration" @close="showTransparency=false" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import OnboardingCore from './onboarding/onboardingCore.vue';
import EmotionOverlay from './ui/components/EmotionOverlay.vue';
import VoiceConsole from './ui/components/VoiceConsole.vue';
import TaskPanel from './ui/components/TaskPanel.vue';
import InsightCard from './ui/components/InsightCard.vue';
import ConsentDialog from './ui/components/ConsentDialog.vue';
import FeatureFlagsPanel from './ui/components/FeatureFlagsPanel.vue';
import PluginRegistryPanel from './ui/components/PluginRegistryPanel.vue';
import { adaptivePersonaEngine } from './core/AdaptivePersonaEngine';
import { pluginRegistry } from './core/PluginRegistry';

import { generateTheme } from './ui/visual/themeGenerator';
let highContrastFn = null; let reducedMotionFn = null;
import { generatePatternSVG, generateAvatarSVG } from './ui/visual/svgGenerator';
import { generateEmotionMeterSVG } from './ui/visual/visualizationUtils';
import { generateWaveformSVG } from './ui/visual/voiceVisualUtils';
import { injectVisualCSS } from './ui/visual/cssInjector';
import SafeSvg from './ui/components/SafeSvg.vue';
import { currentFingerprintSegments } from './core/fingerprintRuntime';
import { initConsent, recordConsent } from './core/runtimeConsent';
import { isEnabled, experimentalBlocked } from './core/featureFlags';
import { emotionMap } from './ai/utils/emotionMap';
import { getTraits, onTraits } from './core/PersonalityBridge';
import TransparencyPanel from './ui/components/TransparencyPanel.vue';
import { runGoal, calibrationSummary } from './core/ResearchService';

export default {
  name: 'App',
  components: { OnboardingCore, EmotionOverlay, VoiceConsole, TaskPanel, InsightCard, SafeSvg, ConsentDialog, FeatureFlagsPanel, PluginRegistryPanel, TransparencyPanel },
  data() {
    return {
      onboarded: false,
      emotion: 'calm',
      emotionMessage: 'All clear.',
      detectedScenario: null,
      scenarioVerificationPending: false,
      scenarioCandidates: [],
      insight: 'Welcome to Sallie!',
      userProfile: null,
      hasFullAccess: false,
      tasks: [],
      theme: generateTheme('calm'),
      patternSVG: generatePatternSVG(800, 200, '#80deea'),
      avatarSVG: generateAvatarSVG(42, '#80deea'),
      emotionMeterSVG: generateEmotionMeterSVG(50, '#80deea'),
      voiceWaveformSVG: generateWaveformSVG([10,20,15,30,25,20,10,5,15,25], '#80deea'),
      scenarios: ['stressed','focused','overwhelmed','conflict','celebration','creative','reflective','repair','choose','support','motivate','soothe','clarify'],
      consentRequired: false,
      consentReasons: [],
      experimentalWaveformBlocked: false,
  dependencyDiff: { added: [], removed: [], changed: [] },
  volatility: 0,
  dynamicGradientEnabled: false,
  showTransparency: false,
  lastDecision: null,
  lastProvenance: [],
  riskCalibration: null,
  adHocGoal: ''
    };
  },
  computed: {
    computedBackgroundStyle(){
      const base = { color: this.theme.text };
      if (!this.theme.gradient) { return { ...base, background: this.theme.background || '#111' }; }
      if (isEnabled('auto_contrast')) {
        const text = this.pickContrastColor(this.theme.background || '#000', this.theme.text);
        base.color = text;
      }
      return { ...base, background: this.theme.gradient };
    }
  },
  created() {
    const { decision } = initConsent(currentFingerprintSegments);
    this.consentRequired = decision.requireConsent;
    this.consentReasons = decision.reasons;
    this.experimentalWaveformBlocked = experimentalBlocked('exp_new_waveform');
    this.computeDependencyDiff();
    pluginRegistry.register({ id:'skill_memory', version:'1.0.0', capabilities:['memory','summarize'], enabled:true });
    pluginRegistry.register({ id:'skill_adaptive_persona', version:'1.0.0', capabilities:['persona','tone'], enabled:true });
  onTraits(()=>{ if(this.onboarded) this.updateVisuals(); });
  },
  methods: {
    capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
    updateVisuals() {
      const adj = adaptivePersonaEngine.adjust(this.emotion);
  const traitSnapshot = getTraits();
      const mood = adaptivePersonaEngine.deriveThemeMood(adj, traitSnapshot, this.volatility);
  this.theme = generateTheme(mood);
      this.patternSVG = generatePatternSVG(800, 200, this.theme.accent);
      this.avatarSVG = generateAvatarSVG(42, this.theme.accent);
      this.emotionMeterSVG = generateEmotionMeterSVG(50, this.theme.accent);
      if (isEnabled('exp_new_waveform') && !this.experimentalWaveformBlocked) {
        this.voiceWaveformSVG = generateWaveformSVG([10,25,18,35,28,24,12,8,20,30], this.theme.accent);
      } else {
        this.voiceWaveformSVG = generateWaveformSVG([10,20,15,30,25,20,10,5,15,25], this.theme.accent);
      }
      injectVisualCSS(this.theme.accent);
    },
    computeEmpathyVolatilityMock(){
      this.volatility = (Math.sin(Date.now()/5000)+1)/2;
    },
    enableHighContrast(){ if(!highContrastFn) import('./ui/visual/a11yThemes').then(m=>{ highContrastFn=m.highContrast; this.theme = highContrastFn(this.emotion); }); else this.theme = highContrastFn(this.emotion); },
    enableReducedMotion(){ if(!reducedMotionFn) import('./ui/visual/a11yThemes').then(m=>{ reducedMotionFn=m.reducedMotion; this.theme = reducedMotionFn(this.emotion); }); else this.theme = reducedMotionFn(this.emotion); },
    computeDependencyDiff() {
      try {
        const prevRaw = localStorage.getItem('sallie:lastFingerprint');
        if (!prevRaw) return;
        const prev = JSON.parse(prevRaw);
        const curr = currentFingerprintSegments;
        const prevList = Object.fromEntries(prev.dependenciesList || []);
        const currList = Object.fromEntries(curr.dependenciesList || []);
        const added = [];
        const removed = [];
        const changed = [];
        for (const name of Object.keys(currList)) {
          if (!(name in prevList)) added.push(name);
          else if (prevList[name] !== currList[name]) changed.push({ from: name + '@' + prevList[name], to: currList[name] });
        }
        for (const name of Object.keys(prevList)) if (!(name in currList)) removed.push(name);
        this.dependencyDiff = { added, removed, changed };
      } catch { /* ignore */ }
    },
    grantConsent() {
      recordConsent(currentFingerprintSegments);
      this.consentRequired = false;
      this.experimentalWaveformBlocked = experimentalBlocked('exp_new_waveform');
      this.computeDependencyDiff();
  this.dynamicGradientEnabled = isEnabled('dynamic_gradient');
    },
    declineConsent() { alert('Consent required to proceed with new configuration.'); },
    handleOnboarded(profile) {
      this.onboarded = true;
      this.userProfile = profile;
      this.tasks = profile && profile.tasks ? profile.tasks : [];
      this.hasFullAccess = profile && profile.name === 'Rachelle Friloux';
      if (profile && profile.persona) {
        try {
          const personaEmotion = emotionMap[profile.persona.toLowerCase()] || emotionMap['calm'];
          this.emotion = profile.persona.toLowerCase();
          this.emotionMessage = personaEmotion.message;
        } catch {
          this.emotion = 'calm';
          this.emotionMessage = 'All clear.';
        }
        this.updateVisuals();
      }
      this.insight = `Hello ${profile.name}, Sallie is ready!`;
    },
    respondToUser(userName, scenario = null) {
      if (scenario) {
        const map = { stressed: 'anger', overwhelmed: 'sad', celebration: 'joy', soothe: 'calm', motivate: 'focus', clarify: 'focus' };
        this.emotion = map[scenario] || 'calm';
        this.emotionMessage = `Scenario: ${scenario}`;
        adaptivePersonaEngine.record({ timestamp: Date.now(), emotion: this.emotion, scenario, intensity: 0.7 });
      }
      this.updateVisuals();
    },
    flagsUpdated(){ this.updateVisuals(); },
  toggleTransparency(){ this.showTransparency = !this.showTransparency; },
    async executeGoal(){
      if(!this.adHocGoal) return;
      const outcome = await runGoal(this.adHocGoal);
      this.lastDecision = outcome.decision;
      this.lastProvenance = outcome.provenance || [];
      this.riskCalibration = calibrationSummary();
      this.recordVolatilitySample(outcome);
      if(outcome.understanding?.sentiment?.data?.polarity){
        const pol = outcome.understanding.sentiment.data.polarity;
        this.emotion = pol === 'positive' ? 'happy' : (pol === 'negative' ? 'sad' : 'calm');
        this.emotionMessage = 'Updated from goal';
        adaptivePersonaEngine.record({ timestamp: Date.now(), emotion: this.emotion, intensity: 0.6 });
        this.updateVisuals();
      }
    },
    recordVolatilitySample(outcome){
      try {
        const key = 'sallie:sentimentSamples';
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        const pol = outcome?.understanding?.sentiment?.data?.polarity;
        if(!pol) return;
        arr.push({ t: Date.now(), p: pol });
        while(arr.length>12) arr.shift();
        localStorage.setItem(key, JSON.stringify(arr));
        // compute volatility: transitions count / (n-1)
        let transitions = 0;
        for(let i=1;i<arr.length;i++) if(arr[i].p!==arr[i-1].p) transitions++;
        this.volatility = arr.length>1 ? transitions/(arr.length-1) : 0;
      } catch { /* ignore */ }
    },
    pickContrastColor(bg, fallback){
      try {
        if(bg.startsWith('linear-gradient')){
          // Extract first and last hex colors in gradient
          const matches = bg.match(/#([0-9a-fA-F]{6})/g) || [];
          if(matches.length){
            const first = matches[0];
            const last = matches[matches.length-1];
            const lumFirst = this.computeLuminance(first);
            const lumLast = this.computeLuminance(last);
            const avg = (lumFirst + lumLast)/2;
            return avg > 0.55 ? '#111' : '#f5f5f5';
          }
        }
        const lum = this.computeLuminance(bg);
        return lum > 0.55 ? '#111' : '#f5f5f5';
      } catch { return fallback; }
    },
    computeLuminance(hex){
      const c = hex.startsWith('#') ? hex.substring(1) : hex;
      const r = parseInt(c.substring(0,2),16), g=parseInt(c.substring(2,4),16), b=parseInt(c.substring(4,6),16);
      return (0.2126*r + 0.7152*g + 0.0722*b)/255;
    }
  }
};
</script>

<style>
#app { font-family:'Inter',sans-serif; min-height:100vh; padding:32px; }
.scenario-bar { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
.scenario-bar button { background:#4f46e5; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:0.95em; margin-bottom:4px; }
@keyframes subtleGradientShift {
  0% { filter:brightness(100%); }
  50% { filter:brightness(105%); }
  100% { filter:brightness(100%); }
}
.dynamic-gradient-active { animation: subtleGradientShift 12s ease-in-out infinite; }
</style>
