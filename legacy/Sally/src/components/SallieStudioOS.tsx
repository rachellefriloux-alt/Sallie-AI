'use client';

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Crown, Users, Heart, MessageCircle, Brain, Cpu, Sparkles,
  Settings, Command, ChevronLeft, ChevronRight, Menu, X, Search,
  Zap, Activity, Shield, Moon, Eye, BookOpen, Feather, Compass,
  Target, TrendingUp, Anchor, Waves, GraduationCap, Download,
  User, Palette, Clock, Layers, Coffee, BookMarked, Puzzle,
  ArrowLeft, Lightbulb
} from 'lucide-react';
import { useSallieMode, MODE_CONFIGS } from '@/store/useSallieMode';
import type { SallieMode } from '@/store/useSallieMode';
import { useLimbicStore } from '@/store/useLimbicStore';
import { SalliePanel, SallieButton, GLASS_BASE } from '@/components/sallie-ui';

import { DashboardView } from '@/components/views/DashboardView';
import { EmpireView } from '@/components/views/EmpireView';
import { MatriarchView } from '@/components/views/MatriarchView';
import { PartnerView } from '@/components/views/PartnerView';
import { ConfidanteView } from '@/components/views/ConfidanteView';
import { SourceView } from '@/components/views/SourceView';
import { WorkspaceView } from '@/components/views/WorkspaceView';
import { SanctuaryView } from '@/components/views/SanctuaryView';

const CommandPalette = lazy(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const ShoulderTapOverlay = lazy(() => import('@/components/ShoulderTapOverlay').then(m => ({ default: m.ShoulderTapOverlay })));

const ConsciousnessViewer = lazy(() => import('@/components/ConsciousnessViewer').then(m => ({ default: m.ConsciousnessViewer })));
const DualityEngine = lazy(() => import('@/components/DualityEngine').then(m => ({ default: m.DualityEngine })));
const Sallieverse = lazy(() => import('@/components/Sallieverse').then(m => ({ default: m.Sallieverse })));
const LifeOS = lazy(() => import('@/components/LifeOS').then(m => ({ default: m.LifeOS })));
const ThoughtJournal = lazy(() => import('@/components/ThoughtJournal').then(m => ({ default: m.ThoughtJournal })));
const ThoughtActionLog = lazy(() => import('@/components/transparency/ThoughtActionLog').then(m => ({ default: m.ThoughtActionLog })));
const LimbicDashboard = lazy(() => import('@/components/LimbicGauges').then(m => ({ default: m.LimbicDashboard })));

const TimeEnergyDimension = lazy(() => import('@/components/dimensions/TimeEnergyDimension').then(m => ({ default: m.TimeEnergyDimension })));
const CreativeAtelierDimension = lazy(() => import('@/components/dimensions/CreativeAtelierDimension').then(m => ({ default: m.CreativeAtelierDimension })));
const ResearchUniverseDimension = lazy(() => import('@/components/dimensions/ResearchUniverseDimension').then(m => ({ default: m.ResearchUniverseDimension })));
const GrowthGardenDimension = lazy(() => import('@/components/dimensions/GrowthGardenDimension').then(m => ({ default: m.GrowthGardenDimension })));
const HealingSanctuaryDimension = lazy(() => import('@/components/dimensions/HealingSanctuaryDimension').then(m => ({ default: m.HealingSanctuaryDimension })));
const LegacyImpactDimension = lazy(() => import('@/components/dimensions/LegacyImpactDimension').then(m => ({ default: m.LegacyImpactDimension })));
const TranscendenceDimension = lazy(() => import('@/components/dimensions/TranscendenceDimension').then(m => ({ default: m.TranscendenceDimension })));
const QuantumCoreDimension = lazy(() => import('@/components/dimensions/QuantumCoreDimension').then(m => ({ default: m.QuantumCoreDimension })));
const QuantumMessengerDimension = lazy(() => import('@/components/dimensions/QuantumMessengerDimension').then(m => ({ default: m.QuantumMessengerDimension })));
const SocialMasteryDimension = lazy(() => import('@/components/dimensions/SocialMasteryDimension').then(m => ({ default: m.SocialMasteryDimension })));
const LifeSanctuaryDimension = lazy(() => import('@/components/dimensions/LifeSanctuaryDimension').then(m => ({ default: m.LifeSanctuaryDimension })));
const CommandMatrixDimension = lazy(() => import('@/components/dimensions/CommandMatrixDimension').then(m => ({ default: m.CommandMatrixDimension })));

const PrismCore = lazy(() => import('@/components/prism/PrismCore').then(m => ({ default: m.PrismCore })));
const SettingsPanel = lazy(() => import('@/components/SettingsPanel').then(m => ({ default: m.SettingsPanel })));

const SECTION_PARENT: Record<string, SallieMode> = {
  'limbic': 'source',
  'heritage': 'source',
  'convergence-30': 'source',
  'identity': 'source',
  'core-identity': 'source',
  'thought-journal': 'source',
  'dim-healing': 'source',
  'growth': 'source',
  'dim-growth': 'source',
  'learning': 'source',
  'alignment': 'source',
  'dim-transcend': 'source',
  'profile': 'source',
  'data-export': 'source',

  'projects': 'empire',
  'dim-command': 'empire',
  'dim-legacy': 'empire',
  'dim-creative': 'empire',
  'dim-research': 'empire',

  'dim-kids': 'matriarch',
  'dim-kitchen': 'matriarch',
  'dim-home': 'matriarch',
  'dim-school': 'matriarch',

  'dim-dates': 'partner',
  'dim-ustime': 'partner',
  'dim-goals': 'partner',
  'dim-notes': 'partner',

  'dim-people': 'confidante',
  'dim-family': 'confidante',
  'dim-events': 'confidante',
  'dim-social': 'confidante',

  'abilities': 'workspace',
  'features': 'workspace',
  'settings': 'settings',

  'sallieverse': 'sanctuary',
  'duality': 'sanctuary',
  'prism': 'sanctuary',
  'human-level': 'sanctuary',
  'dim-quantum': 'sanctuary',
  'dream-state': 'sanctuary',
  'dream-cycle': 'sanctuary',
  'agency': 'sanctuary',
  'consciousness': 'sanctuary',
  'memory': 'sanctuary',
  'thought-log': 'sanctuary',
  'action-log': 'sanctuary',
  'dim-messenger': 'sanctuary',

  'lifeos': 'dashboard',
  'life-mgmt': 'dashboard',
  'dim-time': 'dashboard',
  'dim-life': 'dashboard',
};

const TAB_ITEMS: { id: SallieMode; icon: React.ComponentType<any>; label: string; shortLabel: string }[] = [
  { id: 'dashboard', icon: Home, label: 'Home', shortLabel: 'Home' },
  { id: 'empire', icon: Crown, label: 'Empire', shortLabel: 'Empire' },
  { id: 'matriarch', icon: Heart, label: 'Matriarch', shortLabel: 'Family' },
  { id: 'partner', icon: MessageCircle, label: 'Partner', shortLabel: 'Love' },
  { id: 'confidante', icon: Users, label: 'Confidante', shortLabel: 'Circle' },
  { id: 'source', icon: Brain, label: 'Source', shortLabel: 'Self' },
  { id: 'workspace', icon: Cpu, label: 'Workspace', shortLabel: 'Work' },
  { id: 'sanctuary', icon: Sparkles, label: 'Sanctuary', shortLabel: 'Sallie' },
];

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        className="w-8 h-8 rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'rgba(200,168,78,0.3)', borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function SubSectionBack({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      className="flex items-center gap-2 mb-4 text-white/40 hover:text-white/70 transition-colors group"
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span className="text-xs font-black uppercase tracking-[0.15em]">Back to {label}</span>
    </motion.button>
  );
}

export function SallieStudioOS() {
  const { mode, config, setMode, degradationState, loadHeritageDNA } = useSallieMode();
  const limbicState = useLimbicStore((s) => s.state);
  const syncFromApi = useLimbicStore((s) => s.syncFromApi);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadHeritageDNA();
    syncFromApi();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleNavigate = useCallback((section: string) => {
    const parent = SECTION_PARENT[section];
    if (parent && parent !== mode) {
      setMode(parent);
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
  }, [mode, setMode]);

  const handleTabClick = useCallback((tabId: SallieMode) => {
    setMode(tabId);
    setActiveSection(null);
    setMobileMenuOpen(false);
  }, [setMode]);

  const handleBack = useCallback(() => {
    setActiveSection(null);
  }, []);

  const renderSubSection = useCallback(() => {
    if (!activeSection) return null;
    const parentMode = SECTION_PARENT[activeSection];
    const parentLabel = parentMode ? MODE_CONFIGS[parentMode].label : 'Home';

    const back = <SubSectionBack label={parentLabel} onClick={handleBack} />;

    const dimProps = { userState: limbicState, sallieState: { degradationState, mode } };

    const sectionMap: Record<string, React.ReactNode> = {
      'lifeos': <>{back}<Suspense fallback={<SectionLoader />}><LifeOS /></Suspense></>,
      'dim-time': <>{back}<Suspense fallback={<SectionLoader />}><TimeEnergyDimension {...dimProps} /></Suspense></>,
      'dim-life': <>{back}<Suspense fallback={<SectionLoader />}><LifeSanctuaryDimension {...dimProps} /></Suspense></>,
      'life-mgmt': <>{back}<Suspense fallback={<SectionLoader />}><LifeOS /></Suspense></>,
      'limbic': <>{back}<Suspense fallback={<SectionLoader />}><LimbicDashboard limbicState={limbicState} /></Suspense></>,
      'heritage': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Heritage DNA — Complete the Convergence first</div></Suspense></>,
      'convergence-30': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Convergence — 30 Great Questions</div></Suspense></>,
      'identity': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Identity Explorer</div></Suspense></>,
      'core-identity': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Core Identity Protection</div></Suspense></>,
      'thought-journal': <>{back}<Suspense fallback={<SectionLoader />}><ThoughtJournal /></Suspense></>,
      'dim-healing': <>{back}<Suspense fallback={<SectionLoader />}><HealingSanctuaryDimension {...dimProps} /></Suspense></>,
      'growth': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Personal Growth Tracker</div></Suspense></>,
      'dim-growth': <>{back}<Suspense fallback={<SectionLoader />}><GrowthGardenDimension {...dimProps} /></Suspense></>,
      'learning': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Learning Hub</div></Suspense></>,
      'alignment': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Alignment Check</div></Suspense></>,
      'dim-transcend': <>{back}<Suspense fallback={<SectionLoader />}><TranscendenceDimension {...dimProps} /></Suspense></>,
      'profile': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Profile</div></Suspense></>,
      'data-export': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Data Export — Your copy, your data</div></Suspense></>,
      'projects': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Projects Browser</div></Suspense></>,
      'dim-command': <>{back}<Suspense fallback={<SectionLoader />}><CommandMatrixDimension {...dimProps} /></Suspense></>,
      'dim-legacy': <>{back}<Suspense fallback={<SectionLoader />}><LegacyImpactDimension {...dimProps} /></Suspense></>,
      'dim-creative': <>{back}<Suspense fallback={<SectionLoader />}><CreativeAtelierDimension {...dimProps} /></Suspense></>,
      'dim-research': <>{back}<Suspense fallback={<SectionLoader />}><ResearchUniverseDimension {...dimProps} /></Suspense></>,
      'sallieverse': <>{back}<Suspense fallback={<SectionLoader />}><Sallieverse /></Suspense></>,
      'duality': <>{back}<Suspense fallback={<SectionLoader />}><DualityEngine /></Suspense></>,
      'prism': <>{back}<Suspense fallback={<SectionLoader />}><PrismCore /></Suspense></>,
      'human-level': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Evolution Tracker</div></Suspense></>,
      'dim-quantum': <>{back}<Suspense fallback={<SectionLoader />}><QuantumCoreDimension {...dimProps} /></Suspense></>,
      'dream-state': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Dream State</div></Suspense></>,
      'dream-cycle': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Dream Cycle</div></Suspense></>,
      'agency': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Agency Dashboard</div></Suspense></>,
      'consciousness': <>{back}<Suspense fallback={<SectionLoader />}><ConsciousnessViewer /></Suspense></>,
      'memory': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Memory Garden</div></Suspense></>,
      'thought-log': <>{back}<Suspense fallback={<SectionLoader />}><ThoughtActionLog className="" /></Suspense></>,
      'action-log': <>{back}<Suspense fallback={<SectionLoader />}><ThoughtActionLog className="" /></Suspense></>,
      'dim-messenger': <>{back}<Suspense fallback={<SectionLoader />}><QuantumMessengerDimension {...dimProps} /></Suspense></>,
      'abilities': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Abilities Hub</div></Suspense></>,
      'features': <>{back}<Suspense fallback={<SectionLoader />}><div className="text-white/40 text-center py-12">Feature Dashboard</div></Suspense></>,
      'settings': <>{back}<Suspense fallback={<SectionLoader />}><SettingsPanel /></Suspense></>,
      'dim-social': <>{back}<Suspense fallback={<SectionLoader />}><SocialMasteryDimension {...dimProps} /></Suspense></>,
    };

    return sectionMap[activeSection] || (
      <>{back}<div className="text-white/40 text-center py-12">Section: {activeSection}</div></>
    );
  }, [activeSection, handleBack, limbicState]);

  const renderMainView = useCallback(() => {
    if (activeSection) return renderSubSection();

    const viewProps = { limbicState, onNavigate: handleNavigate };

    switch (mode) {
      case 'dashboard': return <DashboardView {...viewProps} />;
      case 'empire': return <EmpireView {...viewProps} />;
      case 'matriarch': return <MatriarchView {...viewProps} />;
      case 'partner': return <PartnerView {...viewProps} />;
      case 'confidante': return <ConfidanteView {...viewProps} />;
      case 'source': return <SourceView {...viewProps} />;
      case 'workspace': return <WorkspaceView {...viewProps} />;
      case 'sanctuary': return <SanctuaryView {...viewProps} />;
      case 'settings': return <Suspense fallback={<SectionLoader />}><SettingsPanel /></Suspense>;
      default: return <DashboardView {...viewProps} />;
    }
  }, [mode, activeSection, limbicState, handleNavigate, renderSubSection]);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0c12' }}>
      <div className="fixed inset-0 -z-10 pointer-events-none transition-all duration-1000" style={{ background: config.bgGlow }} />

      <div className="fixed top-0 left-0 right-0 z-50">
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            ...GLASS_BASE,
            background: 'rgba(10,12,18,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2"
              initial={false}
              animate={{ opacity: 1 }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${config.accent}20, ${config.accent}08)` }}>
                <Sparkles className="w-4 h-4" style={{ color: config.accent }} />
              </div>
              <span className="text-sm font-black tracking-tight text-white/80 hidden sm:inline">SALLIE</span>
            </motion.div>

            <div className="hidden md:flex items-center gap-0.5">
              {TAB_ITEMS.map((tab) => {
                const Icon = tab.icon;
                const isActive = mode === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className="relative px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5"
                    style={{
                      color: isActive ? config.accent : 'rgba(255,255,255,0.3)',
                      background: isActive ? `${config.accent}10` : 'transparent',
                    }}
                    whileHover={{ background: isActive ? `${config.accent}12` : 'rgba(255,255,255,0.04)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{tab.shortLabel}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{ backgroundColor: config.accent }}
                        layoutId="tab-indicator"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              className="p-1.5 rounded-lg text-white/25 hover:text-white/50 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              onClick={() => setCommandPaletteOpen(true)}
              whileTap={{ scale: 0.95 }}
            >
              <Command className="w-3.5 h-3.5" />
            </motion.button>

            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{ background: `${config.accent}06`, border: `1px solid ${config.accent}10` }}>
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.accent }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <span className="text-[10px] font-medium" style={{ color: `${config.accent}cc` }}>{config.label}</span>
            </div>

            <button
              className="md:hidden p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden"
              style={{
                ...GLASS_BASE,
                background: 'rgba(10,12,18,0.95)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="p-3 grid grid-cols-4 gap-2">
                {TAB_ITEMS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = mode === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                      style={{
                        background: isActive ? `${config.accent}10` : 'transparent',
                        border: isActive ? `1px solid ${config.accent}20` : '1px solid transparent',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isActive ? config.accent : 'rgba(255,255,255,0.3)' }} />
                      <span className="text-[9px] font-bold" style={{ color: isActive ? config.accent : 'rgba(255,255,255,0.3)' }}>{tab.shortLabel}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="pt-14 pb-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${activeSection}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderMainView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Suspense fallback={null}>
        {commandPaletteOpen && (
          <CommandPalette onNavigate={(section: string) => { handleNavigate(section); setCommandPaletteOpen(false); }} />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <ShoulderTapOverlay />
      </Suspense>
    </div>
  );
}

export { SallieStudioOS as SallieStudio };
