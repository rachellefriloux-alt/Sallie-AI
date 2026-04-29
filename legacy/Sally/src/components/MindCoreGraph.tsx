'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Eye, Heart, Target, Shield, Zap, Activity, RefreshCw, Sparkles, AlertTriangle, Star, Compass, X, Filter } from 'lucide-react';

interface MindCoreNode {
  id: string;
  label: string;
  category: 'value' | 'fear' | 'habit' | 'relationship' | 'strength' | 'trigger' | 'goal' | 'pattern';
  weight: number;
  confidence: number;
  connections: string[];
  source: string;
  lastSeen: string;
}

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  value: { color: '#00A896', icon: Heart, label: 'Values' },
  fear: { color: '#FF6B6B', icon: AlertTriangle, label: 'Fears' },
  habit: { color: '#9D8DF1', icon: Activity, label: 'Habits' },
  relationship: { color: '#FF6B9D', icon: Heart, label: 'Relationships' },
  strength: { color: '#D4AF37', icon: Star, label: 'Strengths' },
  trigger: { color: '#FF8C42', icon: Zap, label: 'Triggers' },
  goal: { color: '#14B8A6', icon: Target, label: 'Goals' },
  pattern: { color: '#06B6D4', icon: Compass, label: 'Patterns' },
};

const FILTER_CATEGORIES = ['all', 'value', 'fear', 'habit', 'relationship', 'goal'] as const;

type FilterCategory = typeof FILTER_CATEGORIES[number];

function getNodeSize(confidence: number): number {
  return 40 + confidence * 60;
}

function getSourceLabel(source: string): string {
  if (!source) return 'Unknown source';
  if (source.toLowerCase().includes('convergence')) return 'From convergence';
  if (source.toLowerCase().includes('conversation') || source.toLowerCase().includes('chat')) return 'From conversations';
  if (source.toLowerCase().includes('goal')) return 'From goals';
  if (source.toLowerCase().includes('heritage')) return 'From heritage';
  if (source.toLowerCase().includes('genesis')) return 'From genesis';
  return `From ${source}`;
}

export function MindCoreGraph() {
  const [nodes, setNodes] = useState<MindCoreNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindCoreNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MindCoreNode | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [categories, setCategories] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchMindCore = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await fetch('/api/mindcore');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setCategories(data.categories || {});
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMindCore();
  }, [fetchMindCore]);

  const filteredNodes = useMemo(() => {
    const displayNodes = nodes.filter(n => n.id !== 'core_identity');
    if (activeFilter === 'all') return displayNodes;
    return displayNodes.filter(n => n.category === activeFilter);
  }, [nodes, activeFilter]);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 50;
    const centerY = 50;

    if (activeFilter === 'all') {
      const catGroups: Record<string, MindCoreNode[]> = {};
      filteredNodes.forEach(node => {
        if (!catGroups[node.category]) catGroups[node.category] = [];
        catGroups[node.category].push(node);
      });

      const catKeys = Object.keys(catGroups);
      catKeys.forEach((cat, catIdx) => {
        const catAngle = (catIdx / catKeys.length) * 2 * Math.PI - Math.PI / 2;
        const catNodes = catGroups[cat];
        const clusterRadius = 28;
        const clusterCenterX = centerX + Math.cos(catAngle) * clusterRadius;
        const clusterCenterY = centerY + Math.sin(catAngle) * clusterRadius;

        catNodes.forEach((node, nodeIdx) => {
          if (catNodes.length === 1) {
            positions[node.id] = { x: clusterCenterX, y: clusterCenterY };
          } else {
            const nodeAngle = (nodeIdx / catNodes.length) * 2 * Math.PI;
            const spread = Math.min(12, 5 + catNodes.length * 1.5);
            positions[node.id] = {
              x: clusterCenterX + Math.cos(nodeAngle) * spread,
              y: clusterCenterY + Math.sin(nodeAngle) * spread,
            };
          }
        });
      });
    } else {
      const radius = 25;
      filteredNodes.forEach((node, idx) => {
        const angle = (idx / filteredNodes.length) * 2 * Math.PI - Math.PI / 2;
        positions[node.id] = {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      });
    }

    return positions;
  }, [filteredNodes, activeFilter]);

  const connectionLines = useMemo(() => {
    const lines: { from: string; to: string; fromCat: string; toCat: string }[] = [];
    const nodeMap = new Map(filteredNodes.map(n => [n.id, n]));
    const seen = new Set<string>();

    filteredNodes.forEach(node => {
      node.connections?.forEach(connId => {
        const key = [node.id, connId].sort().join('-');
        if (!seen.has(key) && nodeMap.has(connId) && nodePositions[node.id] && nodePositions[connId]) {
          seen.add(key);
          lines.push({
            from: node.id,
            to: connId,
            fromCat: node.category,
            toCat: nodeMap.get(connId)!.category,
          });
        }
      });
    });

    return lines;
  }, [filteredNodes, nodePositions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-10 h-10 text-teal-400" />
          </motion.div>
          <span className="text-sm text-gray-400">Building your MindCore map...</span>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-teal-400/10 animate-pulse" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border border-purple-400/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="relative flex items-center justify-center w-32 h-32">
            <Sparkles className="w-12 h-12 text-teal-400/60" />
          </div>
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl font-semibold text-gray-200 mb-3"
        >
          Your MindCore is forming
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm text-gray-500 max-w-md leading-relaxed"
        >
          As you talk with Sallie, share your thoughts, and set goals, your inner landscape will take shape here.
        </motion.p>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => fetchMindCore()}
          className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-teal-400 bg-teal-400/10 hover:bg-teal-400/20 border border-teal-400/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Check again
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white">MindCore</h2>
          <span className="text-xs text-gray-500 ml-2">{nodes.length} nodes</span>
        </div>
        <motion.button
          onClick={() => fetchMindCore(true)}
          disabled={refreshing}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={refreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}>
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </motion.div>
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_CATEGORIES.map(cat => {
          const isActive = activeFilter === cat;
          const config = cat === 'all' ? null : CATEGORY_CONFIG[cat];
          const Icon = config?.icon || Filter;
          const color = config?.color || '#9CA3AF';
          const label = cat === 'all' ? 'All' : config?.label || cat;
          const count = cat === 'all' ? nodes.filter(n => n.id !== 'core_identity').length : (categories[cat] || nodes.filter(n => n.category === cat).length);

          return (
            <motion.button
              key={cat}
              onClick={() => { setActiveFilter(cat); setSelectedNode(null); }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? `${color}25` : 'rgba(255,255,255,0.03)',
                color: isActive ? color : '#6B7280',
                border: `1px solid ${isActive ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
              {count > 0 && <span className="opacity-60">({count})</span>}
            </motion.button>
          );
        })}
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(0,168,150,0.06) 0%, rgba(13,17,23,0.95) 70%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3 h-3 rounded-full bg-teal-400/40 animate-pulse" />
          <div className="absolute w-24 h-24 rounded-full border border-teal-400/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute w-48 h-48 rounded-full border border-teal-400/5" />
          <div className="absolute w-72 h-72 rounded-full border border-white/[0.03]" />
          <div className="absolute w-96 h-96 rounded-full border border-white/[0.02]" />
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => (
              <linearGradient key={cat} id={`grad-${cat}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={config.color} stopOpacity="0.4" />
                <stop offset="50%" stopColor={config.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={config.color} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>
          <AnimatePresence>
            {connectionLines.map(line => {
              const fromPos = nodePositions[line.from];
              const toPos = nodePositions[line.to];
              if (!fromPos || !toPos) return null;
              const color = CATEGORY_CONFIG[line.fromCat]?.color || '#06B6D4';
              return (
                <motion.line
                  key={`${line.from}-${line.to}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  x1={`${fromPos.x}%`}
                  y1={`${fromPos.y}%`}
                  x2={`${toPos.x}%`}
                  y2={`${toPos.y}%`}
                  stroke={color}
                  strokeWidth="1"
                  strokeOpacity="0.25"
                  strokeDasharray="4 4"
                />
              );
            })}
          </AnimatePresence>
        </svg>

        <AnimatePresence mode="popLayout">
          {filteredNodes.map((node, idx) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;
            const config = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.pattern;
            const size = getNodeSize(node.confidence);
            const isHovered = hoveredNode?.id === node.id;
            const isSelected = selectedNode?.id === node.id;
            const Icon = config.icon;

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 180, damping: 20 }}
                className="absolute cursor-pointer"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered || isSelected ? 20 : 2,
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.15 : isSelected ? 1.1 : 1,
                    boxShadow: isHovered || isSelected
                      ? `0 0 ${size * 0.8}px ${config.color}50, 0 0 ${size * 0.4}px ${config.color}30`
                      : `0 0 ${size * 0.3}px ${config.color}25`,
                  }}
                  transition={{ duration: 0.2 }}
                  className="rounded-full flex items-center justify-center relative"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle at 35% 35%, ${config.color}40, ${config.color}15)`,
                    border: `1.5px solid ${config.color}${isHovered || isSelected ? '80' : '40'}`,
                  }}
                >
                  <Icon
                    className="text-white/70"
                    style={{
                      width: `${Math.max(12, size * 0.3)}px`,
                      height: `${Math.max(12, size * 0.3)}px`,
                      color: config.color,
                      opacity: 0.8,
                    }}
                  />
                  {size >= 55 && (
                    <span
                      className="absolute text-center leading-tight px-1 pointer-events-none"
                      style={{
                        fontSize: `${Math.max(8, Math.min(11, size * 0.12))}px`,
                        color: 'rgba(255,255,255,0.7)',
                        bottom: `${size * 0.12}px`,
                        maxWidth: `${size - 8}px`,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {node.label.substring(0, 15)}
                    </span>
                  )}
                </motion.div>

                <AnimatePresence>
                  {isHovered && !isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                      style={{ top: `${size + 8}px` }}
                    >
                      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2.5 shadow-xl min-w-[180px]">
                        <div className="text-xs font-semibold text-white mb-1.5">{node.label}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500">Confidence</span>
                            <span style={{ color: config.color }}>{Math.round(node.confidence * 100)}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${node.confidence * 100}%`, backgroundColor: config.color }} />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500">Category</span>
                            <span style={{ color: config.color }}>{config.label}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-500">Source</span>
                            <span className="text-gray-400">{getSourceLabel(node.source)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNodes.length === 0 && activeFilter !== 'all' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <p className="text-sm text-gray-500">No {CATEGORY_CONFIG[activeFilter]?.label?.toLowerCase() || activeFilter} nodes found</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                Show all nodes
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {React.createElement(CATEGORY_CONFIG[selectedNode.category]?.icon || Brain, {
                    className: 'w-4 h-4',
                    style: { color: CATEGORY_CONFIG[selectedNode.category]?.color || '#06B6D4' },
                  } as React.SVGAttributes<SVGSVGElement>)}
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: CATEGORY_CONFIG[selectedNode.category]?.color }}
                  >
                    {CATEGORY_CONFIG[selectedNode.category]?.label || selectedNode.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{selectedNode.label}</h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Weight</span>
                <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedNode.weight * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: CATEGORY_CONFIG[selectedNode.category]?.color }}
                  />
                </div>
              </div>
              <div>
                <span className="text-gray-500">Confidence</span>
                <div className="mt-1 font-medium" style={{ color: CATEGORY_CONFIG[selectedNode.category]?.color }}>
                  {Math.round(selectedNode.confidence * 100)}%
                </div>
              </div>
              <div>
                <span className="text-gray-500">Source</span>
                <div className="mt-1 text-gray-300">{getSourceLabel(selectedNode.source)}</div>
              </div>
            </div>
            {selectedNode.connections && selectedNode.connections.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Connected to</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedNode.connections.map(connId => {
                    const connNode = nodes.find(n => n.id === connId);
                    if (!connNode) return null;
                    const connConfig = CATEGORY_CONFIG[connNode.category];
                    return (
                      <button
                        key={connId}
                        onClick={() => setSelectedNode(connNode)}
                        className="px-2 py-0.5 rounded-md text-[10px] transition-colors hover:brightness-125"
                        style={{
                          backgroundColor: `${connConfig?.color || '#06B6D4'}15`,
                          color: `${connConfig?.color || '#06B6D4'}cc`,
                          border: `1px solid ${connConfig?.color || '#06B6D4'}25`,
                        }}
                      >
                        {connNode.label.substring(0, 20)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
