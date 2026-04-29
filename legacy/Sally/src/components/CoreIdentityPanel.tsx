'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Unlock, CheckCircle, AlertTriangle,
  Plus, X, Send, RefreshCw, Hash, Eye,
  Fingerprint, Activity, ChevronDown, ChevronRight,
} from 'lucide-react';

interface CoreValue {
  id: string;
  name: string;
  description: string;
  weight: number;
  immutable: boolean;
  createdAt: string;
}

interface UpgradeProposal {
  id: string;
  type: 'add' | 'modify' | 'remove';
  targetValueId?: string;
  proposedValue?: Partial<CoreValue>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'vetoed';
  createdAt: string;
  resolvedAt?: string;
}

interface ProtectionStatus {
  level: 'standard' | 'elevated' | 'maximum';
  immutableCount: number;
  totalCount: number;
  integrityScore: number;
}

interface IdentityState {
  values: CoreValue[];
  currentHash: string;
  hashHistory: { hash: string; timestamp: string }[];
  proposals: UpgradeProposal[];
  protectionLevel: string;
  lastVerified: string;
}

const PROTECTION_COLORS = {
  standard: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  elevated: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  maximum: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
};

export function CoreIdentityPanel() {
  const [identity, setIdentity] = useState<IdentityState | null>(null);
  const [integrity, setIntegrity] = useState(true);
  const [protection, setProtection] = useState<ProtectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [expandedValue, setExpandedValue] = useState<string | null>(null);
  const [showHashHistory, setShowHashHistory] = useState(false);

  const [proposalType, setProposalType] = useState<'add' | 'modify' | 'remove'>('add');
  const [proposalTarget, setProposalTarget] = useState('');
  const [proposalReason, setProposalReason] = useState('');
  const [proposalName, setProposalName] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalWeight, setProposalWeight] = useState(0.5);

  const fetchIdentity = useCallback(async () => {
    try {
      const res = await fetch('/api/core/identity');
      const data = await res.json();
      setIdentity(data.identity);
      setIntegrity(data.integrity);
      setProtection(data.protection);
    } catch (e) {
      console.error('Failed to fetch identity:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdentity();
  }, [fetchIdentity]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/core/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });
      const data = await res.json();
      setIntegrity(data.integrity);
    } catch (e) {
      console.error('Verification failed:', e);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!proposalReason.trim()) return;

    try {
      const body: Record<string, unknown> = {
        action: 'propose',
        type: proposalType,
        reason: proposalReason,
      };

      if (proposalType === 'add') {
        body.proposedValue = {
          id: proposalName.toLowerCase().replace(/\s+/g, '-'),
          name: proposalName,
          description: proposalDescription,
          weight: proposalWeight,
        };
      } else {
        body.targetValueId = proposalTarget;
        if (proposalType === 'modify') {
          body.proposedValue = {
            name: proposalName || undefined,
            description: proposalDescription || undefined,
            weight: proposalWeight,
          };
        }
      }

      const res = await fetch('/api/core/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowProposalForm(false);
        setProposalReason('');
        setProposalName('');
        setProposalDescription('');
        setProposalWeight(0.5);
        fetchIdentity();
      }
    } catch (e) {
      console.error('Failed to submit proposal:', e);
    }
  };

  const handleResolveProposal = async (proposalId: string, resolution: 'approved' | 'rejected' | 'vetoed') => {
    try {
      const res = await fetch('/api/core/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', proposalId, resolution }),
      });

      if (res.ok) {
        const data = await res.json();
        setIdentity(data.identity);
        setIntegrity(data.integrity);
        setProtection(data.protection);
      }
    } catch (e) {
      console.error('Failed to resolve proposal:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading Core Identity...</span>
        </div>
      </div>
    );
  }

  if (!identity) return null;

  const protColors = PROTECTION_COLORS[protection?.level || 'standard'];
  const pendingProposals = identity.proposals.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Core Identity Protection</h2>
            <p className="text-sm text-gray-400">Immutable values & identity integrity</p>
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
          Verify Integrity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className={`p-4 rounded-xl border ${protColors.bg} ${protColors.border}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-5 h-5 ${protColors.text}`} />
            <span className="text-sm font-medium text-gray-300">Protection Level</span>
          </div>
          <span className={`text-lg font-bold capitalize ${protColors.text}`}>
            {protection?.level}
          </span>
        </motion.div>

        <motion.div
          className={`p-4 rounded-xl border ${integrity ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            {integrity ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm font-medium text-gray-300">Integrity</span>
          </div>
          <span className={`text-lg font-bold ${integrity ? 'text-emerald-400' : 'text-red-400'}`}>
            {integrity ? 'Verified' : 'Compromised'}
          </span>
        </motion.div>

        <motion.div
          className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Identity Score</span>
          </div>
          <span className="text-lg font-bold text-purple-400">
            {protection?.integrityScore || 0}%
          </span>
        </motion.div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <button
          onClick={() => setShowHashHistory(!showHashHistory)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-gray-300">SHA-256 Identity Hash</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showHashHistory ? 'rotate-180' : ''}`} />
        </button>
        <div className="px-4 pb-4">
          <code className="text-xs text-teal-400/80 font-mono break-all">
            {identity.currentHash}
          </code>
        </div>
        <AnimatePresence>
          {showHashHistory && identity.hashHistory.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 overflow-hidden"
            >
              <div className="p-4 space-y-2">
                <span className="text-xs text-gray-500 font-medium">Hash History</span>
                {identity.hashHistory.slice(-5).reverse().map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-32 flex-shrink-0">
                      {new Date(h.timestamp).toLocaleString()}
                    </span>
                    <code className="text-gray-400 font-mono truncate">{h.hash}</code>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Core Values</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            {protection?.immutableCount} immutable / {protection?.totalCount} total
          </div>
        </div>

        <div className="space-y-2">
          {identity.values.map((value) => (
            <motion.div
              key={value.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={() => setExpandedValue(expandedValue === value.id ? null : value.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {value.immutable ? (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-amber-400" />
                  )}
                  <div className="text-left">
                    <span className="text-sm font-medium text-white">{value.name}</span>
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${value.immutable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {value.immutable ? 'Immutable' : 'Mutable'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                      style={{ width: `${value.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{Math.round(value.weight * 100)}%</span>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${expandedValue === value.id ? 'rotate-90' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {expandedValue === value.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      <p className="text-sm text-gray-400">{value.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Weight: {value.weight}</span>
                        <span>Created: {new Date(value.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Upgrade Proposals</h3>
          <button
            onClick={() => setShowProposalForm(!showProposalForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-xs text-teal-400 hover:bg-teal-500/20 transition-colors"
          >
            {showProposalForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showProposalForm ? 'Cancel' : 'New Proposal'}
          </button>
        </div>

        <AnimatePresence>
          {showProposalForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 space-y-3">
                <div className="flex gap-2">
                  {(['add', 'modify', 'remove'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setProposalType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${proposalType === type ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                {(proposalType === 'modify' || proposalType === 'remove') && (
                  <select
                    value={proposalTarget}
                    onChange={(e) => setProposalTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="">Select target value...</option>
                    {identity.values.filter((v) => !v.immutable).map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                )}

                {(proposalType === 'add' || proposalType === 'modify') && (
                  <>
                    <input
                      type="text"
                      placeholder="Value name"
                      value={proposalName}
                      onChange={(e) => setProposalName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={proposalDescription}
                      onChange={(e) => setProposalDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">Weight:</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={proposalWeight}
                        onChange={(e) => setProposalWeight(parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs text-teal-400 w-8">{Math.round(proposalWeight * 100)}%</span>
                    </div>
                  </>
                )}

                <textarea
                  placeholder="Reason for this change (required)..."
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 resize-none"
                />

                <button
                  onClick={handleSubmitProposal}
                  disabled={!proposalReason.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/20 border border-teal-500/30 text-sm text-teal-400 hover:bg-teal-500/30 transition-colors disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Proposal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pendingProposals.length > 0 ? (
          <div className="space-y-2">
            {pendingProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white capitalize">
                      {proposal.type} {proposal.type !== 'add' && proposal.targetValueId ? `"${identity.values.find((v) => v.id === proposal.targetValueId)?.name || proposal.targetValueId}"` : ''}
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{proposal.reason}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveProposal(proposal.id, 'approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleResolveProposal(proposal.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleResolveProposal(proposal.id, 'vetoed')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/20 transition-colors"
                  >
                    Veto
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-500">
            No pending proposals
          </div>
        )}

        {identity.proposals.filter((p) => p.status !== 'pending').length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-medium">Resolved Proposals</span>
            {identity.proposals
              .filter((p) => p.status !== 'pending')
              .slice(-5)
              .reverse()
              .map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-lg border border-white/5 bg-white/[0.02] p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 capitalize">{proposal.type}</span>
                    <span className="text-xs text-gray-500">{proposal.reason}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    proposal.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                    proposal.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {proposal.status}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
