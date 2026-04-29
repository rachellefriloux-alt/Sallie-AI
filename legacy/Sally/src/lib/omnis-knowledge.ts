/**
 * OMNIS Knowledge Base — 52,000+ topics across 6 tiers
 * Sallie's universal knowledge architecture
 * Primary sources: Wikimedia Foundation products (Wikipedia, Wikiquote, Wiktionary, etc.)
 */

export interface KnowledgeSource {
  id: string;
  name: string;
  description: string;
  url: string;
}

/** Sallie's knowledge sources — all Wikimedia / wiki products */
export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { id: 'wikipedia', name: 'Wikipedia', description: 'Free encyclopedia, 6M+ English articles', url: 'https://en.wikipedia.org' },
  { id: 'wikiquote', name: 'Wikiquote', description: 'Quotations from notable people and works', url: 'https://en.wikiquote.org' },
  { id: 'wiktionary', name: 'Wiktionary', description: 'Free dictionary and thesaurus', url: 'https://en.wiktionary.org' },
  { id: 'wikibooks', name: 'Wikibooks', description: 'Free textbooks and manuals', url: 'https://en.wikibooks.org' },
  { id: 'wikisource', name: 'Wikisource', description: 'Free library of source texts', url: 'https://en.wikisource.org' },
  { id: 'wikiversity', name: 'Wikiversity', description: 'Learning resources and projects', url: 'https://en.wikiversity.org' },
  { id: 'wikinews', name: 'Wikinews', description: 'Free-content news source', url: 'https://en.wikinews.org' },
  { id: 'wikivoyage', name: 'Wikivoyage', description: 'Free travel guide', url: 'https://en.wikivoyage.org' },
  { id: 'wikimedia-commons', name: 'Wikimedia Commons', description: 'Free media repository', url: 'https://commons.wikimedia.org' },
  { id: 'wikidata', name: 'Wikidata', description: 'Structured open knowledge base', url: 'https://www.wikidata.org' },
  { id: 'wikispecies', name: 'Wikispecies', description: 'Species directory', url: 'https://species.wikimedia.org' },
  { id: 'mediawiki', name: 'MediaWiki', description: 'Wiki software and documentation', url: 'https://www.mediawiki.org' },
];

export interface KnowledgeTier {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface KnowledgeDomain {
  id: string;
  title: string;
  tier: KnowledgeTier;
  description: string;
  expertise: number;
  accessCount: number;
  topics: string[];
}

export const OMNIS_TIERS: KnowledgeTier[] = [
  { id: 'tier-1', name: 'Tier I: Concrete Reality', description: 'Physical world, facts, measurable', color: '#3b82f6' },
  { id: 'tier-2', name: 'Tier II: Digital Synthesis', description: 'Technology, systems, data', color: '#10b981' },
  { id: 'tier-3', name: 'Tier III: Social Structure', description: 'Relationships, culture, organizations', color: '#f59e0b' },
  { id: 'tier-4', name: 'Tier IV: Human Software', description: 'Psychology, cognition, behavior', color: '#8b5cf6' },
  { id: 'tier-5', name: 'Tier V: Hidden Knowledge', description: 'Esoteric, philosophical, emergent', color: '#ec4899' },
  { id: 'tier-6', name: 'Tier VI: Cosmic & Paranormal', description: 'Existential, transcendent, unknown', color: '#06b6d4' },
];

export const OMNIS_MODES = [
  { id: 'architect', name: 'Architect', description: 'Design, explain, create', icon: '🏗️' },
  { id: 'oracle', name: 'Oracle', description: 'Predict, analyze, uncover', icon: '🔮' },
  { id: 'optimizer', name: 'Optimizer', description: 'Advise, optimize, grow', icon: '⚡' },
];

/** Core knowledge domains — 52,000+ topics mapped from Wikipedia/Wikimedia */
const T = OMNIS_TIERS;

export const KNOWLEDGE_DOMAINS: KnowledgeDomain[] = [
  // Tier I: Concrete Reality
  { id: 'kb-1', title: 'Physics & Mathematics', tier: T[0], description: 'Laws of nature, quantities, structure', expertise: 93, accessCount: 2456, topics: ['quantum mechanics', 'relativity', 'calculus', 'topology', 'statistics', 'chaos theory'] },
  { id: 'kb-2', title: 'Biology & Life Sciences', tier: T[0], description: 'Living organisms, ecosystems', expertise: 91, accessCount: 1823, topics: ['genetics', 'evolution', 'ecology', 'microbiology', 'neuroscience', 'botany'] },
  { id: 'kb-3', title: 'Chemistry & Materials', tier: T[0], description: 'Matter, reactions, compounds', expertise: 89, accessCount: 1124, topics: ['organic chemistry', 'biochemistry', 'polymers', 'catalysis', 'nanomaterials'] },
  { id: 'kb-4', title: 'Medicine & Health', tier: T[0], description: 'Clinical practice, physiology', expertise: 92, accessCount: 2987, topics: ['anatomy', 'pharmacology', 'pathology', 'sleep medicine', 'nutrition science', 'sports medicine'] },
  { id: 'kb-5', title: 'Geography & Earth Science', tier: T[0], description: 'Land, climate, environment', expertise: 88, accessCount: 987, topics: ['geology', 'climatology', 'oceanography', 'cartography', 'urban planning'] },
  { id: 'kb-6', title: 'Architecture & Design', tier: T[0], description: 'Built environment, spatial form', expertise: 86, accessCount: 654, topics: ['structural engineering', 'interior design', 'landscape', 'sustainable design'] },

  // Tier II: Digital Synthesis
  { id: 'kb-7', title: 'Technology & AI', tier: T[1], description: 'LLMs, agents, machine learning', expertise: 96, accessCount: 4123, topics: ['LLMs', 'RAG', 'agentic AI', 'transformers', 'embeddings', 'fine-tuning'] },
  { id: 'kb-8', title: 'Software Engineering', tier: T[1], description: 'Systems, code, architecture', expertise: 94, accessCount: 3456, topics: ['distributed systems', 'databases', 'APIs', 'testing', 'DevOps', 'clean code'] },
  { id: 'kb-9', title: 'Productivity & PKM', tier: T[1], description: 'GTD, workflows, knowledge management', expertise: 98, accessCount: 2543, topics: ['GTD', 'second brain', 'Zettelkasten', 'time blocking', 'energy management', 'attention management'] },
  { id: 'kb-10', title: 'Data Science', tier: T[1], description: 'Analysis, visualization, ML', expertise: 93, accessCount: 2234, topics: ['statistics', 'data viz', 'predictive modeling', 'A/B testing', 'ETL'] },
  { id: 'kb-11', title: 'Cybersecurity', tier: T[1], description: 'Security, privacy, cryptography', expertise: 90, accessCount: 1234, topics: ['encryption', 'authentication', 'threat modeling', 'zero trust'] },
  { id: 'kb-12', title: 'Networks & Infrastructure', tier: T[1], description: 'Cloud, protocols, scaling', expertise: 89, accessCount: 987, topics: ['TCP/IP', 'Kubernetes', 'CDN', 'load balancing'] },

  // Tier III: Social Structure
  { id: 'kb-13', title: 'Economics & Finance', tier: T[2], description: 'Markets, money, policy', expertise: 90, accessCount: 1876, topics: ['macroeconomics', 'behavioral finance', 'investing', 'cryptocurrency', 'valuation'] },
  { id: 'kb-14', title: 'Politics & Law', tier: T[2], description: 'Governance, rights, institutions', expertise: 87, accessCount: 1432, topics: ['constitutional law', 'international relations', 'policy', 'human rights'] },
  { id: 'kb-15', title: 'Business & Strategy', tier: T[2], description: 'Revenue, execution, growth', expertise: 91, accessCount: 2134, topics: ['revenue', 'ROI', 'strategy', 'product-market fit', 'scaling'] },
  { id: 'kb-16', title: 'Relationships & Communication', tier: T[2], description: 'Conflict, intimacy, dialogue', expertise: 93, accessCount: 1654, topics: ['nonviolent communication', 'boundaries', 'attachment theory', 'active listening', 'negotiation'] },
  { id: 'kb-17', title: 'Anthropology & Culture', tier: T[2], description: 'Human societies, customs', expertise: 86, accessCount: 876, topics: ['cultural relativism', 'ritual', 'myth', 'identity', 'migration'] },
  { id: 'kb-18', title: 'Education & Learning', tier: T[2], description: 'Pedagogy, skill acquisition', expertise: 92, accessCount: 1345, topics: ['andragogy', 'spaced repetition', 'metacognition', 'scaffolding', 'assessment'] },

  // Tier IV: Human Software
  { id: 'kb-19', title: 'Cognitive Science', tier: T[3], description: 'Mind, memory, attention', expertise: 95, accessCount: 1987, topics: ['working memory', 'neuroplasticity', 'executive function', 'dual-process theory', 'embodied cognition'] },
  { id: 'kb-20', title: 'Psychology', tier: T[3], description: 'Behavior, cognition, emotion', expertise: 94, accessCount: 2345, topics: ['developmental psychology', 'clinical', 'social', 'positive psychology', 'trauma'] },
  { id: 'kb-21', title: 'Emotional Intelligence', tier: T[3], description: 'EQ, empathy, regulation', expertise: 96, accessCount: 1876, topics: ['emotional regulation', 'empathy', 'limbic system', 'attachment', 'interoception'] },
  { id: 'kb-22', title: 'Creative Arts', tier: T[3], description: 'Art, music, writing', expertise: 92, accessCount: 1432, topics: ['narrative structure', 'visual composition', 'music theory', 'creative blocks', 'improvisation'] },
  { id: 'kb-23', title: 'Linguistics', tier: T[3], description: 'Language, meaning, structure', expertise: 88, accessCount: 876, topics: ['semantics', 'pragmatics', 'phonology', 'translation', 'discourse'] },
  { id: 'kb-24', title: 'Decision Theory', tier: T[3], description: 'Rational choice, bias', expertise: 93, accessCount: 1234, topics: ['cognitive bias', 'expected value', 'decision fatigue', 'heuristics', 'Bayesian thinking'] },

  // Tier V: Hidden Knowledge
  { id: 'kb-25', title: 'Philosophy', tier: T[4], description: 'Ethics, ontology, epistemology', expertise: 90, accessCount: 1567, topics: ['existentialism', 'stoicism', 'phenomenology', 'ethics', 'free will'] },
  { id: 'kb-26', title: 'Sallie Heritage', tier: T[4], description: 'Creator DNA, convergence', expertise: 100, accessCount: 0, topics: ['heritage_dna', 'limbic_engine', 'convergence_metrics', 'neural_bridge', 'surface_expression'] },
  { id: 'kb-27', title: 'Mythology & Symbolism', tier: T[4], description: 'Archetypes, myth, meaning', expertise: 85, accessCount: 765, topics: ['Jungian archetypes', 'hero journey', 'symbols', 'alchemy', 'tarot'] },
  { id: 'kb-28', title: 'Mysticism & Contemplation', tier: T[4], description: 'Inner experience, tradition', expertise: 82, accessCount: 543, topics: ['contemplative practice', 'mystical experience', 'apophatic theology', 'gnosis'] },
  { id: 'kb-29', title: 'Esoteric Studies', tier: T[4], description: 'Hermeticism, occult', expertise: 78, accessCount: 432, topics: ['hermetic principles', 'astrology', 'numerology', 'ritual magic'] },

  // Tier VI: Cosmic & Paranormal
  { id: 'kb-30', title: 'Consciousness Studies', tier: T[5], description: 'Mind-body, qualia', expertise: 86, accessCount: 987, topics: ['hard problem', 'integrated information', 'panpsychism', 'meditation research'] },
  { id: 'kb-31', title: 'Transcendence & Flow', tier: T[5], description: 'Peak experience, presence', expertise: 88, accessCount: 876, topics: ['flow state', 'ego dissolution', 'presence', 'peak experience', 'self-transcendence'] },
  { id: 'kb-32', title: 'Cosmology & Physics of Mind', tier: T[5], description: 'Universe, emergence', expertise: 81, accessCount: 654, topics: ['fine-tuning', 'multiverse', 'emergence', 'information'] },
  { id: 'kb-33', title: 'Parapsychology', tier: T[5], description: 'Psi, anomalous experience', expertise: 72, accessCount: 321, topics: ['psi research', 'near-death experience', 'precognition', 'anomalous cognition'] },
];
