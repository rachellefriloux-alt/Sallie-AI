'use client';

import { useState, useEffect } from 'react';
import {
  Search, Check, X, ExternalLink, Loader2,
  Plug, Unplug, RefreshCw, ChevronRight,
  Shield, Zap, Settings2
} from 'lucide-react';

interface IntegrationField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  envVar?: string;
}

interface IntegrationData {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  platforms: string[];
  status: string;
  configFields: IntegrationField[];
  freeAlternative?: string;
  docsUrl?: string;
  connectedAt?: string;
  hasConfig?: boolean;
}

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  ai: { label: 'AI & Language', color: '#8B5CF6' },
  communication: { label: 'Communication', color: '#EC4899' },
  productivity: { label: 'Productivity', color: '#F59E0B' },
  storage: { label: 'Storage & Data', color: '#10B981' },
  social: { label: 'Social', color: '#3B82F6' },
  'smart-home': { label: 'Smart Home & IoT', color: '#06B6D4' },
  media: { label: 'Media', color: '#1DB954' },
  finance: { label: 'Finance', color: '#635BFF' },
  developer: { label: 'Developer', color: '#6B7280' },
};

interface IntegrationsManagerProps {
  compact?: boolean;
  showOnlyCategory?: string;
  onConnectionChange?: () => void;
}

export function IntegrationsManager({ compact = false, showOnlyCategory, onConnectionChange }: IntegrationsManagerProps) {
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(showOnlyCategory || null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, Record<string, string>>>({});
  const [connecting, setConnecting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      const config = configValues[integrationId] || {};
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect', integrationId, config }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(prev => ({ ...prev, [integrationId]: data.test }));
        await loadIntegrations();
        onConnectionChange?.();
      }
    } catch {
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', integrationId }),
      });
      setTestResults(prev => { const n = { ...prev }; delete n[integrationId]; return n; });
      await loadIntegrations();
      onConnectionChange?.();
    } catch {
    } finally {
      setConnecting(null);
    }
  };

  const handleTest = async (integrationId: string) => {
    setConnecting(integrationId);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', integrationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setTestResults(prev => ({ ...prev, [integrationId]: data }));
      }
    } catch {
    } finally {
      setConnecting(null);
    }
  };

  const updateConfig = (integrationId: string, key: string, value: string) => {
    setConfigValues(prev => ({
      ...prev,
      [integrationId]: { ...(prev[integrationId] || {}), [key]: value },
    }));
  };

  const categories = [...new Set(integrations.map(i => i.category))];

  const filtered = integrations.filter(i => {
    if (selectedCategory && i.category !== selectedCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return i.name.toLowerCase().includes(s) || i.description.toLowerCase().includes(s) || i.category.includes(s);
    }
    return true;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'space-y-6'}>
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plug className="w-5 h-5 text-teal-400" />
              Integrations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {connectedCount} of {integrations.length} connected — these persist across web, mobile, and desktop
            </p>
          </div>
          <button
            onClick={loadIntegrations}
            className="p-2 rounded-lg glass-button text-gray-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {!compact && (
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search integrations..."
              className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !selectedCategory ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white glass-button'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-400 hover:text-white glass-button'
                }`}
              >
                {CATEGORY_META[cat]?.label || cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(integration => {
          const isExpanded = expandedId === integration.id;
          const isConnected = integration.status === 'connected';
          const isConnecting = connecting === integration.id;
          const test = testResults[integration.id];

          return (
            <div
              key={integration.id}
              className={`rounded-xl border transition-all ${
                isConnected
                  ? 'bg-teal-900/10 border-teal-700/30'
                  : 'bg-gray-800/20 border-gray-700/20 hover:border-gray-600/40'
              }`}
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                className="w-full p-3.5 flex items-center gap-3 text-left"
              >
                <span className="text-xl flex-shrink-0">{integration.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-white">{integration.name}</span>
                    {isConnected && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        <Check className="w-2.5 h-2.5" />
                        Connected
                      </span>
                    )}
                    {integration.freeAlternative && !isConnected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                        {integration.configFields.length === 0 ? 'Free' : 'Free alt available'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{integration.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-0.5">
                    {integration.platforms.includes('all') ? (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-violet-500/15 text-violet-300">ALL</span>
                    ) : (
                      integration.platforms.map(p => (
                        <span key={p} className="text-[9px] px-1 py-0.5 rounded bg-gray-700/50 text-gray-400">{p}</span>
                      ))
                    )}
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 border-t border-gray-700/20 pt-3 animate-fade-in">
                  {integration.freeAlternative && (
                    <div className="flex items-start gap-2 mb-3 p-2.5 rounded-lg bg-green-900/10 border border-green-700/20">
                      <Zap className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-green-300">{integration.freeAlternative}</span>
                    </div>
                  )}

                  {integration.configFields.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {integration.configFields.map(field => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-400 mb-1 block">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-0.5">*</span>}
                            {field.envVar && <span className="text-gray-400 ml-1">(env: {field.envVar})</span>}
                          </label>
                          <input
                            type={field.type === 'password' ? 'password' : 'text'}
                            value={configValues[integration.id]?.[field.key] || ''}
                            onChange={e => updateConfig(integration.id, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-2 rounded-lg glass-input text-sm text-white placeholder-gray-600 focus:outline-none"
                            disabled={isConnected}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {test && (
                    <div className={`flex items-center gap-2 mb-3 p-2.5 rounded-lg border ${
                      test.success
                        ? 'bg-teal-900/10 border-teal-700/20'
                        : 'bg-red-900/10 border-red-700/20'
                    }`}>
                      {test.success ? (
                        <Check className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${test.success ? 'text-teal-300' : 'text-red-300'}`}>{test.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleTest(integration.id)}
                          disabled={isConnecting}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass-button text-gray-300 hover:text-white disabled:opacity-50"
                        >
                          {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          Test
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          disabled={isConnecting}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 disabled:opacity-50"
                        >
                          <Unplug className="w-3 h-3" />
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 disabled:opacity-50"
                      >
                        {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plug className="w-3 h-3" />}
                        Connect
                      </button>
                    )}
                    {integration.docsUrl && (
                      <a
                        href={integration.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Docs
                      </a>
                    )}
                  </div>

                  {integration.connectedAt && (
                    <p className="text-[10px] text-gray-400 mt-2">
                      Connected: {new Date(integration.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No integrations match your search</p>
        </div>
      )}
    </div>
  );
}
