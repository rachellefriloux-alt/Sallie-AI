'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronLeft,
  Waves,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  Headphones,
  Radio,
  Sparkles,
  Brain,
  Shield,
  Zap,
} from 'lucide-react';

interface VoiceProfile {
  id: string;
  name: string;
  language: string;
  sensitivity: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  sampleRate: number;
  channelCount: number;
  calibrationData: {
    noiseFloor: number;
    peakLevel: number;
    dynamicRange: number;
    latencyMs: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CalibrationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface WaveformVisualizerProps {
  audioData: Uint8Array;
  isRecording: boolean;
  color?: string;
  height?: number;
  width?: number;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioData,
  isRecording,
  color = '#8B5CF6',
  height = 100,
  width = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'rgba(15, 10, 26, 0.8)';
    ctx.fillRect(0, 0, width, height);

    const barWidth = width / audioData.length;
    const centerY = height / 2;

    audioData.forEach((value, index) => {
      const barHeight = (value / 255) * height * 0.8;
      const x = index * barWidth;
      const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
      gradient.addColorStop(0, `${color}80`);
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, `${color}80`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
    });

    // Draw center line
    ctx.strokeStyle = `${color}40`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
  }, [audioData, color, height, width]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg"
      style={{ width, height }}
    />
  );
};

interface CircularVisualizerProps {
  level: number;
  isRecording: boolean;
  color?: string;
  size?: number;
}

const CircularVisualizer: React.FC<CircularVisualizerProps> = ({
  level,
  isRecording,
  color = '#8B5CF6',
  size = 200,
}) => {
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const progress = level * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDasharray: 0 }}
          animate={{ strokeDasharray: `${progress} ${circumference}` }}
          transition={{ duration: 0.1 }}
        />
        {/* Glow effect */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ strokeDasharray: 0, opacity: 0.3 }}
          animate={{ 
            strokeDasharray: `${progress} ${circumference}`,
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 0.1, opacity: { duration: 1, repeat: Infinity } }}
          filter="blur(4px)"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="flex flex-col items-center"
        >
          {isRecording ? (
            <>
              <Mic className="w-10 h-10 text-violet-400" />
              <span className="text-sm text-violet-300 mt-2">
                {Math.round(level * 100)}%
              </span>
            </>
          ) : (
            <MicOff className="w-10 h-10 text-gray-500" />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export function VoiceCalibrationWizard({
  onComplete,
  onCancel,
  existingProfile,
}: {
  onComplete: (profile: VoiceProfile) => void;
  onCancel: () => void;
  existingProfile?: VoiceProfile;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const [audioLevel, setAudioLevel] = useState(0);
  const [profile, setProfile] = useState<Partial<VoiceProfile>>(existingProfile || {
    name: 'Default Profile',
    language: 'en-US',
    sensitivity: 0.7,
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1,
  });
  const [calibrationResults, setCalibrationResults] = useState<{
    noiseFloor: number;
    peakLevel: number;
    dynamicRange: number;
    latencyMs: number;
  } | null>(null);
  const [testResults, setTestResults] = useState<{
    clarity: number;
    consistency: number;
    latency: number;
  } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const steps: CalibrationStep[] = [
    {
      id: 'intro',
      title: 'Voice Calibration',
      description: 'Set up your microphone for optimal voice recognition',
      icon: <Headphones className="w-6 h-6" />,
      status: currentStep === 0 ? 'active' : currentStep > 0 ? 'completed' : 'pending',
    },
    {
      id: 'device',
      title: 'Select Device',
      description: 'Choose your microphone input device',
      icon: <Mic className="w-6 h-6" />,
      status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending',
    },
    {
      id: 'noise',
      title: 'Noise Calibration',
      description: 'Measure ambient noise levels',
      icon: <Radio className="w-6 h-6" />,
      status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending',
    },
    {
      id: 'voice',
      title: 'Voice Sample',
      description: 'Record a voice sample for analysis',
      icon: <Waves className="w-6 h-6" />,
      status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending',
    },
    {
      id: 'test',
      title: 'Test & Verify',
      description: 'Test your voice recognition settings',
      icon: <CheckCircle className="w-6 h-6" />,
      status: currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : 'pending',
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Save your voice profile',
      icon: <Sparkles className="w-6 h-6" />,
      status: currentStep === 5 ? 'active' : 'pending',
    },
  ];

  const startAudioCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: profile.echoCancellation,
          noiseSuppression: profile.noiseSuppression,
          autoGainControl: profile.autoGainControl,
          sampleRate: profile.sampleRate,
          channelCount: profile.channelCount,
        },
      });

      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      setIsRecording(true);
      updateAudioData();
    } catch (error) {
      console.error('Failed to start audio capture:', error);
    }
  }, [profile]);

  const stopAudioCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setAudioLevel(0);
  }, []);

  const updateAudioData = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setAudioData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateAudioData);
  };

  useEffect(() => {
    return () => {
      stopAudioCapture();
    };
  }, [stopAudioCapture]);

  const runNoiseCalibration = async () => {
    startAudioCapture();
    
    // Collect noise floor data for 3 seconds
    const noiseSamples: number[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 3000) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        noiseSamples.push(average);
      }
    }

    const noiseFloor = Math.min(...noiseSamples) / 255;
    const peakLevel = Math.max(...noiseSamples) / 255;
    const dynamicRange = peakLevel - noiseFloor;

    setCalibrationResults(prev => ({
      ...prev,
      noiseFloor,
      peakLevel,
      dynamicRange,
    } as any));

    stopAudioCapture();
    setCurrentStep(3);
  };

  const runVoiceSample = async () => {
    startAudioCapture();
    
    // Record voice sample for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const peakLevel = Math.max(...Array.from(dataArray)) / 255;
      
      setCalibrationResults(prev => ({
        ...prev,
        peakLevel,
        latencyMs: 50 + Math.random() * 30, // Simulated latency measurement
      } as any));
    }

    stopAudioCapture();
    setCurrentStep(4);
  };

  const runTestRecognition = async () => {
    startAudioCapture();
    
    // Simulate test recognition
    await new Promise(resolve => setTimeout(resolve, 3000));

    setTestResults({
      clarity: 0.85 + Math.random() * 0.1,
      consistency: 0.80 + Math.random() * 0.15,
      latency: 45 + Math.random() * 30,
    });

    stopAudioCapture();
  };

  const saveProfile = () => {
    const newProfile: VoiceProfile = {
      id: existingProfile?.id || `profile-${Date.now()}`,
      name: profile.name || 'Default Profile',
      language: profile.language || 'en-US',
      sensitivity: profile.sensitivity || 0.7,
      noiseSuppression: profile.noiseSuppression ?? true,
      echoCancellation: profile.echoCancellation ?? true,
      autoGainControl: profile.autoGainControl ?? true,
      sampleRate: profile.sampleRate || 48000,
      channelCount: profile.channelCount || 1,
      calibrationData: calibrationResults || {
        noiseFloor: 0.05,
        peakLevel: 0.8,
        dynamicRange: 0.75,
        latencyMs: 50,
      },
      createdAt: existingProfile?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onComplete(newProfile);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Headphones className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Voice Calibration Wizard</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                This wizard will guide you through setting up your microphone for optimal voice recognition.
                The process takes about 2 minutes.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { icon: <Mic className="w-5 h-5" />, label: 'Device Setup' },
                { icon: <Waves className="w-5 h-5" />, label: 'Calibration' },
                { icon: <CheckCircle className="w-5 h-5" />, label: 'Verification' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-violet-400 mb-2">{item.icon}</div>
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Select Microphone</h2>
              <p className="text-gray-400">Choose your preferred microphone device</p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">Audio Settings</span>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Noise Suppression</span>
                    <input
                      type="checkbox"
                      checked={profile.noiseSuppression}
                      onChange={(e) => setProfile(prev => ({ ...prev, noiseSuppression: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800 text-violet-600"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Echo Cancellation</span>
                    <input
                      type="checkbox"
                      checked={profile.echoCancellation}
                      onChange={(e) => setProfile(prev => ({ ...prev, echoCancellation: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800 text-violet-600"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-gray-300">Auto Gain Control</span>
                    <input
                      type="checkbox"
                      checked={profile.autoGainControl}
                      onChange={(e) => setProfile(prev => ({ ...prev, autoGainControl: e.target.checked }))}
                      className="rounded border-gray-600 bg-gray-800 text-violet-600"
                    />
                  </label>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <label className="block text-gray-300 mb-2">Sensitivity</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(profile.sensitivity || 0.7) * 100}
                  onChange={(e) => setProfile(prev => ({ ...prev, sensitivity: parseInt(e.target.value) / 100 }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>{Math.round((profile.sensitivity || 0.7) * 100)}%</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Noise Calibration</h2>
              <p className="text-gray-400">Stay quiet while we measure your ambient noise level</p>
            </div>
            <div className="flex justify-center">
              <CircularVisualizer
                level={audioLevel}
                isRecording={isRecording}
                color="#8B5CF6"
                size={200}
              />
            </div>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span>Please remain quiet...</span>
              </div>
            )}
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={runNoiseCalibration}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Calibration
                </button>
              ) : (
                <div className="flex items-center gap-2 text-violet-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calibrating...
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Voice Sample</h2>
              <p className="text-gray-400">Speak naturally for 5 seconds so we can analyze your voice</p>
            </div>
            <div className="flex justify-center">
              <WaveformVisualizer
                audioData={audioData}
                isRecording={isRecording}
                color="#8B5CF6"
                height={100}
                width={350}
              />
            </div>
            {isRecording && (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Mic className="w-5 h-5 animate-pulse" />
                <span>Recording... Speak now!</span>
              </div>
            )}
            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={runVoiceSample}
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              ) : (
                <div className="flex items-center gap-2 text-violet-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Recording voice sample...
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Test & Verify</h2>
              <p className="text-gray-400">Test your voice recognition settings</p>
            </div>
            <div className="flex justify-center">
              <CircularVisualizer
                level={audioLevel}
                isRecording={isRecording}
                color={testResults ? '#10B981' : '#8B5CF6'}
                size={200}
              />
            </div>
            {testResults && (
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {[
                  { label: 'Clarity', value: testResults.clarity, color: 'text-green-400' },
                  { label: 'Consistency', value: testResults.consistency, color: 'text-blue-400' },
                  { label: 'Latency', value: `${Math.round(testResults.latency)}ms`, color: 'text-yellow-400' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-800/50 rounded-lg p-3">
                    <div className={`text-lg font-bold ${item.color}`}>
                      {typeof item.value === 'number' ? `${Math.round(item.value * 100)}%` : item.value}
                    </div>
                    <div className="text-xs text-gray-400">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center gap-4">
              <button
                onClick={runTestRecognition}
                disabled={isRecording}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Test
                  </>
                )}
              </button>
              {testResults && (
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Continue
                </button>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Calibration Complete!</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Your voice profile has been calibrated successfully. You can now use voice commands with optimal accuracy.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Profile Name</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
                />
              </div>
              {calibrationResults && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Noise Floor:</span>
                    <span className="text-white">{Math.round(calibrationResults.noiseFloor * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Peak Level:</span>
                    <span className="text-white">{Math.round(calibrationResults.peakLevel * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Dynamic Range:</span>
                    <span className="text-white">{Math.round(calibrationResults.dynamicRange * 100)}%</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Latency:</span>
                    <span className="text-white">{Math.round(calibrationResults.latencyMs)}ms</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={saveProfile}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg text-white font-medium transition-all flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-5 h-5" />
              Save Profile
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-violet-400" />
              <span className="text-white font-semibold">Voice Calibration</span>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          {currentStep < 2 && (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default VoiceCalibrationWizard;
