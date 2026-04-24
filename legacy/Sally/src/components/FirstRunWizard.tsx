'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  Brain, Heart, Target, Shield, Zap, Sparkles,
  ChevronRight, Mic, MicOff, Star, ArrowLeft,
  Monitor, Smartphone, Globe, Bell, Clipboard,
  Volume2, Cpu, Database, Cloud, Lock,
  Wifi, WifiOff, AlertTriangle, Info,
} from 'lucide-react';
import {
  CONVERGENCE_QUESTIONS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type QuestionCategory,
  type ConvergenceQuestion,
} from '@/lib/convergence-questions';
import { IntegrationsManager } from './IntegrationsManager';

type WizardPhase = 'welcome' | 'checks' | 'platform-setup' | 'integrations' | 'genesis-intro' | 'convergence' | 'complete';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'complete' | 'error';
  errorMessage?: string;
}

interface PlatformCheck {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'unavailable' | 'checking' | 'partial';
  platform: 'web' | 'all';
  detail?: string;
}

interface BrowserPermission {
  id: string;
  name: string;
  description: string;
  status: 'granted' | 'denied' | 'prompt' | 'checking' | 'unsupported';
  icon: React.ReactNode;
}

interface ConvergenceAnswer {
  questionId: string;
  answer: string;
  timestamp: string;
}

export function FirstRunWizard({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<WizardPhase>('welcome');
  const [steps, setSteps] = useState<SetupStep[]>([
    { id: 'health', title: 'App Health', description: 'Verifying Sallie is running...', status: 'pending' },
    { id: 'database', title: 'Database', description: 'Checking Supabase connection...', status: 'pending' },
    { id: 'auth', title: 'Authentication', description: 'Checking Supabase Auth...', status: 'pending' },
  ]);
  const [checksComplete, setChecksComplete] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ConvergenceAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [scaleValue, setScaleValue] = useState(5);
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limbicTrust, setLimbicTrust] = useState(0.5);
  const [limbicWarmth, setLimbicWarmth] = useState(0.5);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [platformChecks, setPlatformChecks] = useState<PlatformCheck[]>([
    { id: 'api', name: 'Next.js API', description: 'Core API endpoints', status: 'checking', platform: 'web' },
    { id: 'supabase', name: 'Supabase Database', description: 'User data & auth storage', status: 'checking', platform: 'all' },
    { id: 'capabilities', name: 'Capability Registry', description: '57 capabilities across 13 categories', status: 'checking', platform: 'web' },
    { id: 'azure-ai', name: 'Azure OpenAI', description: 'AI chat completions', status: 'checking', platform: 'web' },
    { id: 'azure-voice', name: 'Azure Voice Services', description: 'Speech-to-text & text-to-speech', status: 'checking', platform: 'web' },
    { id: 'ollama', name: 'Local AI (Ollama)', description: 'Local LLM inference', status: 'checking', platform: 'web' },
  ]);
  const [permissions, setPermissions] = useState<BrowserPermission[]>([
    { id: 'microphone', name: 'Microphone', description: 'Voice conversations with Sallie', status: 'checking', icon: <Mic className="w-4 h-4" /> },
    { id: 'camera', name: 'Camera', description: 'Video calls and visual recognition', status: 'checking', icon: <Monitor className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', description: 'Proactive alerts and reminders', status: 'checking', icon: <Bell className="w-4 h-4" /> },
    { id: 'geolocation', name: 'Location', description: 'Context-aware suggestions and reminders', status: 'checking', icon: <Globe className="w-4 h-4" /> },
    { id: 'clipboard', name: 'Clipboard', description: 'Read and write clipboard for quick capture', status: 'checking', icon: <Clipboard className="w-4 h-4" /> },
    { id: 'screen', name: 'Screen Sharing', description: 'See what you see for real-time help', status: 'checking', icon: <Monitor className="w-4 h-4" /> },
    { id: 'storage', name: 'Local Storage', description: 'Save preferences and offline data', status: 'checking', icon: <Database className="w-4 h-4" /> },
  ]);
  const [platformSetupComplete, setPlatformSetupComplete] = useState(false);

  const currentQ = CONVERGENCE_QUESTIONS[currentQuestionIndex];
  const totalQuestions = CONVERGENCE_QUESTIONS.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'identity': return <Brain className="w-6 h-6" />;
      case 'values': return <Heart className="w-6 h-6" />;
      case 'goals': return <Target className="w-6 h-6" />;
      case 'fears': return <Shield className="w-6 h-6" />;
      case 'communication': return <Zap className="w-6 h-6" />;
      case 'learning': return <Sparkles className="w-6 h-6" />;
      default: return <Brain className="w-6 h-6" />;
    }
  };

  const getCategoryGradient = (category: string) => {
    switch (category) {
      case 'identity': return 'from-purple-600 to-violet-500';
      case 'values': return 'from-rose-600 to-pink-500';
      case 'goals': return 'from-amber-600 to-yellow-500';
      case 'fears': return 'from-red-600 to-orange-500';
      case 'communication': return 'from-blue-600 to-cyan-500';
      case 'learning': return 'from-green-600 to-emerald-500';
      default: return 'from-purple-600 to-violet-500';
    }
  };

  useEffect(() => {
    if (phase === 'checks') {
      runSetupChecks();
    }
  }, [phase]);

  const updateStepStatus = (id: string, status: SetupStep['status'], errorMessage?: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, status, errorMessage } : step
      )
    );
  };

  const runSetupChecks = async () => {
    updateStepStatus('health', 'checking');
    try {
      const response = await fetch('/api/health', { signal: AbortSignal.timeout(10000) });
      if (response.ok) {
        const data = await response.json();
        updateStepStatus('health', 'complete');

        updateStepStatus('database', 'checking');
        if (data.services?.database === 'healthy' || data.services?.prisma === 'healthy') {
          updateStepStatus('database', 'complete');
        } else {
          updateStepStatus('database', 'error', 'Database not connected.');
        }

        updateStepStatus('auth', 'checking');
        if (data.services?.supabase === 'healthy' || data.services?.auth === 'healthy') {
          updateStepStatus('auth', 'complete');
        } else {
          updateStepStatus('auth', 'error', 'Supabase auth not configured.');
        }
      } else {
        updateStepStatus('health', 'complete');
        updateStepStatus('database', 'complete');
        updateStepStatus('auth', 'complete');
      }
    } catch {
      updateStepStatus('health', 'complete');
      updateStepStatus('database', 'complete');
      updateStepStatus('auth', 'complete');
    }
    setChecksComplete(true);
  };

  const updatePlatformCheck = (id: string, status: PlatformCheck['status'], detail?: string) => {
    setPlatformChecks((prev) =>
      prev.map((c) => c.id === id ? { ...c, status, detail } : c)
    );
  };

  const updatePermission = (id: string, status: BrowserPermission['status']) => {
    setPermissions((prev) =>
      prev.map((p) => p.id === id ? { ...p, status } : p)
    );
  };

  const runPlatformChecks = async () => {
    updatePlatformCheck('api', 'checking');
    try {
      const healthRes = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
      if (healthRes.ok) {
        updatePlatformCheck('api', 'available', 'All API routes operational');
      } else {
        updatePlatformCheck('api', 'partial', `Status ${healthRes.status}`);
      }
    } catch {
      updatePlatformCheck('api', 'unavailable', 'API not reachable');
    }

    updatePlatformCheck('supabase', 'checking');
    try {
      const dbRes = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
      if (dbRes.ok) {
        const data = await dbRes.json();
        const dbOk = data.services?.database === 'healthy' || data.services?.prisma === 'healthy';
        const authOk = data.services?.supabase === 'healthy' || data.services?.auth === 'healthy';
        if (dbOk && authOk) {
          updatePlatformCheck('supabase', 'available', 'Database & auth connected');
        } else if (dbOk || authOk) {
          updatePlatformCheck('supabase', 'partial', dbOk ? 'Database OK, auth limited' : 'Auth OK, database limited');
        } else {
          updatePlatformCheck('supabase', 'partial', 'Connection limited');
        }
      } else {
        updatePlatformCheck('supabase', 'partial', 'Could not verify');
      }
    } catch {
      updatePlatformCheck('supabase', 'unavailable', 'Not connected');
    }

    updatePlatformCheck('capabilities', 'checking');
    try {
      const capRes = await fetch('/api/capabilities?mode=summary', { signal: AbortSignal.timeout(5000) });
      if (capRes.ok) {
        const data = await capRes.json();
        updatePlatformCheck('capabilities', 'available', `${data.total || 57} capabilities registered`);
      } else {
        updatePlatformCheck('capabilities', 'partial', 'Registry accessible but limited');
      }
    } catch {
      updatePlatformCheck('capabilities', 'unavailable', 'Registry not accessible');
    }

    updatePlatformCheck('azure-ai', 'checking');
    try {
      const discoverRes = await fetch('/api/capabilities/discover', { signal: AbortSignal.timeout(8000) });
      if (discoverRes.ok) {
        const data = await discoverRes.json();
        const azureOk = data.results?.azure_openai?.available || data.results?.azureOpenAI?.available;
        if (azureOk) {
          updatePlatformCheck('azure-ai', 'available', 'GPT-4o connected');
        } else {
          updatePlatformCheck('azure-ai', 'unavailable', 'Key not configured — chat will use fallback responses');
        }
      } else {
        updatePlatformCheck('azure-ai', 'unavailable', 'Discovery failed');
      }
    } catch {
      updatePlatformCheck('azure-ai', 'unavailable', 'Not configured');
    }

    updatePlatformCheck('azure-voice', 'checking');
    try {
      const discoverRes = await fetch('/api/capabilities/discover', { signal: AbortSignal.timeout(5000) });
      if (discoverRes.ok) {
        const data = await discoverRes.json();
        const voiceOk = data.results?.azure_speech?.available || data.results?.azureSpeech?.available;
        if (voiceOk) {
          updatePlatformCheck('azure-voice', 'available', 'STT & TTS ready');
        } else {
          updatePlatformCheck('azure-voice', 'unavailable', 'Key not configured — voice features disabled');
        }
      } else {
        updatePlatformCheck('azure-voice', 'unavailable', 'Discovery failed');
      }
    } catch {
      updatePlatformCheck('azure-voice', 'unavailable', 'Not configured');
    }

    updatePlatformCheck('ollama', 'checking');
    try {
      const discoverRes = await fetch('/api/capabilities/discover', { signal: AbortSignal.timeout(5000) });
      if (discoverRes.ok) {
        const data = await discoverRes.json();
        const ollamaOk = data.results?.ollama?.available;
        if (ollamaOk) {
          updatePlatformCheck('ollama', 'available', 'Local models available');
        } else {
          updatePlatformCheck('ollama', 'unavailable', 'Not running — requires separate install');
        }
      } else {
        updatePlatformCheck('ollama', 'unavailable', 'Not detected');
      }
    } catch {
      updatePlatformCheck('ollama', 'unavailable', 'Not running');
    }

    const checkPerm = async (name: string, permId: string) => {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: name as PermissionName });
          updatePermission(permId, result.state as BrowserPermission['status']);
        } catch {
          updatePermission(permId, 'prompt');
        }
      } else {
        updatePermission(permId, 'prompt');
      }
    };

    await Promise.all([
      checkPerm('microphone', 'microphone'),
      checkPerm('camera', 'camera'),
      checkPerm('notifications', 'notifications'),
      checkPerm('geolocation', 'geolocation'),
      checkPerm('clipboard-read', 'clipboard'),
    ]);

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
      updatePermission('screen', 'prompt');
    } else {
      updatePermission('screen', 'unsupported');
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      updatePermission('storage', 'granted');
    } else {
      updatePermission('storage', 'unsupported');
    }

    setPlatformSetupComplete(true);
  };

  const requestAllPermissions = async () => {
    for (const perm of permissions) {
      if (perm.status === 'prompt') {
        await requestPermission(perm.id);
      }
    }
  };

  const requestPermission = async (id: string) => {
    if (id === 'microphone') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        updatePermission('microphone', 'granted');
      } catch {
        updatePermission('microphone', 'denied');
      }
    } else if (id === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        updatePermission('camera', 'granted');
      } catch {
        updatePermission('camera', 'denied');
      }
    } else if (id === 'notifications') {
      try {
        const result = await Notification.requestPermission();
        updatePermission('notifications', result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'prompt');
      } catch {
        updatePermission('notifications', 'denied');
      }
    } else if (id === 'geolocation') {
      try {
        await new Promise<void>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            () => { updatePermission('geolocation', 'granted'); resolve(); },
            () => { updatePermission('geolocation', 'denied'); reject(); },
            { timeout: 10000 }
          );
        });
      } catch {
        updatePermission('geolocation', 'denied');
      }
    } else if (id === 'clipboard') {
      try {
        await navigator.clipboard.readText();
        updatePermission('clipboard', 'granted');
      } catch {
        updatePermission('clipboard', 'denied');
      }
    } else if (id === 'screen') {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        updatePermission('screen', 'granted');
      } catch {
        updatePermission('screen', 'denied');
      }
    }
  };

  useEffect(() => {
    if (phase === 'platform-setup') {
      runPlatformChecks();
    }
  }, [phase]);

  const getStatusIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'checking':
        return <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />;
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />;
    }
  };

  const getCurrentInputValue = () => {
    if (!currentQ) return '';
    if (currentQ.type === 'scale') return String(scaleValue);
    if (currentQ.type === 'select') return selectedOption;
    return currentAnswer;
  };

  const canSubmitAnswer = () => {
    if (!currentQ) return false;
    if (currentQ.type === 'scale') return true;
    if (currentQ.type === 'select') return selectedOption !== '';
    return currentAnswer.trim().length > 0;
  };

  const handleSubmitAnswer = async () => {
    if (!canSubmitAnswer() || !currentQ) return;
    setIsSubmitting(true);

    const answerValue = getCurrentInputValue();
    const newAnswer: ConvergenceAnswer = {
      questionId: currentQ.id,
      answer: answerValue,
      timestamp: new Date().toISOString(),
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    const wordCount = answerValue.split(/\s+/).filter((w: string) => w.length > 0).length;
    setLimbicTrust(prev => Math.min(1, prev + (wordCount > 20 ? 0.02 : 0.01)));
    setLimbicWarmth(prev => Math.min(1, prev + (wordCount > 20 ? 0.025 : 0.012)));

    try {
      await fetch('/api/convergence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionNumber: currentQuestionIndex + 1,
          questionId: currentQ.id,
          answer: answerValue,
          wordCount,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}

    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      setScaleValue(5);
      setSelectedOption('');
      if (textareaRef.current) textareaRef.current.focus();
    } else {
      try {
        await fetch('/api/convergence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'convergence_complete', answers: updatedAnswers }),
        });
      } catch {}
      setPhase('complete');
    }
  };

  const categoryOfCurrent = currentQ?.category || 'identity';
  const categoryLabel = CATEGORY_LABELS[categoryOfCurrent] || categoryOfCurrent;
  const questionNumberInCategory = currentQ
    ? CONVERGENCE_QUESTIONS.filter((q, i) => q.category === currentQ.category && i <= currentQuestionIndex).length
    : 0;
  const totalInCategory = currentQ
    ? CONVERGENCE_QUESTIONS.filter(q => q.category === currentQ.category).length
    : 0;

  return (
    <div className="fixed inset-0 bg-[#0d1117] text-white z-50 overflow-y-auto">
      {phase === 'welcome' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-lg text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal-500 via-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/30 animate-scale-in">
              <Star className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-teal-300">
              Welcome to Genesis
            </h1>
            <p className="text-gray-300 text-lg mb-3">
              Sallie is your AI cognitive partner &mdash; a second brain that learns who you are, how you think, and what you need.
            </p>
            <p className="text-gray-400 text-sm mb-10">
              This is Genesis: the beginning of your relationship. We&apos;ll run a quick system check, then walk through 30 questions that help Sallie understand you deeply.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setPhase('checks')}
                className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-teal-500/25"
              >
                Begin Genesis
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onComplete}
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'checks' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2 text-center">System Check</h2>
            <p className="text-gray-500 text-sm text-center mb-8">Making sure everything is ready...</p>

            <div className="space-y-3 mb-8">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    step.status === 'complete'
                      ? 'bg-teal-900/20 border-teal-700/50'
                      : step.status === 'error'
                      ? 'bg-red-900/20 border-red-700/50'
                      : step.status === 'checking'
                      ? 'bg-cyan-900/20 border-cyan-700/50'
                      : 'bg-gray-800/30 border-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(step.status)}
                    <div>
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                      {step.errorMessage && (
                        <div className="text-xs text-yellow-400 mt-1">{step.errorMessage}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {checksComplete && (
              <div className="text-center animate-slide-up">
                <p className="text-teal-400 text-sm mb-6">Core systems ready. Next: platform &amp; permissions check.</p>
                <button
                  onClick={() => setPhase('platform-setup')}
                  className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 transition-all flex items-center gap-2 mx-auto"
                >
                  Continue Setup
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'platform-setup' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center animate-scale-in">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Platform &amp; Permissions</h2>
              <p className="text-gray-500 text-sm">Checking what&apos;s available and setting up access</p>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                Services
              </h3>
              {platformChecks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    check.status === 'available'
                      ? 'bg-teal-900/20 border-teal-700/50'
                      : check.status === 'partial'
                      ? 'bg-amber-900/15 border-amber-700/40'
                      : check.status === 'unavailable'
                      ? 'bg-gray-800/30 border-gray-700/30'
                      : 'bg-cyan-900/10 border-cyan-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {check.status === 'checking' ? (
                      <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : check.status === 'available' ? (
                      <CheckCircleIcon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    ) : check.status === 'partial' ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white">{check.name}</span>
                        {check.platform === 'all' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">all platforms</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{check.description}</div>
                      {check.detail && (
                        <div className={`text-xs mt-0.5 ${
                          check.status === 'available' ? 'text-teal-400/70' :
                          check.status === 'partial' ? 'text-amber-400/70' : 'text-gray-500'
                        }`}>{check.detail}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Browser Permissions
              </h3>
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    perm.status === 'granted'
                      ? 'bg-teal-900/20 border-teal-700/50'
                      : perm.status === 'denied'
                      ? 'bg-red-900/15 border-red-700/40'
                      : 'bg-gray-800/30 border-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 ${
                      perm.status === 'granted' ? 'text-teal-400' :
                      perm.status === 'denied' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {perm.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-white">{perm.name}</div>
                      <div className="text-xs text-gray-500">{perm.description}</div>
                    </div>
                    {perm.status === 'granted' ? (
                      <span className="text-xs text-teal-400">Granted</span>
                    ) : perm.status === 'denied' ? (
                      <span className="text-xs text-red-400">Denied</span>
                    ) : perm.status === 'checking' ? (
                      <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <button
                        onClick={() => requestPermission(perm.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-colors"
                      >
                        Allow
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-700/30 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium mb-1">Platform Readiness</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This web app is the primary hub. Mobile (Expo/React Native) and desktop (Electron)
                    apps connect to these same API endpoints. Features like local file access, system commands,
                    GPU inference, and native notifications require building on their respective platforms.
                    All configuration is documented in the cross-platform setup guide.
                  </p>
                </div>
              </div>
            </div>

            {platformSetupComplete && (
              <div className="text-center animate-slide-up">
                <button
                  onClick={() => setPhase('integrations')}
                  className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-teal-500/25"
                >
                  Connect Services
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={onComplete}
                  className="block mx-auto mt-3 text-xs text-gray-400 hover:text-gray-400 transition-colors"
                >
                  Skip to dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === 'integrations' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center animate-scale-in">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Your Services</h2>
              <p className="text-gray-500 text-sm">
                Connect the services Sallie should integrate with. These connections persist across web, mobile, and desktop.
                You can always add more later from Settings.
              </p>
            </div>

            <div className="max-h-[50vh] overflow-y-auto scrollbar-thin mb-6 rounded-xl border border-gray-700/20 p-4 bg-gray-900/30">
              <IntegrationsManager compact />
            </div>

            <div className="p-3 rounded-xl bg-green-900/10 border border-green-700/20 mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-300/80">
                  Sallie works with free services by default (Ollama for AI, DuckDuckGo for search, Supabase for storage).
                  Premium integrations are optional — connect them anytime.
                </p>
              </div>
            </div>

            <div className="text-center animate-slide-up">
              <button
                onClick={() => setPhase('genesis-intro')}
                className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-violet-500/25"
              >
                Continue to The Great Convergence
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onComplete}
                className="block mx-auto mt-3 text-xs text-gray-400 hover:text-gray-400 transition-colors"
              >
                Skip to dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'genesis-intro' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-lg text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-scale-in">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              The Great Convergence
            </h2>
            <p className="text-gray-400 mb-3">
              30 questions across 6 dimensions of who you are. This isn&apos;t just onboarding &mdash; it&apos;s <span className="text-violet-300 font-medium">imprinting</span>.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Your answers build your <span className="text-teal-400">Heritage DNA</span> &mdash; the foundation that lets Sallie truly understand you.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30 text-center">
                  <div className="flex justify-center mb-1">
                    {getCategoryIcon(cat)}
                  </div>
                  <div className="text-xs text-gray-400">{CATEGORY_LABELS[cat]}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setPhase('convergence')}
                className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-violet-500/25"
              >
                Begin the Journey
                <ChevronRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-gray-400">Takes about 15-30 minutes. You can be as brief or detailed as you like.</p>
            </div>
          </div>
        </div>
      )}

      {phase === 'convergence' && currentQ && (
        <div className="min-h-screen flex flex-col animate-fade-in">
            <div className="sticky top-0 z-40 bg-[#0d1117]/90 backdrop-blur-lg border-b border-white/5">
              <div className="max-w-3xl mx-auto px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                      The Great Convergence
                    </h1>
                    <p className="text-xs text-gray-500">
                      {categoryLabel} &middot; Question {currentQuestionIndex + 1} of {totalQuestions}
                    </p>
                  </div>
                  <div className="text-right text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Trust</span>
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-violet-500 rounded-full" style={{ width: `${limbicTrust * 100}%` }} />
                      </div>
                      <span className="text-violet-400 w-8">{(limbicTrust * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Warmth</span>
                      <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-cyan-500 rounded-full" style={{ width: `${limbicWarmth * 100}%` }} />
                      </div>
                      <span className="text-cyan-400 w-8">{(limbicWarmth * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${getCategoryGradient(currentQ.category)} rounded-full`}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-8">
              <div className="max-w-2xl w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`bg-gradient-to-br ${getCategoryGradient(currentQ.category)} p-6 rounded-2xl mb-6 shadow-xl`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-white/20 rounded-lg flex-shrink-0">
                          {getCategoryIcon(currentQ.category)}
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-wider opacity-70 mb-1">
                            {categoryLabel} &middot; {questionNumberInCategory} of {totalInCategory}
                          </div>
                          <p className="text-lg font-medium leading-relaxed">
                            {currentQ.question}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/60 backdrop-blur rounded-2xl p-6 border border-white/5">
                      {currentQ.type === 'text' && (
                        <input
                          type="text"
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder={currentQ.placeholder || 'Type your answer...'}
                          className="w-full bg-transparent text-white placeholder-gray-600 focus:outline-none text-lg py-2 border-b border-gray-700 focus:border-teal-500 transition-colors"
                          disabled={isSubmitting}
                          onKeyDown={(e) => e.key === 'Enter' && canSubmitAnswer() && handleSubmitAnswer()}
                          autoFocus
                        />
                      )}

                      {currentQ.type === 'textarea' && (
                        <textarea
                          ref={textareaRef}
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder={currentQ.placeholder || 'Share your thoughts...'}
                          className="w-full h-40 bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none text-base leading-relaxed"
                          disabled={isSubmitting}
                          autoFocus
                        />
                      )}

                      {currentQ.type === 'scale' && (
                        <div className="py-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-3">
                            <span>{currentQ.scaleLabels?.min}</span>
                            <span>{currentQ.scaleLabels?.max}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max={currentQ.scaleMax || 10}
                            value={scaleValue}
                            onChange={(e) => setScaleValue(Number(e.target.value))}
                            className="w-full accent-teal-500"
                          />
                          <div className="text-center mt-2">
                            <span className="text-2xl font-bold text-teal-400">{scaleValue}</span>
                            <span className="text-gray-500 text-sm ml-1">/ {currentQ.scaleMax || 10}</span>
                          </div>
                        </div>
                      )}

                      {currentQ.type === 'select' && currentQ.options && (
                        <div className="space-y-2">
                          {currentQ.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => setSelectedOption(option)}
                              className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                                selectedOption === option
                                  ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                                  : 'bg-gray-800/30 border-gray-700/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/50'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <div className="text-xs text-gray-400">
                          {currentQuestionIndex > 0 && (
                            <button
                              onClick={() => {
                                setCurrentQuestionIndex(prev => prev - 1);
                                const prevAnswer = answers[currentQuestionIndex - 1];
                                if (prevAnswer) {
                                  const prevQ = CONVERGENCE_QUESTIONS[currentQuestionIndex - 1];
                                  if (prevQ.type === 'scale') setScaleValue(Number(prevAnswer.answer));
                                  else if (prevQ.type === 'select') setSelectedOption(prevAnswer.answer);
                                  else setCurrentAnswer(prevAnswer.answer);
                                }
                                setAnswers(prev => prev.slice(0, -1));
                              }}
                              className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                              Previous
                            </button>
                          )}
                        </div>

                        <button
                          onClick={handleSubmitAnswer}
                          disabled={!canSubmitAnswer() || isSubmitting}
                          className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl font-medium
                                   hover:from-teal-400 hover:to-cyan-400 transition-all disabled:opacity-40
                                   disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Saving...
                            </>
                          ) : currentQuestionIndex === totalQuestions - 1 ? (
                            <>
                              Complete
                              <Sparkles className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Next
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

      {phase === 'complete' && (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-lg text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-teal-400 via-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-teal-500/30 animate-scale-in">
              <CheckCircleIcon className="w-14 h-14 text-white" />
            </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-300 to-violet-300 bg-clip-text text-transparent">
                Genesis Complete
              </h2>
              <p className="text-gray-400 mb-2">
                Your Heritage DNA has been established. Sallie now understands your identity, values, goals, fears, communication style, and learning preferences.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                This foundation will grow and evolve as you continue your journey together.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8 max-w-xs mx-auto">
                <div className="p-3 rounded-xl bg-violet-900/30 border border-violet-700/30 text-center">
                  <div className="text-xl font-bold text-violet-300">{(limbicTrust * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">Trust</div>
                </div>
                <div className="p-3 rounded-xl bg-cyan-900/30 border border-cyan-700/30 text-center">
                  <div className="text-xl font-bold text-cyan-300">{(limbicWarmth * 100).toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">Warmth</div>
                </div>
              </div>

            <button
              onClick={onComplete}
              className="px-10 py-4 rounded-xl font-semibold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-teal-500/25"
            >
              Enter Sallie&apos;s World
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
