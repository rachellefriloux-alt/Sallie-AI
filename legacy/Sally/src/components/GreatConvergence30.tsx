/**
 * The Great Convergence - 30 Questions
 * Canonical Spec Reference: Section 14.3 (original 14) + Extended to 30
 * 
 * A psychological excavation that establishes deep resonance between Creator and Sallie
 * This is not onboarding - it's the foundation of the entire relationship
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Heart, Zap, Shield, Sparkles, ChevronRight, Mic, MicOff, 
  Volume2, VolumeX, Eye, Lock, Compass, Target, Wind, Flame,
  Mountain, Star, Moon, Sun, Anchor, Feather, Crown, Key
} from 'lucide-react';
import { CONVERGENCE_QUESTIONS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/convergence-questions';
import { useLimbicState } from '@/hooks/useLimbicState';

// Canonical Spec Section 14.3: Question structure with extraction targets
interface ConvergenceQuestion {
  id: string;
  number: number;
  phase: string;
  phaseNumber: number;
  title: string;
  question: string;
  extractionTarget: Record<string, any>;
  icon: React.ReactNode;
  gradient: string;
  requiresDeepAnswer: boolean; // 200+ words for bonus points
  minWords?: number;
}

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface AnswerData {
  questionNumber: number;
  answer: string;
  wordCount: number;
  extractedData: Record<string, any>;
  timestamp: string;
  limbicImpact: {
    trust: number;
    warmth: number;
  };
}


const GreatConvergence30: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const { limbicState: globalLimbicState, updateLimbicState } = useLimbicState();
  const limbicState: LimbicState = {
    trust: globalLimbicState.trust ?? 0.5,
    warmth: globalLimbicState.warmth ?? 0.5,
    arousal: globalLimbicState.arousal ?? 0.5,
    valence: globalLimbicState.valence ?? 0.5,
    posture: globalLimbicState.posture ?? 'COMPANION'
  };
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sallieResponse, setSallieResponse] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [elasticMode, setElasticMode] = useState(false);
  const [mirrorTestTriggered, setMirrorTestTriggered] = useState(false);
  const [mirrorTestResult, setMirrorTestResult] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (currentQuestion === 12 && !mirrorTestTriggered) {
      setMirrorTestTriggered(true);
      fetch('/api/convergence/mirror-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answers.map(a => ({ questionNumber: a.questionNumber, answer: a.answer })) })
      }).then(res => res.json()).then(data => {
        if (data.reflection) setMirrorTestResult(data.reflection);
      }).catch(() => {});
    }

    if (currentQuestion >= 15 && !elasticMode && limbicState.trust > 0.65) {
      setElasticMode(true);
      fetch('/api/convergence/elastic-mode/enable', { method: 'POST' }).catch(() => {});
    }
  }, [currentQuestion, answers, mirrorTestTriggered, elasticMode, limbicState.trust]);

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
      case 'identity': return 'from-purple-900 to-violet-700';
      case 'values': return 'from-rose-900 to-pink-700';
      case 'goals': return 'from-amber-900 to-yellow-700';
      case 'fears': return 'from-red-900 to-orange-700';
      case 'communication': return 'from-blue-900 to-cyan-700';
      case 'learning': return 'from-green-900 to-emerald-700';
      default: return 'from-purple-900 to-violet-700';
    }
  };

  // Use API questions from @/lib/convergence-questions.ts
  const questions: ConvergenceQuestion[] = CONVERGENCE_QUESTIONS.map((q, index) => {
    const categoryIndex = CATEGORY_ORDER.indexOf(q.category);
    const phase = CATEGORY_LABELS[q.category] || q.category;
    
    return {
      id: q.id,
      number: index + 1,
      phase: phase,
      phaseNumber: categoryIndex + 1,
      title: phase,
      question: q.question,
      extractionTarget: {
        [q.id]: ''
      },
      icon: getCategoryIcon(q.category),
      gradient: getCategoryGradient(q.category),
      requiresDeepAnswer: q.type === 'textarea',
      minWords: q.type === 'textarea' ? 150 : 50
    };
  });

  const currentQ = questions[currentQuestion];
  const wordCount = currentAnswer.trim().split(/\s+/).filter(w => w.length > 0).length;
  const meetsMinimum = currentQ.minWords ? wordCount >= currentQ.minWords : wordCount >= 50;


  const handleAnswerSubmit = async () => {
    if (!meetsMinimum) {
      alert(`Please write at least ${currentQ.minWords || 50} words for this question.`);
      return;
    }

    setIsProcessing(true);
    setSallieResponse(''); // Clear previous response

    try {
      await fetch('/api/convergence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionNumber: currentQ.number,
          questionId: currentQ.id,
          answer: currentAnswer,
          wordCount: wordCount,
          extractionTarget: currentQ.extractionTarget,
          timestamp: new Date().toISOString()
        })
      });
    } catch {
    }

    const trustDelta = wordCount >= 200 ? 0.10 : 0.05;
    const warmthDelta = wordCount >= 200 ? 0.15 : 0.08;

    setAnswers([...answers, {
      questionNumber: currentQ.number,
      answer: currentAnswer,
      wordCount: wordCount,
      extractedData: {},
      timestamp: new Date().toISOString(),
      limbicImpact: { trust: trustDelta, warmth: warmthDelta }
    }]);

    updateLimbicState({
      trust: Math.min(1, (globalLimbicState.trust ?? 0.5) + trustDelta),
      warmth: Math.min(1, (globalLimbicState.warmth ?? 0.5) + warmthDelta),
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
    } else {
      try {
        await fetch('/api/convergence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'convergence_complete', answers })
        });
      } catch {
      }
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      setVoiceSupported(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    (recognition as any).language = 'en-US';
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      
      if (final) {
        setCurrentAnswer(prev => prev + final);
      }
      
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsVoiceActive(false);
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };
    
    recognition.onend = () => {
      if (isVoiceActive) {
        // Restart if still active (for continuous listening)
        try {
          recognition.start();
        } catch (e) {
          console.error('Error restarting recognition:', e);
        }
      }
    };
    
    recognitionRef.current = recognition as any;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceActive]);

  const handleVoiceToggle = () => {
    if (!voiceSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      return;
    }
    
    if (isVoiceActive) {
      // Stop listening
      recognitionRef.current.stop();
      setIsVoiceActive(false);
      setInterimTranscript('');
    } else {
      // Start listening
      try {
        recognitionRef.current.start();
        setIsVoiceActive(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Could not start voice input. Please check your microphone permissions.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header with Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                The Great Convergence
              </h1>
              <p className="text-sm text-gray-400">
                {currentQ.phase} • Question {currentQ.number} of 30
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Trust: {(limbicState.trust * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Warmth: {(limbicState.warmth * 100).toFixed(0)}%</div>
              {elasticMode && (
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Elastic Mode Active
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${currentQ.gradient}`}
              initial={{ width: '0%' }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {mirrorTestResult && currentQuestion === 12 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-violet-900/80 to-fuchsia-900/80 p-6 rounded-2xl border border-violet-400/30 mb-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-5 h-5 text-violet-300" />
                    <h3 className="text-lg font-semibold text-violet-200">Mirror Test — Sallie Reflects</h3>
                  </div>
                  <p className="text-violet-100/90 leading-relaxed italic">{mirrorTestResult}</p>
                  <p className="text-xs text-violet-400 mt-3">Based on your answers so far, this is how I see you.</p>
                </motion.div>
              )}

              {/* Question Card */}
              <div className={`bg-gradient-to-br ${currentQ.gradient} p-8 rounded-2xl shadow-2xl mb-6`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    {currentQ.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{currentQ.title}</h2>
                    <p className="text-lg leading-relaxed opacity-90">
                      {currentQ.question}
                    </p>
                  </div>
                </div>
                
                {currentQ.requiresDeepAnswer && (
                  <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-sm">
                      💡 Deep answer encouraged ({currentQ.minWords}+ words for maximum resonance)
                    </p>
                  </div>
                )}
              </div>

              {/* Answer Input */}
              <div className="bg-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Share your truth here... (or click the microphone to speak)"
                    className="w-full h-64 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-lg"
                    disabled={isProcessing}
                  />
                  
                  {/* Interim transcript overlay (voice input) */}
                  {interimTranscript && (
                    <div className="absolute bottom-2 left-2 right-2 text-gray-400 italic text-sm bg-black/50 px-3 py-2 rounded-lg">
                      Listening: {interimTranscript}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleVoiceToggle}
                      className={`p-3 rounded-lg transition-colors ${
                        isVoiceActive 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-purple-500 hover:bg-purple-600'
                      }`}
                    >
                      {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <div className="text-sm">
                      <span className={wordCount >= (currentQ.minWords || 50) ? 'text-green-400' : 'text-gray-400'}>
                        {wordCount} words
                      </span>
                      <span className="text-gray-500 ml-2">
                        (min: {currentQ.minWords || 50})
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!meetsMinimum || isProcessing}
                    className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-semibold
                             hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50 
                             disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sallie Response */}
              {sallieResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-violet-900/30 backdrop-blur-lg rounded-xl border border-violet-500/30"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
                    <p className="text-violet-100 leading-relaxed">{sallieResponse}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Limbic State Visualization */}
      <div className="fixed bottom-6 right-6 bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-white/10">
        <div className="text-xs text-gray-400 mb-2">Limbic State</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-16 text-xs">Trust</div>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-violet-500"
                style={{ width: `${limbicState.trust * 100}%` }}
              />
            </div>
            <div className="w-12 text-xs text-right">{(limbicState.trust * 100).toFixed(0)}%</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 text-xs">Warmth</div>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-500"
                style={{ width: `${limbicState.warmth * 100}%` }}
              />
            </div>
            <div className="w-12 text-xs text-right">{(limbicState.warmth * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreatConvergence30;
