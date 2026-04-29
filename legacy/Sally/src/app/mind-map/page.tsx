'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft,
  Network,
  Plus,
  Loader2,
  Download,
  Save,
  FolderOpen,
  FileText,
  Layout,
  Zap,
  Target,
  Lightbulb,
  Clock,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';

const NODE_COLORS = [
  { bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', border: '#8B5CF6', shadow: 'rgba(139,92,246,0.4)' },
  { bg: 'linear-gradient(135deg, #EC4899, #DB2777)', border: '#EC4899', shadow: 'rgba(236,72,153,0.4)' },
  { bg: 'linear-gradient(135deg, #14B8A6, #0D9488)', border: '#14B8A6', shadow: 'rgba(20,184,166,0.4)' },
  { bg: 'linear-gradient(135deg, #F59E0B, #D97706)', border: '#F59E0B', shadow: 'rgba(245,158,11,0.4)' },
  { bg: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: '#3B82F6', shadow: 'rgba(59,130,246,0.4)' },
  { bg: 'linear-gradient(135deg, #EF4444, #DC2626)', border: '#EF4444', shadow: 'rgba(239,68,68,0.4)' },
  { bg: 'linear-gradient(135deg, #06B6D4, #0891B2)', border: '#06B6D4', shadow: 'rgba(6,182,212,0.4)' },
  { bg: 'linear-gradient(135deg, #A855F7, #9333EA)', border: '#A855F7', shadow: 'rgba(168,85,247,0.4)' },
];

interface MindMapData {
  id: string;
  title: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const TEMPLATES: Template[] = [
  { id: 'blank', name: 'Blank Canvas', description: 'Start from scratch', icon: <Layout className="h-4 w-4" /> },
  { id: 'brainstorm', name: 'Brainstorm', description: 'Generate ideas freely', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'project', name: 'Project Plan', description: 'Organize a project', icon: <Target className="h-4 w-4" /> },
  { id: 'timeline', name: 'Timeline', description: 'Map chronological events', icon: <Clock className="h-4 w-4" /> },
  { id: 'study', name: 'Study Notes', description: 'Organize learning material', icon: <FileText className="h-4 w-4" /> },
];

function CentralNode({ data }: { data: Record<string, unknown> }) {
  const label = data.label as string;
  const onLabelChangeFn = data.onLabelChange as ((v: string) => void) | undefined;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <div
      className="relative group"
      onDoubleClick={() => setEditing(true)}
    >
      <div
        className="px-8 py-4 rounded-full text-white font-bold text-lg shadow-xl cursor-grab active:cursor-grabbing select-none min-w-[160px] text-center"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #8B5CF6, #A855F7)',
          boxShadow: '0 0 30px rgba(139,92,246,0.5), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => { setEditing(false); if (onLabelChangeFn) onLabelChangeFn(value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); if (onLabelChangeFn) onLabelChangeFn(value); } }}
            className="bg-transparent text-white text-center text-lg font-bold outline-none w-full"
          />
        ) : (
          label
        )}
      </div>
      <Handle type="source" position={Position.Top} className="!bg-violet-400 !w-3 !h-3 !border-2 !border-violet-600" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-violet-400 !w-3 !h-3 !border-2 !border-violet-600" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-violet-400 !w-3 !h-3 !border-2 !border-violet-600" />
      <Handle type="source" position={Position.Left} id="left" className="!bg-violet-400 !w-3 !h-3 !border-2 !border-violet-600" />
    </div>
  );
}

function BranchNode({ data }: { data: Record<string, unknown> }) {
  const label = data.label as string;
  const onLabelChangeFn = data.onLabelChange as ((v: string) => void) | undefined;
  const onDeleteFn = data.onDelete as (() => void) | undefined;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const color = (data.color as typeof NODE_COLORS[0]) || NODE_COLORS[0];

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <div
      className="relative group"
      onDoubleClick={() => setEditing(true)}
    >
      <div
        className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg cursor-grab active:cursor-grabbing select-none min-w-[100px] text-center transition-transform hover:scale-105"
        style={{
          background: color.bg,
          boxShadow: `0 4px 15px ${color.shadow}, 0 2px 8px rgba(0,0,0,0.2)`,
          border: `1px solid ${color.border}40`,
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => { setEditing(false); if (onLabelChangeFn) onLabelChangeFn(value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); if (onLabelChangeFn) onLabelChangeFn(value); } }}
            className="bg-transparent text-white text-center text-sm font-semibold outline-none w-full"
          />
        ) : (
          label
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-white/60 !w-2.5 !h-2.5 !border-2" style={{ borderColor: color.border }} />
      <Handle type="source" position={Position.Right} className="!bg-white/60 !w-2.5 !h-2.5 !border-2" style={{ borderColor: color.border }} />
      <Handle type="target" position={Position.Top} id="top" className="!bg-white/60 !w-2.5 !h-2.5 !border-2" style={{ borderColor: color.border }} />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!bg-white/60 !w-2.5 !h-2.5 !border-2" style={{ borderColor: color.border }} />
      {onDeleteFn && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteFn(); }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs hover:bg-red-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function IdeaNode({ data }: { data: Record<string, unknown> }) {
  const label = data.label as string;
  const onLabelChangeFn = data.onLabelChange as ((v: string) => void) | undefined;
  const onDeleteFn = data.onDelete as (() => void) | undefined;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);
  const color = (data.color as typeof NODE_COLORS[0]) || NODE_COLORS[0];

  useEffect(() => {
    setValue(label);
  }, [label]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <div
      className="relative group"
      onDoubleClick={() => setEditing(true)}
    >
      <div
        className="px-3 py-1.5 rounded-lg text-xs font-medium shadow cursor-grab active:cursor-grabbing select-none min-w-[70px] text-center transition-transform hover:scale-105"
        style={{
          background: `${color.border}20`,
          color: color.border,
          border: `1px solid ${color.border}40`,
          boxShadow: `0 2px 8px ${color.shadow}`,
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => { setEditing(false); if (onLabelChangeFn) onLabelChangeFn(value); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setEditing(false); if (onLabelChangeFn) onLabelChangeFn(value); } }}
            className="bg-transparent text-center text-xs font-medium outline-none w-full"
            style={{ color: color.border }}
          />
        ) : (
          label
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-white/40 !w-2 !h-2 !border" style={{ borderColor: color.border }} />
      <Handle type="source" position={Position.Right} className="!bg-white/40 !w-2 !h-2 !border" style={{ borderColor: color.border }} />
      {onDeleteFn && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteFn(); }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] hover:bg-red-600"
        >
          <X className="h-2 w-2" />
        </button>
      )}
    </div>
  );
}

const nodeTypes = {
  central: CentralNode,
  branch: BranchNode,
  idea: IdeaNode,
};

function getPositionForIndex(index: number, total: number, radius: number = 280) {
  const angle = (index * (360 / total)) - 90;
  const rad = (angle * Math.PI) / 180;
  return {
    x: 400 + Math.cos(rad) * radius,
    y: 300 + Math.sin(rad) * radius,
  };
}

function getSubPositionForIndex(parentPos: { x: number; y: number }, subIndex: number, totalSubs: number, parentAngle: number) {
  const spread = 40;
  const subRadius = 140;
  const baseAngle = parentAngle;
  const offsetAngle = (subIndex - (totalSubs - 1) / 2) * (spread / totalSubs);
  const angle = baseAngle + offsetAngle;
  const rad = (angle * Math.PI) / 180;
  return {
    x: parentPos.x + Math.cos(rad) * subRadius,
    y: parentPos.y + Math.sin(rad) * subRadius,
  };
}

interface BranchData {
  topic: string;
  ideas: string[];
}

function buildNodesAndEdges(
  centralTopic: string,
  branchesData: BranchData[],
  onLabelChange: (nodeId: string, value: string) => void,
  onDeleteNode: (nodeId: string) => void,
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: 'central',
    type: 'central',
    position: { x: 400, y: 300 },
    data: {
      label: centralTopic,
      onLabelChange: (v: string) => onLabelChange('central', v),
    },
  });

  branchesData.forEach((branch, bIdx) => {
    const colorIdx = bIdx % NODE_COLORS.length;
    const color = NODE_COLORS[colorIdx];
    const branchId = `branch-${bIdx}`;
    const pos = getPositionForIndex(bIdx, branchesData.length);
    const angle = (bIdx * (360 / branchesData.length)) - 90;

    nodes.push({
      id: branchId,
      type: 'branch',
      position: pos,
      data: {
        label: branch.topic,
        color,
        onLabelChange: (v: string) => onLabelChange(branchId, v),
        onDelete: () => onDeleteNode(branchId),
      },
    });

    edges.push({
      id: `e-central-${branchId}`,
      source: 'central',
      target: branchId,
      type: 'default',
      animated: true,
      style: { stroke: color.border, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: color.border, width: 15, height: 15 },
    });

    branch.ideas.forEach((idea, iIdx) => {
      const ideaId = `idea-${bIdx}-${iIdx}`;
      const subPos = getSubPositionForIndex(pos, iIdx, branch.ideas.length, angle);
      nodes.push({
        id: ideaId,
        type: 'idea',
        position: subPos,
        data: {
          label: idea,
          color,
          onLabelChange: (v: string) => onLabelChange(ideaId, v),
          onDelete: () => onDeleteNode(ideaId),
        },
      });

      edges.push({
        id: `e-${branchId}-${ideaId}`,
        source: branchId,
        target: ideaId,
        type: 'default',
        style: { stroke: color.border, strokeWidth: 1.5, opacity: 0.6 },
      });
    });
  });

  return { nodes, edges };
}

function getTemplateData(template: string): { central: string; branches: BranchData[] } {
  switch (template) {
    case 'brainstorm':
      return {
        central: 'Brainstorm Session',
        branches: [
          { topic: 'Ideas', ideas: ['Idea 1', 'Idea 2', 'Idea 3'] },
          { topic: 'Pros', ideas: ['Advantage 1', 'Advantage 2'] },
          { topic: 'Cons', ideas: ['Challenge 1', 'Challenge 2'] },
          { topic: 'Next Steps', ideas: ['Action 1', 'Action 2'] },
        ],
      };
    case 'project':
      return {
        central: 'Project Plan',
        branches: [
          { topic: 'Goals', ideas: ['Goal 1', 'Goal 2'] },
          { topic: 'Tasks', ideas: ['Task 1', 'Task 2', 'Task 3'] },
          { topic: 'Resources', ideas: ['Resource 1', 'Resource 2'] },
          { topic: 'Timeline', ideas: ['Phase 1', 'Phase 2'] },
          { topic: 'Team', ideas: ['Member 1', 'Member 2'] },
        ],
      };
    case 'timeline':
      return {
        central: 'Timeline',
        branches: [
          { topic: 'Start', ideas: ['Beginning'] },
          { topic: 'Phase 1', ideas: ['Event 1', 'Event 2'] },
          { topic: 'Phase 2', ideas: ['Event 3', 'Event 4'] },
          { topic: 'Phase 3', ideas: ['Event 5'] },
          { topic: 'End', ideas: ['Final Event'] },
        ],
      };
    case 'study':
      return {
        central: 'Study Notes',
        branches: [
          { topic: 'Main Topic', ideas: ['Sub-topic 1', 'Sub-topic 2'] },
          { topic: 'Key Concepts', ideas: ['Concept 1', 'Concept 2', 'Concept 3'] },
          { topic: 'Examples', ideas: ['Example 1', 'Example 2'] },
          { topic: 'Questions', ideas: ['Q1', 'Q2', 'Q3'] },
          { topic: 'Summary', ideas: ['Key Takeaway'] },
        ],
      };
    default:
      return {
        central: 'Central Idea',
        branches: [
          { topic: 'Branch 1', ideas: ['Idea 1'] },
          { topic: 'Branch 2', ideas: ['Idea 2'] },
          { topic: 'Branch 3', ideas: ['Idea 3'] },
        ],
      };
  }
}

const LS_KEY = 'sallie-mindmaps';

function loadSavedMaps(): MindMapData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistMaps(maps: MindMapData[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(maps));
}

export default function MindMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[]);
  const [savedMaps, setSavedMaps] = useState<MindMapData[]>([]);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState('Untitled Mind Map');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [hasCanvas, setHasCanvas] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const branchDataRef = useRef<BranchData[]>([]);
  const centralRef = useRef('Central Idea');

  useEffect(() => {
    setSavedMaps(loadSavedMaps());
  }, []);

  const onLabelChange = useCallback((nodeId: string, value: string) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: value } } : n));
    if (nodeId === 'central') centralRef.current = value;
  }, [setNodes]);

  const onDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, type: 'default', animated: true, style: { stroke: '#8B5CF6', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  const loadMapToCanvas = useCallback((central: string, branches: BranchData[], title?: string) => {
    branchDataRef.current = branches;
    centralRef.current = central;
    const { nodes: newNodes, edges: newEdges } = buildNodesAndEdges(central, branches, onLabelChange, onDeleteNode);
    setNodes(newNodes);
    setEdges(newEdges);
    setHasCanvas(true);
    if (title) setMapTitle(title);
  }, [onLabelChange, onDeleteNode, setNodes, setEdges]);

  const createFromTemplate = useCallback((templateId: string) => {
    const data = getTemplateData(templateId);
    const id = `mindmap_${Date.now()}`;
    setCurrentMapId(id);
    loadMapToCanvas(data.central, data.branches, `${data.central} Map`);
  }, [loadMapToCanvas]);

  const generateWithAI = useCallback(async (topic: string) => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setShowAiInput(false);
    try {
      const prompt = `Generate a mind map structure for the topic: "${topic}". Return ONLY valid JSON in this exact format, no other text:
{
  "central": "Main Topic",
  "branches": [
    { "topic": "Branch Name", "ideas": ["Idea 1", "Idea 2", "Idea 3"] }
  ]
}
Include 4-6 branches, each with 2-4 ideas. Make the content specific and useful.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: 'mind-map' }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      const reply = data.reply || '';

      let parsed: { central: string; branches: BranchData[] } | null = null;
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {}
      }

      if (parsed && parsed.central && Array.isArray(parsed.branches)) {
        const id = `mindmap_${Date.now()}`;
        setCurrentMapId(id);
        loadMapToCanvas(parsed.central, parsed.branches, `${topic} Map`);
      } else {
        const id = `mindmap_${Date.now()}`;
        setCurrentMapId(id);
        loadMapToCanvas(topic, [
          { topic: 'Key Aspects', ideas: ['Aspect 1', 'Aspect 2'] },
          { topic: 'Details', ideas: ['Detail 1', 'Detail 2'] },
          { topic: 'Actions', ideas: ['Action 1', 'Action 2'] },
          { topic: 'Notes', ideas: ['Note 1'] },
        ], `${topic} Map`);
      }
    } catch {
      const id = `mindmap_${Date.now()}`;
      setCurrentMapId(id);
      loadMapToCanvas(topic, [
        { topic: 'Key Aspects', ideas: ['Aspect 1', 'Aspect 2'] },
        { topic: 'Details', ideas: ['Detail 1', 'Detail 2'] },
        { topic: 'Actions', ideas: ['Action 1', 'Action 2'] },
      ], `${topic} Map`);
    } finally {
      setIsGenerating(false);
      setAiTopic('');
    }
  }, [loadMapToCanvas]);

  const addBranch = useCallback(() => {
    const branchCount = nodes.filter((n) => n.type === 'branch').length;
    const colorIdx = branchCount % NODE_COLORS.length;
    const color = NODE_COLORS[colorIdx];
    const branchId = `branch-${Date.now()}`;
    const pos = getPositionForIndex(branchCount, branchCount + 1, 280);

    const newNode: Node = {
      id: branchId,
      type: 'branch',
      position: pos,
      data: {
        label: `New Branch`,
        color,
        onLabelChange: (v: string) => onLabelChange(branchId, v),
        onDelete: () => onDeleteNode(branchId),
      },
    };

    const newEdge: Edge = {
      id: `e-central-${branchId}`,
      source: 'central',
      target: branchId,
      type: 'default',
      animated: true,
      style: { stroke: color.border, strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: color.border, width: 15, height: 15 },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  }, [nodes, onLabelChange, onDeleteNode, setNodes, setEdges]);

  const addSubNode = useCallback((parentId: string) => {
    const parent = nodes.find((n) => n.id === parentId);
    if (!parent) return;
    const color = (parent.data.color as typeof NODE_COLORS[0]) || NODE_COLORS[0];
    const ideaId = `idea-${Date.now()}`;
    const childCount = edges.filter((e) => e.source === parentId).length;
    const subPos = {
      x: parent.position.x + 160,
      y: parent.position.y + (childCount * 50) - 25,
    };

    const newNode: Node = {
      id: ideaId,
      type: 'idea',
      position: subPos,
      data: {
        label: 'New Idea',
        color,
        onLabelChange: (v: string) => onLabelChange(ideaId, v),
        onDelete: () => onDeleteNode(ideaId),
      },
    };

    const newEdge: Edge = {
      id: `e-${parentId}-${ideaId}`,
      source: parentId,
      target: ideaId,
      type: 'default',
      style: { stroke: color.border, strokeWidth: 1.5, opacity: 0.6 },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  }, [nodes, edges, onLabelChange, onDeleteNode, setNodes, setEdges]);

  const saveCurrentMap = useCallback(() => {
    if (!hasCanvas) return;
    const id = currentMapId || `mindmap_${Date.now()}`;
    const mapData: MindMapData = {
      id,
      title: mapTitle,
      nodes: nodes.map((n) => ({ ...n, data: { label: n.data.label, color: n.data.color } })),
      edges,
      createdAt: savedMaps.find((m) => m.id === id)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = savedMaps.some((m) => m.id === id)
      ? savedMaps.map((m) => (m.id === id ? mapData : m))
      : [mapData, ...savedMaps];

    setSavedMaps(updated);
    persistMaps(updated);
    setCurrentMapId(id);
  }, [hasCanvas, currentMapId, mapTitle, nodes, edges, savedMaps]);

  const loadSavedMap = useCallback((map: MindMapData) => {
    setCurrentMapId(map.id);
    setMapTitle(map.title);
    const restoredNodes = map.nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onLabelChange: (v: string) => onLabelChange(n.id, v),
        onDelete: n.type !== 'central' ? () => onDeleteNode(n.id) : undefined,
      },
    }));
    setNodes(restoredNodes);
    setEdges(map.edges);
    setHasCanvas(true);
  }, [onLabelChange, onDeleteNode, setNodes, setEdges]);

  const deleteSavedMap = useCallback((id: string) => {
    const updated = savedMaps.filter((m) => m.id !== id);
    setSavedMaps(updated);
    persistMaps(updated);
    if (currentMapId === id) {
      setCurrentMapId(null);
      setNodes([]);
      setEdges([]);
      setHasCanvas(false);
    }
  }, [savedMaps, currentMapId, setNodes, setEdges]);

  const exportAsJSON = useCallback(() => {
    const data = {
      title: mapTitle,
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, label: n.data.label, position: n.position })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapTitle.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [mapTitle, nodes, edges]);

  const nodeTypes_ = useMemo(() => nodeTypes, []);

  return (
    <main className="h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex flex-col overflow-hidden">
      <header className="h-14 border-b border-violet-500/20 bg-black/20 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-violet-400" />
            <span className="text-white font-semibold">Mind Map Studio</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasCanvas && (
            <>
              <button
                onClick={saveCurrentMap}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Save className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={exportAsJSON}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Export JSON"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-violet-500/20 bg-black/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-violet-400" />
              <span className="text-white text-sm font-medium">Saved Maps</span>
            </div>
            <button
              onClick={() => setShowAiInput(true)}
              className="p-1 text-violet-400 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {savedMaps.length === 0 ? (
              <div className="text-center py-8">
                <Network className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">No saved maps</p>
                <button
                  onClick={() => setShowAiInput(true)}
                  className="text-violet-400 text-xs mt-2 hover:underline"
                >
                  Create one
                </button>
              </div>
            ) : (
              savedMaps.map((map) => (
                <div
                  key={map.id}
                  onClick={() => loadSavedMap(map)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentMapId === map.id
                      ? 'bg-violet-600/20 border border-violet-500/30'
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-white text-sm font-medium truncate">{map.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSavedMap(map.id); }}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-slate-600 text-[10px] mt-1">
                    {new Date(map.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 relative bg-slate-900/30">
          {hasCanvas ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes_}
              fitView
              minZoom={0.2}
              maxZoom={3}
              defaultEdgeOptions={{
                type: 'default',
                animated: false,
              }}
              style={{ background: 'transparent' }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(139,92,246,0.15)" />
              <Controls
                className="!bg-slate-800/80 !border-violet-500/30 !rounded-lg !shadow-lg [&>button]:!bg-slate-700 [&>button]:!border-violet-500/20 [&>button]:!text-violet-300 [&>button:hover]:!bg-slate-600"
              />
              <MiniMap
                nodeStrokeColor="#8B5CF6"
                nodeColor={(n) => {
                  if (n.type === 'central') return '#7C3AED';
                  const c = n.data?.color as typeof NODE_COLORS[0] | undefined;
                  return c?.border || '#8B5CF6';
                }}
                maskColor="rgba(0,0,0,0.7)"
                className="!bg-slate-900/80 !border-violet-500/30 !rounded-lg"
              />
              <Panel position="top-left" className="flex items-center gap-2">
                {editingTitle ? (
                  <input
                    type="text"
                    value={mapTitle}
                    onChange={(e) => setMapTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                    className="bg-slate-900 border border-violet-500 rounded-lg px-3 py-1.5 text-white text-sm font-medium focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setEditingTitle(true)}
                    className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:bg-slate-800 border border-violet-500/20"
                  >
                    {mapTitle}
                  </button>
                )}
              </Panel>
              <Panel position="top-right" className="flex items-center gap-1">
                <button
                  onClick={addBranch}
                  className="flex items-center gap-1 bg-violet-600/80 hover:bg-violet-600 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Branch
                </button>
                <button
                  onClick={() => {
                    const branchNodes = nodes.filter((n) => n.type === 'branch');
                    if (branchNodes.length > 0) {
                      addSubNode(branchNodes[branchNodes.length - 1].id);
                    }
                  }}
                  className="flex items-center gap-1 bg-pink-600/80 hover:bg-pink-600 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Idea
                </button>
              </Panel>
            </ReactFlow>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 text-violet-400 animate-spin" />
                    <Sparkles className="h-6 w-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <p className="text-white text-lg font-medium">AI is generating your mind map...</p>
                  <p className="text-slate-400 text-sm">Analyzing topic and creating branches</p>
                </div>
              ) : showAiInput ? (
                <div className="flex flex-col items-center gap-4 w-full max-w-lg px-8">
                  <Sparkles className="h-12 w-12 text-violet-400 mb-2" />
                  <h2 className="text-2xl font-bold text-white">AI Mind Map Generator</h2>
                  <p className="text-slate-400 text-center text-sm">
                    Enter a topic and AI will create a structured mind map for you
                  </p>
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateWithAI(aiTopic)}
                      placeholder="Enter a topic (e.g. Machine Learning)"
                      className="flex-1 bg-slate-800 border border-violet-500/30 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-slate-500"
                      autoFocus
                    />
                    <button
                      onClick={() => generateWithAI(aiTopic)}
                      disabled={!aiTopic.trim()}
                      className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAiInput(false)}
                    className="text-slate-500 text-sm hover:text-slate-300 mt-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <Network className="h-20 w-20 text-violet-400/30 mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Mind Map Studio</h2>
                  <p className="text-slate-400 mb-6 text-center max-w-md">
                    Visualize ideas, brainstorm, plan projects, and organize thoughts
                    <br />with interactive mind mapping
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAiInput(true)}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Generate
                    </button>
                    <button
                      onClick={() => createFromTemplate('blank')}
                      className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Blank Canvas
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-72 border-l border-violet-500/20 bg-black/10 flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 border-b border-violet-500/20">
            <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              AI Quick Start
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['Machine Learning', 'Business Strategy', 'Web Development', 'Content Marketing'].map((topic) => (
                <button
                  key={topic}
                  onClick={() => generateWithAI(topic)}
                  disabled={isGenerating}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 text-left transition-colors disabled:opacity-50"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-b border-violet-500/20">
            <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
              <Layout className="h-4 w-4 text-violet-400" />
              Templates
            </h3>
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => createFromTemplate(template.id)}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition-colors flex items-start gap-3"
                >
                  <div className="p-2 bg-violet-500/20 rounded-lg text-violet-400">
                    {template.icon}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{template.name}</div>
                    <div className="text-slate-500 text-xs">{template.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {hasCanvas && (
            <div className="p-4">
              <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                Canvas Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={addBranch}
                  className="w-full p-2 bg-violet-600/20 hover:bg-violet-600/30 rounded-lg text-sm text-violet-300 text-left transition-colors flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Branch
                </button>
                <button
                  onClick={() => {
                    const branchNodes = nodes.filter((n) => n.type === 'branch');
                    if (branchNodes.length > 0) addSubNode(branchNodes[branchNodes.length - 1].id);
                  }}
                  className="w-full p-2 bg-pink-600/20 hover:bg-pink-600/30 rounded-lg text-sm text-pink-300 text-left transition-colors flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Add Idea to Last Branch
                </button>
                <button
                  onClick={() => setShowAiInput(true)}
                  className="w-full p-2 bg-amber-600/20 hover:bg-amber-600/30 rounded-lg text-sm text-amber-300 text-left transition-colors flex items-center gap-2"
                >
                  <Sparkles className="h-3 w-3" />
                  AI Generate New Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}