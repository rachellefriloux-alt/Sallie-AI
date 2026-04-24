'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Target, 
  FileText, 
  Zap, 
  CheckCircle, 
  Clock, 
  Play, 
  Plus, 
  Search,
  Settings,
  BarChart3,
  Palette,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  TrendingUp,
  Shield,
  RefreshCw
} from 'lucide-react';

type ContentType = 'blog_post' | 'social_media' | 'email' | 'article' | 'product_description' | 'ad_copy' | 'landing_page' | 'video_script' | 'newsletter';
type BrandVoice = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful' | 'sophisticated' | 'minimalist' | 'energetic';
type WorkflowStep = 'research' | 'outline' | 'draft' | 'review' | 'optimize' | 'validate' | 'publish';

interface Workflow {
  id: string;
  name: string;
  contentType: ContentType;
  title: string;
  brandVoice: BrandVoice;
  steps: { id: WorkflowStep; name: string; description?: string; status: 'pending' | 'in_progress' | 'completed'; output?: any }[];
  currentStep: number;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  content?: string;
}

interface BrandGuideline {
  id: string;
  name: string;
  voice: BrandVoice;
  tone: string[];
  vocabulary: string[];
}

const CONTENT_TYPES: { value: ContentType; label: string; description: string }[] = [
  { value: 'blog_post', label: 'Blog Post', description: 'In-depth articles for your audience' },
  { value: 'social_media', label: 'Social Media', description: 'Posts for social platforms' },
  { value: 'email', label: 'Email', description: 'Newsletters and email campaigns' },
  { value: 'article', label: 'Article', description: 'Professional articles' },
  { value: 'product_description', label: 'Product Description', description: 'E-commerce product copy' },
  { value: 'ad_copy', label: 'Ad Copy', description: 'Advertising content' },
  { value: 'landing_page', label: 'Landing Page', description: 'High-conversion landing pages' },
  { value: 'video_script', label: 'Video Script', description: 'Video content scripts' },
  { value: 'newsletter', label: 'Newsletter', description: 'Email newsletters' },
];

const BRAND_VOICES: { value: BrandVoice; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'playful', label: 'Playful' },
  { value: 'sophisticated', label: 'Sophisticated' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'energetic', label: 'Energetic' },
];

const WORKFLOW_STEPS: { id: WorkflowStep; name: string; description: string }[] = [
  { id: 'research', name: 'Research & Planning', description: 'Research topic and gather information' },
  { id: 'outline', name: 'Content Outline', description: 'Create structured outline' },
  { id: 'draft', name: 'Content Draft', description: 'Generate initial draft' },
  { id: 'review', name: 'Content Review', description: 'Review and refine content' },
  { id: 'optimize', name: 'Optimization', description: 'SEO and performance optimization' },
  { id: 'validate', name: 'Validation', description: 'Fact-check and validate' },
  { id: 'publish', name: 'Publish', description: 'Finalize and prepare for publishing' },
];

export default function MeliAIPage() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'create' | 'templates' | 'brand'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // New workflow form
  const [newTitle, setNewTitle] = useState('');
  const [newContentType, setNewContentType] = useState<ContentType>('blog_post');
  const [newBrandVoice, setNewBrandVoice] = useState<BrandVoice>('professional');
  const [newRequirements, setNewRequirements] = useState('');

  const callAI = async (prompt: string): Promise<string> => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, context: 'meli-ai' }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI request failed');
    return data.reply;
  };

  const getStepPrompt = (step: WorkflowStep, workflow: Workflow): string => {
    const contentLabel = CONTENT_TYPES.find(c => c.value === workflow.contentType)?.label || workflow.contentType;
    const voiceNote = `Use a ${workflow.brandVoice} brand voice.`;
    const prevOutputs = workflow.steps
      .filter(s => s.status === 'completed' && s.output)
      .map(s => `[${s.name}]: ${s.output}`)
      .join('\n\n');
    const context = prevOutputs ? `\n\nPrevious workflow outputs:\n${prevOutputs}` : '';

    switch (step) {
      case 'research':
        return `Research the topic thoroughly: "${workflow.title}". Provide key findings, statistics, trends, and relevant information that would help create a compelling ${contentLabel}. ${voiceNote}${context}`;
      case 'outline':
        return `Create a detailed outline for a ${contentLabel} about: "${workflow.title}". Include sections, key points, and structure. ${voiceNote}${context}`;
      case 'draft':
        return `Write a complete ${contentLabel} about: "${workflow.title}". ${voiceNote}${context}`;
      case 'review':
        return `Review and improve the following ${contentLabel} draft. Identify areas for improvement, suggest edits, and provide a refined version. ${voiceNote}${context}`;
      case 'optimize':
        return `Optimize the following ${contentLabel} for SEO and engagement. Add meta descriptions, suggest keywords, improve readability, and enhance calls to action. ${voiceNote}${context}`;
      case 'validate':
        return `Fact-check and validate the following ${contentLabel}. Verify claims, check for consistency, grammar, and ensure the content is accurate and ready for publishing. ${voiceNote}${context}`;
      case 'publish':
        return `Prepare the following ${contentLabel} for publishing. Create a final polished version with proper formatting, a compelling headline, and a summary. ${voiceNote}${context}`;
      default:
        return `Process the next step for: "${workflow.title}". ${voiceNote}${context}`;
    }
  };

  const createWorkflow = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);
    
    try {
      const newWorkflow: Workflow = {
        id: `workflow_${Date.now()}`,
        name: `${CONTENT_TYPES.find(c => c.value === newContentType)?.label} Creation`,
        contentType: newContentType,
        title: newTitle,
        brandVoice: newBrandVoice,
        steps: WORKFLOW_STEPS.map((step, i) => ({
          ...step,
          status: i === 0 ? 'in_progress' : 'pending'
        })),
        currentStep: 0,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      };
      
      setWorkflows([newWorkflow, ...workflows]);
      setNewTitle('');
      setNewRequirements('');
      setActiveTab('workflows');
      setSelectedWorkflow(newWorkflow);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const executeStep = async (workflowId: string, stepIndex: number) => {
    setIsExecuting(true);
    
    try {
      const workflow = workflows.find(wf => wf.id === workflowId);
      if (!workflow) return;

      const stepId = workflow.steps[stepIndex].id;
      const prompt = getStepPrompt(stepId, workflow);
      const aiOutput = await callAI(prompt);

      setWorkflows(prev => prev.map(wf => {
        if (wf.id !== workflowId) return wf;
        
        const updatedSteps = wf.steps.map((step, i) => {
          if (i === stepIndex) return { ...step, status: 'completed' as const, output: aiOutput };
          if (i === stepIndex + 1) return { ...step, status: 'in_progress' as const };
          return step;
        });
        
        const isComplete = stepIndex + 1 >= wf.steps.length;
        
        const updated = {
          ...wf,
          steps: updatedSteps,
          currentStep: isComplete ? wf.steps.length : stepIndex + 1,
          status: (isComplete ? 'completed' : 'in_progress') as Workflow['status'],
          content: isComplete ? aiOutput : wf.content,
        };
        
        setSelectedWorkflow(updated);
        return updated;
      }));
    } catch (error) {
      console.error('Failed to execute step:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-violet-500/20 bg-black/20 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20">
        <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          <span className="text-white font-semibold">Meli AI</span>
        </div>
        <div className="w-16" />
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-violet-500/20 bg-black/10">
        <div className="flex justify-center">
          <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg">
            {(['workflows', 'create', 'templates', 'brand'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab === 'workflows' ? 'Workflows' : tab === 'create' ? 'Create' : tab === 'templates' ? 'Templates' : 'Brand'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Content Workflows</h2>
                  <p className="text-slate-400">Manage your step-by-step content creation workflows</p>
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Workflow
                </button>
              </div>

              {workflows.length === 0 ? (
                <div className="text-center py-16 bg-slate-800/50 rounded-xl border border-violet-500/20">
                  <Target className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No workflows yet</h3>
                  <p className="text-slate-400 mb-4">Create your first content workflow</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg"
                  >
                    Create Workflow
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                          <p className="text-sm text-slate-400">{workflow.title}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          workflow.status === 'completed' 
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : workflow.status === 'in_progress'
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {workflow.status}
                        </span>
                      </div>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                          <span>Progress</span>
                          <span>{Math.round((workflow.currentStep / workflow.steps.length) * 100)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-violet-500 transition-all"
                            style={{ width: `${(workflow.currentStep / workflow.steps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Steps preview */}
                      <div className="flex gap-2 flex-wrap">
                        {workflow.steps.map((step, i) => (
                          <span 
                            key={step.id}
                            className={`px-2 py-1 rounded text-xs ${
                              step.status === 'completed' 
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : step.status === 'in_progress'
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'bg-slate-700 text-slate-500'
                            }`}
                          >
                            {step.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Create New Workflow</h2>
                <p className="text-slate-400">Set up a step-by-step content creation workflow</p>
              </div>
              
              <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Title / Topic</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter your content topic..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CONTENT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setNewContentType(type.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          newContentType === type.value
                            ? 'border-violet-500 bg-violet-500/20'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-white font-medium text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Brand Voice */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Brand Voice</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {BRAND_VOICES.map((voice) => (
                      <button
                        key={voice.value}
                        onClick={() => setNewBrandVoice(voice.value)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          newBrandVoice === voice.value
                            ? 'border-violet-500 bg-violet-500/20'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-white font-medium text-sm">{voice.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Additional Requirements</label>
                  <textarea
                    value={newRequirements}
                    onChange={(e) => setNewRequirements(e.target.value)}
                    placeholder="Any specific requirements, keywords, or guidelines..."
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <button
                  onClick={createWorkflow}
                  disabled={!newTitle.trim() || isCreating}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Create Workflow
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Content Templates</h2>
                <p className="text-slate-400">Pre-built workflow templates for different content types</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CONTENT_TYPES.map((type) => (
                  <div key={type.value} className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6 hover:border-violet-500/40 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-violet-500/20">
                        <FileText className="h-6 w-6 text-violet-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{type.label}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{type.description}</p>
                    <div className="space-y-2">
                      {WORKFLOW_STEPS.slice(0, 4).map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm text-slate-500">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          {step.name}
                        </div>
                      ))}
                      <div className="text-sm text-violet-400">+{WORKFLOW_STEPS.length - 4} more steps</div>
                    </div>
                    <button
                      onClick={() => {
                        setNewContentType(type.value);
                        setActiveTab('create');
                      }}
                      className="mt-4 w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Tab */}
          {activeTab === 'brand' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Brand Voice Guidelines</h2>
                <p className="text-slate-400">Manage your brand voice for consistent content</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {BRAND_VOICES.map((voice) => (
                  <div key={voice.value} className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Palette className="h-6 w-6 text-violet-400" />
                      <h3 className="text-lg font-semibold text-white">{voice.label}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                      {voice.value === 'professional' && 'Formal, business-appropriate language with industry terminology'}
                      {voice.value === 'casual' && 'Relaxed, conversational tone that feels approachable'}
                      {voice.value === 'friendly' && 'Warm, inviting language that builds connections'}
                      {voice.value === 'authoritative' && 'Confident, expert voice that establishes credibility'}
                      {voice.value === 'playful' && 'Fun, energetic language that entertains'}
                      {voice.value === 'sophisticated' && 'Elegant, refined language for高端 audiences'}
                      {voice.value === 'minimalist' && 'Clean, simple language with no unnecessary words'}
                      {voice.value === 'energetic' && 'Dynamic, passionate language that motivates'}
                    </p>
                    <button className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                      Configure →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Detail Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-violet-500/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-violet-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedWorkflow.name}</h3>
                  <p className="text-slate-400">{selectedWorkflow.title}</p>
                </div>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {selectedWorkflow.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      step.status === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : step.status === 'in_progress'
                        ? 'bg-violet-500/10 border-violet-500/30'
                        : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">{step.name}</h4>
                          <p className="text-sm text-slate-400">{step.description}</p>
                        </div>
                        {(step.status === 'pending' || step.status === 'in_progress') && (
                          <button
                            onClick={() => executeStep(selectedWorkflow.id, index)}
                            disabled={isExecuting || (step.status === 'pending' && index !== selectedWorkflow.currentStep)}
                            className="shrink-0 ml-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            {isExecuting && step.status === 'in_progress' ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                            ) : step.status === 'in_progress' ? 'Continue' : 'Start'}
                          </button>
                        )}
                      </div>
                      {step.output && step.status === 'completed' && (
                        <div className="mt-3 p-3 bg-slate-900/60 rounded-lg max-h-40 overflow-y-auto">
                          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{step.output}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedWorkflow.content && (
                <div className="mt-6 p-4 bg-slate-900 rounded-xl">
                  <h4 className="font-semibold text-white mb-2">Generated Content</h4>
                  <p className="text-slate-300">{selectedWorkflow.content}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}