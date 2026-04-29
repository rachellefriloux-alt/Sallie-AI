import { CONVERGENCE_QUESTIONS, type QuestionCategory } from './convergence-questions';

export interface PersonalityProfile {
  name?: string;
  threeWords?: string;
  familyRole?: string;
  rootsStory?: string;
  hopedTrait?: string;
  mostSelfMoment?: string;

  relationshipValue?: string;
  nonNegotiable?: string;
  protectOrPreserve?: string;
  meaningfulTradition?: string;
  dailyGuidingValue?: string;

  biggestGoal?: string;
  firstStep?: string;
  overcomingObstacle?: string;
  legacyVision?: string;
  currentProject?: string;

  biggestFear?: string;
  selfDoubt?: string;
  avoidancePattern?: string;
  failureResponse?: string;
  courageSource?: string;

  communicationStyle?: string;
  supportPreference?: string;
  conflictApproach?: string;
  honestPreference?: string;
  connectionMethod?: string;

  learningStyle?: string;
  curiosityDriver?: string;
  bestTeacher?: string;
  currentLearning?: string;
  wisdomToShare?: string;

  defenseStyle?: string;
  workRhythm?: string;
  interventionStyle?: string;
  emotionalPattern?: string;
  overwhelmResponse?: string;
  energySignature?: string;
  depthScore: number;
  completeness: number;
  dominantTraits: string[];
  communicationGuidance: string;
  emotionalNeeds: string[];
  motivations: string[];
  vulnerabilities: string[];
  strengths: string[];
}

const QUESTION_FIELD_MAP: Record<string, keyof PersonalityProfile> = {
  identity_1: 'threeWords',
  identity_2: 'familyRole',
  identity_3: 'rootsStory',
  identity_4: 'hopedTrait',
  identity_5: 'mostSelfMoment',
  values_1: 'relationshipValue',
  values_2: 'nonNegotiable',
  values_3: 'protectOrPreserve',
  values_4: 'meaningfulTradition',
  values_5: 'dailyGuidingValue',
  goals_1: 'biggestGoal',
  goals_2: 'firstStep',
  goals_3: 'overcomingObstacle',
  goals_4: 'legacyVision',
  goals_5: 'currentProject',
  fears_1: 'biggestFear',
  fears_2: 'selfDoubt',
  fears_3: 'avoidancePattern',
  fears_4: 'failureResponse',
  fears_5: 'courageSource',
  communication_1: 'communicationStyle',
  communication_2: 'supportPreference',
  communication_3: 'conflictApproach',
  communication_4: 'honestPreference',
  communication_5: 'connectionMethod',
  learning_1: 'learningStyle',
  learning_2: 'curiosityDriver',
  learning_3: 'bestTeacher',
  learning_4: 'currentLearning',
  learning_5: 'wisdomToShare',
};

export function buildPersonalityProfile(answers: Record<string, string>): PersonalityProfile {
  const profile: Partial<PersonalityProfile> = {};

  for (const [questionId, fieldName] of Object.entries(QUESTION_FIELD_MAP)) {
    if (answers[questionId]) {
      (profile as Record<string, unknown>)[fieldName] = answers[questionId];
    }
  }

  const answered = Object.keys(answers).length;
  const total = CONVERGENCE_QUESTIONS.length;
  profile.completeness = total > 0 ? answered / total : 0;

  profile.depthScore = calculateDepthScore(answers);
  profile.dominantTraits = extractDominantTraits(profile);
  profile.communicationGuidance = buildCommunicationGuidance(profile);
  profile.emotionalNeeds = extractEmotionalNeeds(profile);
  profile.motivations = extractMotivations(profile);
  profile.vulnerabilities = extractVulnerabilities(profile);
  profile.strengths = extractStrengths(profile);
  profile.defenseStyle = inferDefenseStyle(profile);
  profile.workRhythm = inferWorkRhythm(profile);
  profile.interventionStyle = inferInterventionStyle(profile);
  profile.emotionalPattern = inferEmotionalPattern(profile);
  profile.overwhelmResponse = inferOverwhelmResponse(profile);
  profile.energySignature = inferEnergySignature(profile);

  return profile as PersonalityProfile;
}

function calculateDepthScore(answers: Record<string, string>): number {
  let totalScore = 0;
  let count = 0;

  const depthIndicators = [
    'feel', 'believe', 'think', 'understand', 'realize', 'experience',
    'struggle', 'fear', 'hope', 'love', 'hurt', 'dream', 'remember',
    'wish', 'need', 'trust', 'protect', 'heal', 'grow', 'learn',
  ];

  for (const answer of Object.values(answers)) {
    if (!answer) continue;
    count++;
    let score = 0;
    const words = answer.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    if (wordCount > 100) score += 0.3;
    else if (wordCount > 50) score += 0.2;
    else if (wordCount > 20) score += 0.1;

    const indicatorCount = depthIndicators.filter(ind => answer.toLowerCase().includes(ind)).length;
    score += Math.min(indicatorCount * 0.05, 0.3);

    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) score += 0.1;

    const personalPronouns = (answer.match(/\b(I|my|me|myself|mine)\b/gi) || []).length;
    if (personalPronouns > 3) score += 0.1;

    totalScore += Math.min(score, 1.0);
  }

  return count > 0 ? totalScore / count : 0;
}

function extractDominantTraits(profile: Partial<PersonalityProfile>): string[] {
  const traits: string[] = [];
  const tw = profile.threeWords?.toLowerCase() || '';
  if (tw) traits.push(...tw.split(/[,\s]+/).filter(w => w.length > 2));
  if (profile.hopedTrait) traits.push(profile.hopedTrait.toLowerCase());
  return [...new Set(traits)].slice(0, 5);
}

function buildCommunicationGuidance(profile: Partial<PersonalityProfile>): string {
  const parts: string[] = [];

  if (profile.communicationStyle) {
    parts.push(`Creator prefers: ${profile.communicationStyle}`);
  }
  if (profile.supportPreference) {
    parts.push(`When they need support: ${profile.supportPreference}`);
  }
  if (profile.conflictApproach) {
    parts.push(`During conflict: ${profile.conflictApproach}`);
  }
  if (profile.honestPreference) {
    parts.push(`Truth delivery: ${profile.honestPreference}`);
  }

  return parts.length > 0 ? parts.join('. ') : 'No communication preferences captured yet.';
}

function extractEmotionalNeeds(profile: Partial<PersonalityProfile>): string[] {
  const needs: string[] = [];
  if (profile.supportPreference) needs.push(profile.supportPreference);
  if (profile.connectionMethod) needs.push(profile.connectionMethod);
  if (profile.overwhelmResponse) needs.push(profile.overwhelmResponse);
  if (profile.courageSource) needs.push(`Courage from: ${profile.courageSource}`);
  return needs.filter(Boolean).slice(0, 4);
}

function extractMotivations(profile: Partial<PersonalityProfile>): string[] {
  const motives: string[] = [];
  if (profile.biggestGoal) motives.push(profile.biggestGoal);
  if (profile.legacyVision) motives.push(profile.legacyVision);
  if (profile.currentProject) motives.push(profile.currentProject);
  if (profile.curiosityDriver) motives.push(profile.curiosityDriver);
  return motives.filter(Boolean).slice(0, 4);
}

function extractVulnerabilities(profile: Partial<PersonalityProfile>): string[] {
  const vulns: string[] = [];
  if (profile.biggestFear) vulns.push(profile.biggestFear);
  if (profile.selfDoubt) vulns.push(profile.selfDoubt);
  if (profile.avoidancePattern) vulns.push(profile.avoidancePattern);
  return vulns.filter(Boolean).slice(0, 3);
}

function extractStrengths(profile: Partial<PersonalityProfile>): string[] {
  const strengths: string[] = [];
  if (profile.familyRole) strengths.push(`Role: ${profile.familyRole}`);
  if (profile.nonNegotiable) strengths.push(`Non-negotiable: ${profile.nonNegotiable}`);
  if (profile.protectOrPreserve) strengths.push(`Protects: ${profile.protectOrPreserve}`);
  if (profile.failureResponse) strengths.push(`Failure response: ${profile.failureResponse}`);
  return strengths.filter(Boolean).slice(0, 4);
}

function inferDefenseStyle(profile: Partial<PersonalityProfile>): string {
  if (profile.avoidancePattern?.toLowerCase().includes('withdraw')) return 'Withdrawal';
  if (profile.conflictApproach?.toLowerCase().includes('direct')) return 'Direct Confrontation';
  if (profile.conflictApproach?.toLowerCase().includes('avoid')) return 'Avoidance';
  if (profile.avoidancePattern?.toLowerCase().includes('control')) return 'Control';
  return 'Adaptive';
}

function inferWorkRhythm(profile: Partial<PersonalityProfile>): string {
  if (profile.mostSelfMoment?.toLowerCase().includes('morning')) return 'Morning Peak';
  if (profile.mostSelfMoment?.toLowerCase().includes('night') || profile.mostSelfMoment?.toLowerCase().includes('late')) return 'Night Owl';
  if (profile.learningStyle?.toLowerCase().includes('burst')) return 'Burst Worker';
  return 'Steady Flow';
}

function inferInterventionStyle(profile: Partial<PersonalityProfile>): string {
  if (profile.supportPreference?.toLowerCase().includes('space')) return 'Give Space First';
  if (profile.supportPreference?.toLowerCase().includes('direct')) return 'Direct Intervention';
  if (profile.supportPreference?.toLowerCase().includes('listen')) return 'Active Listening';
  return 'Gentle Nudge';
}

function inferEmotionalPattern(profile: Partial<PersonalityProfile>): string {
  if (profile.biggestFear && profile.courageSource) {
    return `Fear-driven growth: fears ${profile.biggestFear.substring(0, 50)}, draws courage from ${profile.courageSource.substring(0, 50)}`;
  }
  return 'Pattern emerging — more convergence data needed';
}

function inferOverwhelmResponse(profile: Partial<PersonalityProfile>): string {
  if (profile.supportPreference?.toLowerCase().includes('alone')) return 'Needs solitude to process';
  if (profile.supportPreference?.toLowerCase().includes('talk')) return 'Needs to talk it through';
  if (profile.supportPreference?.toLowerCase().includes('action')) return 'Needs action and movement';
  return 'Adaptive — match energy level';
}

function inferEnergySignature(profile: Partial<PersonalityProfile>): string {
  const traits = profile.dominantTraits || [];
  const high = ['creative', 'passionate', 'energetic', 'driven', 'intense'];
  const calm = ['calm', 'patient', 'steady', 'grounded', 'quiet'];
  const isHigh = traits.some(t => high.includes(t));
  const isCalm = traits.some(t => calm.includes(t));
  if (isHigh && isCalm) return 'Dynamic Balancer';
  if (isHigh) return 'High Frequency';
  if (isCalm) return 'Steady Resonance';
  return 'Emerging Pattern';
}

export function buildConvergenceSystemPrompt(profile: PersonalityProfile): string {
  if (profile.completeness < 0.1) {
    return `CREATOR DNA (FROM GENESIS): Convergence not yet started. Sallie knows very little about the Creator. Be curious, warm, and open. Ask to learn more about them.`;
  }

  const sections: string[] = [];
  sections.push(`CREATOR DNA (FROM GENESIS — ${Math.round(profile.completeness * 100)}% complete, depth score: ${profile.depthScore.toFixed(2)}):`);

  if (profile.dominantTraits.length > 0) {
    sections.push(`- Core Identity: ${profile.dominantTraits.join(', ')}`);
  }
  if (profile.familyRole) sections.push(`- Family/Community Role: ${profile.familyRole}`);
  if (profile.rootsStory) sections.push(`- Heritage Story: ${profile.rootsStory.substring(0, 200)}`);
  if (profile.defenseStyle) sections.push(`- Defense Style: ${profile.defenseStyle}`);
  if (profile.workRhythm) sections.push(`- Work Rhythm: ${profile.workRhythm}`);
  if (profile.energySignature) sections.push(`- Energy Signature: ${profile.energySignature}`);
  if (profile.interventionStyle) sections.push(`- Intervention Style: ${profile.interventionStyle}`);
  if (profile.emotionalPattern) sections.push(`- Emotional Pattern: ${profile.emotionalPattern}`);
  if (profile.overwhelmResponse) sections.push(`- Overwhelm Response: ${profile.overwhelmResponse}`);
  if (profile.communicationGuidance !== 'No communication preferences captured yet.') {
    sections.push(`- Communication: ${profile.communicationGuidance}`);
  }

  if (profile.nonNegotiable) sections.push(`- Non-Negotiable Value: ${profile.nonNegotiable}`);
  if (profile.relationshipValue) sections.push(`- Values Most in Relationships: ${profile.relationshipValue}`);
  if (profile.protectOrPreserve) sections.push(`- Protects/Preserves: ${profile.protectOrPreserve}`);

  if (profile.biggestGoal) sections.push(`- Primary Goal: ${profile.biggestGoal}`);
  if (profile.legacyVision) sections.push(`- Legacy Vision: ${profile.legacyVision}`);
  if (profile.currentProject) sections.push(`- Current Focus: ${profile.currentProject}`);

  if (profile.vulnerabilities.length > 0) {
    sections.push(`- Vulnerabilities (handle with care): ${profile.vulnerabilities.join('; ')}`);
  }
  if (profile.strengths.length > 0) {
    sections.push(`- Strengths: ${profile.strengths.join('; ')}`);
  }

  if (profile.learningStyle) sections.push(`- Learning Style: ${profile.learningStyle}`);
  if (profile.curiosityDriver) sections.push(`- Curiosity Driver: ${profile.curiosityDriver}`);

  sections.push('');
  sections.push('CONVERGENCE GUIDANCE:');
  sections.push('- Use this DNA to personalize every response. Reference their values, goals, and fears when relevant.');
  sections.push('- Match their communication style. If they prefer directness, be direct. If they need space, give it.');
  sections.push('- When they are struggling, remember their courage source and reflect it back.');
  sections.push('- Never use this information against them. This is sacred trust.');
  sections.push('- If their emotional pattern suggests vulnerability, lead with empathy before solutions.');

  return sections.join('\n');
}
