'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type React from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Brain, 
  Target, 
  Zap, 
  MessageCircle, 
  Users, 
  TrendingUp,
  Lightbulb,
  Shield,
  Network,
  Sparkles,
  Plus,
  Search,
  Clock,
  CheckCircle,
  Loader2,
  ArrowRight,
  Copy,
  Heart,
  Award,
  ThumbsUp,
  Share2,
  Globe,
  Mail,
  MessageSquare,
  Megaphone,
  X,
  Maximize2,
  RotateCcw,
  Edit3,
  Save,
  Download,
  Share
} from 'lucide-react';

type PersuasionTechnique = 'ethos' | 'pathos' | 'logos' | 'storytelling' | 'social_proof' | 'scarcity' | 'authority' | 'reciprocity' | 'commitment' | 'liking';

interface MindMap {
  id: string;
  title: string;
  centralTopic: string;
  branches: MindBranch[];
  createdAt: string;
}

interface MindBranch {
  id: string;
  topic: string;
  ideas: string[];
  color: string;
}

interface PersuasionCampaign {
  id: string;
  name: string;
  goal: string;
  audience: string;
  techniques: PersuasionTechnique[];
  content: string;
  status: 'draft' | 'active' | 'completed';
  metrics: {
    views: number;
    engagement: number;
    conversions: number;
  };
  createdAt: string;
}

const PERSUASION_TECHNIQUES: { 
  id: PersuasionTechnique; 
  name: string; 
  description: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { 
    id: 'ethos', 
    name: 'Ethos', 
    description: 'Establish trust through expertise',
    icon: <Shield className="h-4 w-4" />,
    color: '#10B981'
  },
  { 
    id: 'pathos', 
    name: 'Pathos', 
    description: 'Connect emotionally',
    icon: <Heart className="h-4 w-4" />,
    color: '#EC4899'
  },
  { 
    id: 'logos', 
    name: 'Logos', 
    description: 'Use rational arguments and evidence',
    icon: <Brain className="h-4 w-4" />,
    color: '#3B82F6'
  },
  { 
    id: 'storytelling', 
    name: 'Story', 
    description: 'Craft compelling narratives',
    icon: <BookOpen className="h-4 w-4" />,
    color: '#8B5CF6'
  },
  { 
    id: 'social_proof', 
    name: 'Social Proof', 
    description: 'Show others endorse your message',
    icon: <Users className="h-4 w-4" />,
    color: '#F59E0B'
  },
  { 
    id: 'scarcity', 
    name: 'Scarcity', 
    description: 'Create urgency and exclusivity',
    icon: <Zap className="h-4 w-4" />,
    color: '#EF4444'
  },
  { 
    id: 'authority', 
    name: 'Authority', 
    description: 'Leverage expert endorsements',
    icon: <Award className="h-4 w-4" />,
    color: '#06B6D4'
  },
  { 
    id: 'reciprocity', 
    name: 'Reciprocity', 
    description: 'Give value to receive value',
    icon: <ThumbsUp className="h-4 w-4" />,
    color: '#84CC16'
  },
  { 
    id: 'commitment', 
    name: 'Commitment', 
    description: 'Get small yeses for bigger asks',
    icon: <CheckCircle className="h-4 w-4" />,
    color: '#14B8A6'
  },
  { 
    id: 'liking', 
    name: 'Liking', 
    description: 'Build rapport and similarity',
    icon: <Heart className="h-4 w-4" />,
    color: '#F97316'
  },
];

const CAMPAIGN_GOALS = [
  'Brand Awareness',
  'Lead Generation',
  'Sales Conversion',
  'Audience Engagement',
  'Thought Leadership',
  'Crisis Management',
  'Product Launch',
  'Community Building'
];

const TARGET_AUDIENCES = [
  'Decision Makers',
  'Tech Professionals',
  'Small Business Owners',
  'Marketing Teams',
  'Executives',
  'General Consumers',
  'Influencers',
  'Industry Experts'
];

// Sample analysis result
interface AnalysisResult {
  score: number;
  techniques: string[];
  conversionPotential: string;
}

export default function CopyMindPage() {
  const [campaigns, setCampaigns] = useState<PersuasionCampaign[]>([]);
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [selectedMap, setSelectedMap] = useState<MindMap | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // New campaign form
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [selectedTechniques, setSelectedTechniques] = useState<PersuasionTechnique[]>([]);
  const [newContent, setNewContent] = useState('');

  // Mind map editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [mapTitle, setMapTitle] = useState('My Mind Map');
  const [centralTopic, setCentralTopic] = useState('Central Idea');
  const [branches, setBranches] = useState<MindBranch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  const createCampaign = async () => {
    if (!newCampaignName.trim() || !newGoal || !newAudience) return;
    setIsCreating(true);
    
    try {
      const techniqueNames = selectedTechniques
        .map(t => PERSUASION_TECHNIQUES.find(pt => pt.id === t)?.name)
        .filter(Boolean)
        .join(', ');

      const prompt = `You are a persuasion and copywriting expert. Create a persuasion campaign with the following details:
Campaign Name: ${newCampaignName}
Goal: ${newGoal}
Target Audience: ${newAudience}
Persuasion Techniques to use: ${techniqueNames || 'Choose the best techniques'}

Generate compelling campaign content that applies the specified persuasion techniques. Write the actual campaign copy/content (2-3 paragraphs) that could be used directly. Make it persuasive, professional, and tailored to the target audience.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: 'copy-mind' }),
      });

      const data = await res.json();
      const generatedContent = data.reply || 'Failed to generate content. Please try again.';

      const newCampaign: PersuasionCampaign = {
        id: `campaign_${Date.now()}`,
        name: newCampaignName,
        goal: newGoal,
        audience: newAudience,
        techniques: selectedTechniques,
        content: generatedContent,
        status: 'draft',
        metrics: { views: 0, engagement: 0, conversions: 0 },
        createdAt: new Date().toISOString(),
      };
      
      setCampaigns([newCampaign, ...campaigns]);
      setNewCampaignName('');
      setNewGoal('');
      setNewAudience('');
      setSelectedTechniques([]);
      setNewContent('');
      setShowCampaignForm(false);
    } catch (err) {
      console.error('Campaign creation failed:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTechnique = (technique: PersuasionTechnique) => {
    setSelectedTechniques(prev => 
      prev.includes(technique)
        ? prev.filter(t => t !== technique)
        : [...prev, technique]
    );
  };

  const generateMindMap = async () => {
    setIsGeneratingMap(true);
    try {
      const topicInput = centralTopic !== 'Central Idea' ? centralTopic : 'Persuasion Strategy';
      const prompt = `Generate a mind map structure for the topic: "${topicInput}". 
Return ONLY valid JSON in this exact format, no other text:
{
  "title": "Mind Map Title",
  "centralTopic": "Central Topic",
  "branches": [
    { "topic": "Branch 1 Name", "ideas": ["idea 1", "idea 2", "idea 3"] },
    { "topic": "Branch 2 Name", "ideas": ["idea 1", "idea 2"] },
    { "topic": "Branch 3 Name", "ideas": ["idea 1", "idea 2", "idea 3"] },
    { "topic": "Branch 4 Name", "ideas": ["idea 1", "idea 2"] },
    { "topic": "Branch 5 Name", "ideas": ["idea 1", "idea 2", "idea 3"] },
    { "topic": "Branch 6 Name", "ideas": ["idea 1", "idea 2"] }
  ]
}
Generate 5-6 branches with 2-3 ideas each. Make the content relevant and insightful.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: 'copy-mind' }),
      });

      const data = await res.json();
      const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
      
      let mapData: { title: string; centralTopic: string; branches: { topic: string; ideas: string[] }[] } | null = null;
      
      try {
        const jsonMatch = (data.reply || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mapData = JSON.parse(jsonMatch[0]);
        }
      } catch {
        mapData = null;
      }

      const newMap: MindMap = {
        id: `mindmap_${Date.now()}`,
        title: mapData?.title || 'AI Mind Map',
        centralTopic: mapData?.centralTopic || topicInput,
        branches: (mapData?.branches || [
          { topic: 'Key Concepts', ideas: ['Idea 1', 'Idea 2'] },
          { topic: 'Strategy', ideas: ['Approach 1', 'Approach 2'] },
          { topic: 'Actions', ideas: ['Step 1', 'Step 2'] },
          { topic: 'Goals', ideas: ['Goal 1', 'Goal 2'] },
          { topic: 'Resources', ideas: ['Resource 1', 'Resource 2'] },
        ]).map((b, i) => ({
          id: String(i + 1),
          topic: b.topic,
          ideas: b.ideas,
          color: colors[i % colors.length],
        })),
        createdAt: new Date().toISOString(),
      };
      
      setMindMaps([newMap, ...mindMaps]);
      setSelectedMap(newMap);
      setMapTitle(newMap.title);
      setCentralTopic(newMap.centralTopic);
      setBranches(newMap.branches);
    } catch (err) {
      console.error('Mind map generation failed:', err);
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const analyzeContent = async () => {
    if (!analysisText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const techniqueList = PERSUASION_TECHNIQUES.map(t => t.id).join(', ');
      const prompt = `You are a persuasion analysis expert. Analyze the following text for persuasion techniques used.

Text to analyze:
"""
${analysisText}
"""

Available techniques: ${techniqueList}

Return ONLY valid JSON in this exact format, no other text:
{
  "score": <number 0-100 representing overall persuasion effectiveness>,
  "techniques": [<array of technique IDs from the list above that are present in the text>],
  "conversionPotential": "<one of: Low, Medium, High, Very High>"
}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: 'copy-mind' }),
      });

      const data = await res.json();
      
      let parsed: AnalysisResult | null = null;
      try {
        const jsonMatch = (data.reply || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const raw = JSON.parse(jsonMatch[0]);
          const validTechniques = PERSUASION_TECHNIQUES.map(t => t.id);
          parsed = {
            score: Math.min(100, Math.max(0, Number(raw.score) || 50)),
            techniques: (raw.techniques || []).filter((t: string) => validTechniques.includes(t as PersuasionTechnique)),
            conversionPotential: ['Low', 'Medium', 'High', 'Very High'].includes(raw.conversionPotential) 
              ? raw.conversionPotential 
              : 'Medium',
          };
        }
      } catch {
        parsed = null;
      }

      setAnalysisResult(parsed || {
        score: 50,
        techniques: ['logos'],
        conversionPotential: 'Medium',
      });
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisResult({
        score: 0,
        techniques: [],
        conversionPotential: 'Low',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initialize with a mind map if none exists
  useEffect(() => {
    if (mindMaps.length > 0 && !selectedMap) {
      setSelectedMap(mindMaps[0]);
      setMapTitle(mindMaps[0].title);
      setCentralTopic(mindMaps[0].centralTopic);
      setBranches(mindMaps[0].branches);
    }
  }, [mindMaps, selectedMap]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-violet-500/20 bg-black/20 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
        <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-violet-400" />
          <span className="text-white font-semibold">CopyMind AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            title="Go back"
            onClick={() => setShowCampaignForm(!showCampaignForm)}
            className="text-violet-400 hover:text-violet-300"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full flex gap-4">
          
          {/* LEFT PANEL - Campaigns */}
          <div className="w-80 shrink-0 flex flex-col gap-4">
            {/* Campaigns Section */}
            <div className="flex-1 bg-slate-800/60 border border-violet-500/20 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-violet-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-violet-400" />
                  <span className="text-white font-medium text-sm">Campaigns</span>
                </div>
                <button 
                  title="Go back"
                  onClick={() => setShowCampaignForm(!showCampaignForm)}
                  className="text-violet-400 hover:text-violet-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showCampaignForm && (
                <div className="p-4 border-b border-violet-500/20 bg-slate-900/50 space-y-3">
                  <input
                    title="Campaign name"
                    type="text"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="Campaign name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <select
                    title="Select goal"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Select goal</option>
                    {CAMPAIGN_GOALS.map(goal => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
                  <select
                    title="Select audience"
                    value={newAudience}
                    onChange={(e) => setNewAudience(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Select audience</option>
                    {TARGET_AUDIENCES.map(aud => (
                      <option key={aud} value={aud}>{aud}</option>
                    ))}
                  </select>
                  <button
                    onClick={createCampaign}
                    disabled={!newCampaignName.trim() || !newGoal || !newAudience || isCreating}
                    className="w-full flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Create
                  </button>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs mb-2">No campaigns yet</p>
                    <button 
                      title="Create campaign"
                      onClick={() => setShowCampaignForm(true)}
                      className="text-violet-400 text-xs mt-2 hover:underline"
                    >
                      Create one
                    </button>
                  </div>
                ) : (
                  campaigns.map(campaign => (
                    <div key={campaign.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-violet-500/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-white text-sm font-medium truncate">{campaign.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          campaign.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          campaign.status === 'active' ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[10px]">{campaign.goal} • {campaign.audience}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {campaign.techniques.slice(0, 3).map(tech => (
                          <span key={tech} className="px-1.5 py-0.5 bg-violet-500/10 text-violet-300 rounded text-[9px]">
                            {PERSUASION_TECHNIQUES.find(t => t.id === tech)?.name}
                          </span>
                        ))}
                        {campaign.techniques.length > 3 && (
                          <span className="text-slate-500 text-[9px]">+{campaign.techniques.length - 3}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold text-white">{campaigns.length}</div>
                  <div className="text-[10px] text-slate-400">Campaigns</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{mindMaps.length}</div>
                  <div className="text-[10px] text-slate-400">Maps</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{selectedTechniques.length}</div>
                  <div className="text-[10px] text-slate-400">Techniques</div>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER - Mind Map Canvas */}
          <div className="flex-1 bg-slate-800/40 border border-violet-500/20 rounded-xl relative overflow-hidden">
            {/* Mind Map Header */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              {editingTitle ? (
                <input
                  title="Edit title"
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
                  className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:bg-slate-800"
                >
                  <Edit3 className="h-3 w-3" />
                  {mapTitle}
                </button>
              )}
              
              <div className="flex items-center gap-1">
                <button title="Maximize" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                  <Maximize2 className="h-3 w-3" />
                </button>
                <button title="Rotate" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                  <RotateCcw className="h-3 w-3" />
                </button>
                <button title="Download" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                  <Download className="h-3 w-3" />
                </button>
                <button title="Share" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                  <Share className="h-3 w-3" />
                </button>
              </div>
            </div>

            {selectedMap || mindMaps.length > 0 ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="relative w-full max-w-lg aspect-square">
                  {/* Central Topic */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="group relative">
                      <div className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/30 cursor-pointer hover:scale-105 transition-transform">
                        {centralTopic}
                      </div>
                      <input
                        title="Central idea"
                        type="text"
                        value={centralTopic}
                        onChange={(e) => setCentralTopic(e.target.value)}
                        className="absolute inset-0 bg-transparent text-transparent text-center w-full focus:bg-slate-900/80 rounded-full px-6 py-3 text-white font-semibold focus:outline-none focus:text-white"
                      />
                    </div>
                  </div>

                  {/* Branch Lines and Nodes */}
                  {branches.map((branch, index) => {
                    const angle = (index * 360 / branches.length) - 90;
                    const radians = (angle * Math.PI) / 180;
                    const radius = 140;
                    const x = Math.cos(radians) * radius;
                    const y = Math.sin(radians) * radius;
                    
                    return (
                      <div key={branch.id}>
                        {/* Connection Line */}
                        <svg className="absolute top-1/2 left-1/2 w-32 h-32 -z-0" style={{
                          transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                          transformOrigin: 'center'
                        }}>
                          <line 
                            x1="50%" 
                            y1="50%" 
                            x2="50%" 
                            y2="0%" 
                            stroke={branch.color} 
                            strokeWidth="2" 
                            strokeDasharray="4 4"
                            opacity="0.5"
                          />
                        </svg>
                        
                        {/* Branch Node */}
                        <div 
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                          }}
                        >
                          <div 
                            className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-lg cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: branch.color }}
                          >
                            {branch.topic}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Inner ideas ring */}
                  {branches.map((branch, index) => {
                    const angle = (index * 360 / branches.length) - 90;
                    const radians = (angle * Math.PI) / 180;
                    const radius = 85;
                    const x = Math.cos(radians) * radius;
                    const y = Math.sin(radians) * radius;
                    
                    return (
                      <div 
                        key={`ideas-${branch.id}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-5"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {branch.ideas.slice(0, 2).map((idea, i) => (
                            <span 
                              key={i}
                              className="text-[10px] text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded truncate max-w-24"
                            >
                              {idea}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <Network className="h-16 w-16 text-violet-400/50 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Create Your Mind Map</h3>
                <p className="text-slate-400 text-sm mb-4 text-center max-w-xs">
                  Visualize your ideas and connect concepts<br/>for better persuasion
                </p>
                <button
                  onClick={generateMindMap}
                  disabled={isGeneratingMap}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-lg transition-colors"
                >
                  {isGeneratingMap ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Mind Map
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Mind Maps List (Bottom) */}
            {mindMaps.length > 1 && (
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1">
                {mindMaps.map((map) => (
                  <button
                    key={map.id}
                    onClick={() => {
                      setSelectedMap(map);
                      setMapTitle(map.title);
                      setCentralTopic(map.centralTopic);
                      setBranches(map.branches);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      selectedMap?.id === map.id
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {map.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL - Techniques & Analysis */}
          <div className="w-80 shrink-0 flex flex-col gap-4">
            {/* Techniques */}
            <div className="flex-1 bg-slate-800/60 border border-violet-500/20 rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-violet-500/20">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  <span className="text-white font-medium text-sm">Techniques</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                <div className="grid grid-cols-2 gap-2">
                  {PERSUASION_TECHNIQUES.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => toggleTechnique(tech.id)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        selectedTechniques.includes(tech.id)
                          ? 'border-violet-500 bg-violet-500/20'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div style={{ color: tech.color }}>{tech.icon}</div>
                        <span className="text-white text-xs font-medium">{tech.name}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 line-clamp-2">{tech.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-violet-500/20">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-violet-400" />
                  <span className="text-white font-medium text-sm">Analyze Content</span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <textarea
                  title="Enter your text"
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  placeholder="Paste content to analyze..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
                <button
                  title="Generate"
                  onClick={analyzeContent}
                  disabled={!analysisText.trim() || isAnalyzing}
                  className="w-full flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-xs transition-colors"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      Analyze
                    </>
                  )}
                </button>
                
                {analysisResult && (
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Persuasion Score</span>
                      <span className="text-white font-bold">{analysisResult.score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Conversion</span>
                      <span className="text-emerald-400 font-medium text-xs">{analysisResult.conversionPotential}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.techniques.map(tech => (
                        <span 
                          key={tech} 
                          className="px-1.5 py-0.5 rounded text-[9px]"
                          style={{ 
                            backgroundColor: `${PERSUASION_TECHNIQUES.find(t => t.id === tech)?.color}20`,
                            color: PERSUASION_TECHNIQUES.find(t => t.id === tech)?.color
                          }}
                        >
                          {PERSUASION_TECHNIQUES.find(t => t.id === tech)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <input title="Enter your text" placeholder="Enter your text here..." className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="mt-6 flex gap-2">
              <button title="Copy to clipboard" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                <BookOpen className="h-5 w-5" />
              </button>
              <button title="Clear text" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                <Target className="h-5 w-5" />
              </button>
              <button title="Generate AI content" className="p-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-slate-400 hover:text-white">
                <Brain className="h-5 w-5 text-violet-400" />
              </button>
            </div>
            <div className="mt-6">
              <input title="Generated content" placeholder="Generated content will appear here..." className="w-full p-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}