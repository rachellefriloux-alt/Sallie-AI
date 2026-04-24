'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Unlock,
  CheckCircle,
  Eye,
  Zap,
  Crown,
  Star,
  Clock,
  MessageSquare,
  Calendar,
  DollarSign,
  Palette,
  Settings,
  Search,
} from 'lucide-react';

interface AgencyDashboardProps {
  limbicState: { trust: number; warmth: number; posture: string; energy?: number };
  className?: string;
}

interface TrustTier {
  id: number;
  name: string;
  label: string;
  min: number;
  max: number;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  description: string;
}

interface PermissionCategory {
  name: string;
  icon: React.ReactNode;
  capabilities: { name: string; minTier: number }[];
}

interface InitiativeLogEntry {
  id: string;
  action: string;
  category: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'failed';
}

interface PendingApproval {
  id: string;
  action: string;
  category: string;
  requestedAt: string;
  risk: 'low' | 'medium' | 'high';
}

interface AgencyStatusData {
  trustTier: string;
  trustLevel: number;
  capabilities: string[];
  recentActions: { id: string; action: string; metadata: Record<string, unknown>; createdAt: string }[];
  autonomyLevel: string;
  status: string;
}

const TRUST_TIERS: TrustTier[] = [
  {
    id: 1,
    name: 'Observer',
    label: 'Tier 1 — Observer',
    min: 0,
    max: 0.25,
    icon: <Eye className="h-5 w-5" />,
    color: 'from-slate-500 to-slate-600',
    glowColor: 'rgba(100,116,139,0.4)',
    description: 'Read-only access. Can ask questions and receive answers.',
  },
  {
    id: 2,
    name: 'Assistant',
    label: 'Tier 2 — Assistant',
    min: 0.25,
    max: 0.5,
    icon: <Star className="h-5 w-5" />,
    color: 'from-blue-500 to-blue-600',
    glowColor: 'rgba(59,130,246,0.4)',
    description: 'Can create drafts, suggest actions, manage simple tasks.',
  },
  {
    id: 3,
    name: 'Partner',
    label: 'Tier 3 — Partner',
    min: 0.5,
    max: 0.75,
    icon: <Zap className="h-5 w-5" />,
    color: 'from-purple-500 to-purple-600',
    glowColor: 'rgba(168,85,247,0.4)',
    description: 'Execute approved actions, manage calendar, financial summaries.',
  },
  {
    id: 4,
    name: 'Full Partner',
    label: 'Tier 4 — Full Partner',
    min: 0.75,
    max: 1.0,
    icon: <Crown className="h-5 w-5" />,
    color: 'from-amber-500 to-amber-600',
    glowColor: 'rgba(245,158,11,0.4)',
    description: 'Full autonomous operation. Advisory mode only.',
  },
];

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    name: 'Communication',
    icon: <MessageSquare className="h-4 w-4" />,
    capabilities: [
      { name: 'Read messages', minTier: 1 },
      { name: 'Draft responses', minTier: 2 },
      { name: 'Send pre-approved messages', minTier: 3 },
      { name: 'Autonomous messaging', minTier: 4 },
    ],
  },
  {
    name: 'Calendar',
    icon: <Calendar className="h-4 w-4" />,
    capabilities: [
      { name: 'View calendar', minTier: 1 },
      { name: 'Suggest events', minTier: 2 },
      { name: 'Manage calendar', minTier: 3 },
      { name: 'Auto-schedule & reschedule', minTier: 4 },
    ],
  },
  {
    name: 'Financial',
    icon: <DollarSign className="h-4 w-4" />,
    capabilities: [
      { name: 'View balances', minTier: 1 },
      { name: 'Categorize transactions', minTier: 2 },
      { name: 'Access financial summaries', minTier: 3 },
      { name: 'Execute financial decisions', minTier: 4 },
    ],
  },
  {
    name: 'Creative',
    icon: <Palette className="h-4 w-4" />,
    capabilities: [
      { name: 'Browse creative assets', minTier: 1 },
      { name: 'Generate drafts & ideas', minTier: 2 },
      { name: 'Publish approved content', minTier: 3 },
      { name: 'Full creative autonomy', minTier: 4 },
    ],
  },
  {
    name: 'System',
    icon: <Settings className="h-4 w-4" />,
    capabilities: [
      { name: 'View system status', minTier: 1 },
      { name: 'Run diagnostics', minTier: 2 },
      { name: 'Apply approved changes', minTier: 3 },
      { name: 'Full system administration', minTier: 4 },
    ],
  },
  {
    name: 'Research',
    icon: <Search className="h-4 w-4" />,
    capabilities: [
      { name: 'Answer questions', minTier: 1 },
      { name: 'Deep research & compile reports', minTier: 2 },
      { name: 'Act on research findings', minTier: 3 },
      { name: 'Proactive research initiatives', minTier: 4 },
    ],
  },
];

function getCurrentTier(trust: number): TrustTier {
  if (trust >= 0.75) return TRUST_TIERS[3];
  if (trust >= 0.5) return TRUST_TIERS[2];
  if (trust >= 0.25) return TRUST_TIERS[1];
  return TRUST_TIERS[0];
}

function getProgressToNextTier(trust: number): number {
  const tier = getCurrentTier(trust);
  if (tier.id === 4) return 1;
  const range = tier.max - tier.min;
  return Math.min(1, Math.max(0, (trust - tier.min) / range));
}

function generateTrustHistory(currentTrust: number): number[] {
  const points: number[] = [];
  let val = Math.max(0.05, currentTrust - 0.3);
  for (let i = 0; i < 20; i++) {
    val += (Math.random() - 0.35) * 0.04;
    val = Math.max(0, Math.min(1, val));
    points.push(val);
  }
  points.push(currentTrust);
  return points;
}

function TrustSparkline({ data, className }: { data: number[]; className?: string }) {
  const width = 200;
  const height = 40;
  const padding = 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - v * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ');
  const areaD = `${pathD} L${width - padding},${height - padding} L${padding},${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(168,85,247)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(168,85,247)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#sparklineGrad)" />
      <path d={pathD} fill="none" stroke="rgb(168,85,247)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="3" fill="rgb(168,85,247)" />
    </svg>
  );
}

const MOCK_INITIATIVE_LOG: InitiativeLogEntry[] = [
  { id: '1', action: 'Organized inbox — archived 12 low-priority threads', category: 'Communication', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'completed' },
  { id: '2', action: 'Generated weekly financial summary report', category: 'Financial', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'completed' },
  { id: '3', action: 'Rescheduled conflicting calendar events', category: 'Calendar', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'completed' },
  { id: '4', action: 'Running background research on market trends', category: 'Research', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'in_progress' },
  { id: '5', action: 'Attempted system backup — storage quota exceeded', category: 'System', timestamp: new Date(Date.now() - 5400000).toISOString(), status: 'failed' },
];

const MOCK_PENDING_APPROVALS: PendingApproval[] = [
  { id: 'p1', action: 'Send follow-up email to client about project deadline', category: 'Communication', requestedAt: new Date(Date.now() - 300000).toISOString(), risk: 'low' },
  { id: 'p2', action: 'Transfer $250 to savings account', category: 'Financial', requestedAt: new Date(Date.now() - 900000).toISOString(), risk: 'medium' },
  { id: 'p3', action: 'Deploy updated configuration to production', category: 'System', requestedAt: new Date(Date.now() - 1200000).toISOString(), risk: 'high' },
];

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({ limbicState, className }) => {
  const [apiData, setApiData] = useState<AgencyStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initiativeLog] = useState<InitiativeLogEntry[]>(MOCK_INITIATIVE_LOG);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(MOCK_PENDING_APPROVALS);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const trust = limbicState.trust;
  const currentTier = useMemo(() => getCurrentTier(trust), [trust]);
  const progress = useMemo(() => getProgressToNextTier(trust), [trust]);
  const trustHistory = useMemo(() => generateTrustHistory(trust), [trust]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/agency/status');
        if (res.ok) {
          const data = await res.json();
          setApiData(data);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = useCallback((id: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleDeny = useCallback((id: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
  }, []);

  const riskColors: Record<string, string> = {
    low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const statusColors: Record<string, string> = {
    completed: 'text-emerald-400',
    in_progress: 'text-blue-400',
    failed: 'text-red-400',
  };

  const statusLabels: Record<string, string> = {
    completed: 'Completed',
    in_progress: 'In Progress',
    failed: 'Failed',
  };

  return (
    <div className={`space-y-5 ${className ?? ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Agency Dashboard</h2>
              <p className="text-sm text-gray-400">Trust-gated autonomy system</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`h-2 w-2 rounded-full ${limbicState.posture === 'open' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span className="text-gray-400 capitalize">{limbicState.posture}</span>
          </div>
        </div>

        {/* Trust Tier Visual Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{currentTier.icon}</span>
              <span className="text-white font-semibold">{currentTier.label}</span>
            </div>
            <span className="text-sm font-mono text-purple-300">{(trust * 100).toFixed(1)}%</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">{currentTier.description}</p>

          {/* Tier Progress Bar */}
          <div className="relative">
            <div className="flex gap-1 mb-2">
              {TRUST_TIERS.map((tier) => {
                const isActive = tier.id === currentTier.id;
                const isPast = tier.id < currentTier.id;
                return (
                  <div key={tier.id} className="flex-1 relative">
                    <div className={`h-2 rounded-full ${isPast ? 'bg-purple-500' : isActive ? 'bg-gray-700' : 'bg-gray-800'} overflow-hidden`}>
                      {isActive && (
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${tier.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          style={{ boxShadow: `0 0 12px ${tier.glowColor}` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              {TRUST_TIERS.map((tier) => (
                <span key={tier.id} className={tier.id === currentTier.id ? 'text-purple-400 font-medium' : ''}>
                  {tier.name}
                </span>
              ))}
            </div>
          </div>

          {currentTier.id < 4 && (
            <p className="text-xs text-gray-500 mt-2">
              {((TRUST_TIERS[currentTier.id].min - trust) * 100).toFixed(1)}% more trust needed for {TRUST_TIERS[currentTier.id].name}
            </p>
          )}
        </div>

        {/* Trust History Sparkline */}
        <div className="mb-6 p-4 rounded-xl bg-gray-800/60 border border-gray-700/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Trust History</span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Warmth: <span className="text-amber-400">{(limbicState.warmth * 100).toFixed(0)}%</span></span>
              {limbicState.energy !== undefined && (
                <span>Energy: <span className="text-blue-400">{(limbicState.energy * 100).toFixed(0)}%</span></span>
              )}
            </div>
          </div>
          <TrustSparkline data={trustHistory} className="w-full h-10" />
        </div>
      </motion.div>

      {/* Permission Categories */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-400" />
          Permissions & Capabilities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PERMISSION_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.name;
            return (
              <motion.div
                key={cat.name}
                layout
                className="rounded-xl bg-gray-800/60 border border-gray-700/40 overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors"
                onClick={() => setExpandedCategory(isExpanded ? null : cat.name)}
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                    <span className="text-purple-400">{cat.icon}</span>
                    {cat.name}
                  </div>
                  <span className="text-xs text-gray-500">
                    {cat.capabilities.filter(c => currentTier.id >= c.minTier).length}/{cat.capabilities.length}
                  </span>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-700/40"
                    >
                      <div className="p-3 space-y-2">
                        {cat.capabilities.map((cap) => {
                          const unlocked = currentTier.id >= cap.minTier;
                          return (
                            <div key={cap.name} className="flex items-center gap-2 text-sm">
                              {unlocked ? (
                                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className={unlocked ? 'text-gray-200' : 'text-gray-500'}>
                                {cap.name}
                              </span>
                              {!unlocked && (
                                <span className="ml-auto text-xs text-gray-400">Tier {cap.minTier}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Sallie's Initiative Log */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          Sallie's Initiative Log
        </h3>
        <div className="space-y-3">
          {initiativeLog.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30"
            >
              <div className={`mt-0.5 ${statusColors[entry.status]}`}>
                {entry.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                {entry.status === 'in_progress' && <Clock className="h-4 w-4 animate-spin" />}
                {entry.status === 'failed' && <Shield className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-snug">{entry.action}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{entry.category}</span>
                  <span>·</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`ml-auto ${statusColors[entry.status]}`}>{statusLabels[entry.status]}</span>
                </div>
              </div>
            </motion.div>
          ))}
          {apiData?.recentActions && apiData.recentActions.length > 0 && (
            <>
              <div className="border-t border-gray-700/30 pt-3 mt-3">
                <p className="text-xs text-gray-500 mb-2">From API</p>
                {apiData.recentActions.slice(0, 5).map((action) => (
                  <div key={action.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-800/20">
                    <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">{action.action}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(action.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Action Request Queue */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-700/50 p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Unlock className="h-5 w-5 text-blue-400" />
            Action Request Queue
          </h3>
          {pendingApprovals.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {pendingApprovals.length} pending
            </span>
          )}
        </div>
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-snug mb-2">{item.action}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">{item.category}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${riskColors[item.risk]}`}>
                        {item.risk} risk
                      </span>
                      <span className="text-gray-400">
                        {new Date(item.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeny(item.id); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default AgencyDashboard;
