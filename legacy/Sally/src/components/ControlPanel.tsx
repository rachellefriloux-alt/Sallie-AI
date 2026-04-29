'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pause, Play, RefreshCw, Shield, Sliders,
  Plus, X, AlertTriangle, CheckCircle,
  Zap, Settings,
} from 'lucide-react';

interface ControlOverride {
  actionId: string;
  originalValue: unknown;
  overrideValue: unknown;
  reason: string;
  createdAt: string;
}

interface ControlState {
  paused: boolean;
  overrides: Record<string, ControlOverride>;
  autonomyLevel: number;
  allowedActions: string[];
  pausedAt: string | null;
  resumedAt: string | null;
  lastModified: string;
}

export function ControlPanel() {
  const [state, setState] = useState<ControlState | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideActionId, setOverrideActionId] = useState('');
  const [overrideValue, setOverrideValue] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [pendingAutonomy, setPendingAutonomy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/control/status');
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setPendingAutonomy(null);
      } else if (res.status === 401) {
        setState({
          paused: false,
          overrides: {},
          autonomyLevel: 0.7,
          allowedActions: [],
          pausedAt: null,
          resumedAt: null,
          lastModified: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error('Failed to fetch control state:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const performAction = async (action: string, body: Record<string, unknown> = {}) => {
    setActing(true);
    setError(null);
    try {
      const res = await fetch(`/api/control/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        setPendingAutonomy(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || 'Action failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setActing(false);
    }
  };

  const handleTogglePause = () => {
    if (state?.paused) {
      performAction('resume');
    } else {
      performAction('pause');
    }
  };

  const handleAutonomyChange = (val: number) => {
    setPendingAutonomy(val);
  };

  const handleAutonomyCommit = () => {
    if (pendingAutonomy !== null) {
      performAction('setAutonomy', { level: pendingAutonomy });
    }
  };

  const handleAddOverride = () => {
    if (!overrideActionId.trim() || !overrideValue.trim()) return;
    performAction('override', {
      actionId: overrideActionId,
      overrideValue: overrideValue,
      reason: overrideReason || 'Manual override',
    });
    setOverrideActionId('');
    setOverrideValue('');
    setOverrideReason('');
    setShowOverrideForm(false);
  };

  const handleRemoveOverride = (actionId: string) => {
    performAction('removeOverride', { actionId });
  };

  const handleReset = () => {
    performAction('reset');
  };

  const autonomyDisplay = pendingAutonomy ?? state?.autonomyLevel ?? 0.7;
  const autonomyPercent = Math.round(autonomyDisplay * 100);

  const getAutonomyLabel = (level: number) => {
    if (level < 0.2) return 'Minimal';
    if (level < 0.4) return 'Conservative';
    if (level < 0.6) return 'Balanced';
    if (level < 0.8) return 'Proactive';
    return 'Full Autonomy';
  };

  const getAutonomyColor = (level: number) => {
    if (level < 0.3) return '#ef4444';
    if (level < 0.5) return '#f59e0b';
    if (level < 0.7) return '#10b981';
    return '#3b82f6';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading control panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Settings className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Control Panel</h1>
          </div>
          <p className="text-gray-400 text-sm">Pause, resume, and control Sallie&apos;s autonomous actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={acting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className={`p-6 rounded-xl border ${
            state?.paused
              ? 'bg-amber-500/5 border-amber-500/20'
              : 'bg-emerald-500/5 border-emerald-500/20'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {state?.paused ? (
                <Pause className="w-5 h-5 text-amber-400" />
              ) : (
                <Play className="w-5 h-5 text-emerald-400" />
              )}
              <span className="text-sm font-medium text-gray-300">Autonomous Actions</span>
            </div>
            <span className={`text-lg font-bold ${state?.paused ? 'text-amber-400' : 'text-emerald-400'}`}>
              {state?.paused ? 'PAUSED' : 'ACTIVE'}
            </span>
          </div>
          <button
            onClick={handleTogglePause}
            disabled={acting}
            className={`w-full py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${
              state?.paused
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
            }`}
          >
            {state?.paused ? 'Resume Autonomous Actions' : 'Pause Autonomous Actions'}
          </button>
          {state?.pausedAt && state.paused && (
            <p className="text-xs text-gray-500 mt-2">
              Paused at: {new Date(state.pausedAt).toLocaleString()}
            </p>
          )}
          {state?.resumedAt && !state.paused && (
            <p className="text-xs text-gray-500 mt-2">
              Resumed at: {new Date(state.resumedAt).toLocaleString()}
            </p>
          )}
        </motion.div>

        <motion.div
          className="p-6 rounded-xl bg-white/[0.02] border border-white/5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Autonomy Level</span>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-3xl font-bold" style={{ color: getAutonomyColor(autonomyDisplay) }}>
              {autonomyPercent}%
            </span>
            <span className="text-sm" style={{ color: getAutonomyColor(autonomyDisplay) }}>
              {getAutonomyLabel(autonomyDisplay)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={autonomyDisplay}
            onChange={(e) => handleAutonomyChange(parseFloat(e.target.value))}
            className="w-full mb-3 accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>Manual Only</span>
            <span>Full Autonomy</span>
          </div>
          {pendingAutonomy !== null && pendingAutonomy !== state?.autonomyLevel && (
            <button
              onClick={handleAutonomyCommit}
              disabled={acting}
              className="w-full py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
            >
              Apply Autonomy Level
            </button>
          )}
        </motion.div>
      </div>

      <motion.div
        className="p-6 rounded-xl bg-white/[0.02] border border-white/5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Action Overrides</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {Object.keys(state?.overrides || {}).length}
            </span>
          </div>
          <button
            onClick={() => setShowOverrideForm(!showOverrideForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            {showOverrideForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showOverrideForm ? 'Cancel' : 'Add Override'}
          </button>
        </div>

        <AnimatePresence>
          {showOverrideForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-lg border border-purple-500/20 bg-purple-500/5 space-y-3">
                <input
                  type="text"
                  placeholder="Action ID (e.g., auto-email, scheduled-task)"
                  value={overrideActionId}
                  onChange={(e) => setOverrideActionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <input
                  type="text"
                  placeholder="Override value"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  onClick={handleAddOverride}
                  disabled={!overrideActionId.trim() || !overrideValue.trim() || acting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-sm text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Override
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {Object.keys(state?.overrides || {}).length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">
            No active overrides
          </div>
        ) : (
          <div className="space-y-2">
            {Object.values(state?.overrides || {}).map((override) => (
              <div
                key={override.actionId}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-sm font-medium text-gray-200">{override.actionId}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Override: <span className="text-purple-400">{String(override.overrideValue)}</span>
                    {override.reason && <span className="ml-2">— {override.reason}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created: {new Date(override.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveOverride(override.actionId)}
                  disabled={acting}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Info</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
          <div>
            <span className="block text-gray-400">Status</span>
            <span className={state?.paused ? 'text-amber-400' : 'text-emerald-400'}>
              {state?.paused ? 'Paused' : 'Active'}
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Autonomy</span>
            <span style={{ color: getAutonomyColor(state?.autonomyLevel ?? 0.7) }}>
              {Math.round((state?.autonomyLevel ?? 0.7) * 100)}%
            </span>
          </div>
          <div>
            <span className="block text-gray-400">Overrides</span>
            <span className="text-purple-400">{Object.keys(state?.overrides || {}).length}</span>
          </div>
          <div>
            <span className="block text-gray-400">Last Modified</span>
            <span className="text-gray-300">
              {state?.lastModified ? new Date(state.lastModified).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
