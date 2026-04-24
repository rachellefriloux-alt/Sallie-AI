'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCalibrationWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

type WizardStep = 'welcome' | 'mic-test' | 'voice-recognition' | 'voice-selection' | 'tts-test' | 'complete';

const STEPS: WizardStep[] = ['welcome', 'mic-test', 'voice-recognition', 'voice-selection', 'tts-test', 'complete'];

const STEP_LABELS: Record<WizardStep, string> = {
  'welcome': 'Welcome',
  'mic-test': 'Microphone',
  'voice-recognition': 'Recognition',
  'voice-selection': 'Voice',
  'tts-test': 'Preview',
  'complete': 'Complete',
};

interface VoiceOption {
  id: string;
  label: string;
  description: string;
  azureVoice: string;
}

const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'warm-alto',
    label: 'Warm Alto',
    description: 'A warm, rich voice with depth and comfort',
    azureVoice: 'en-US-JennyNeural',
  },
  {
    id: 'gentle-soprano',
    label: 'Gentle Soprano',
    description: 'A light, gentle voice with clarity and warmth',
    azureVoice: 'en-US-AriaNeural',
  },
  {
    id: 'confident-mezzo',
    label: 'Confident Mezzo',
    description: 'A confident, balanced voice with presence',
    azureVoice: 'en-US-SaraNeural',
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function VoiceCalibrationWizard({ onComplete, onSkip }: VoiceCalibrationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const [direction, setDirection] = useState(1);
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [micError, setMicError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);
  const [sttLoading, setSttLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICE_OPTIONS[0]);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentStepIndex = STEPS.indexOf(currentStep);

  const goToStep = useCallback((step: WizardStep) => {
    const newIndex = STEPS.indexOf(step);
    const oldIndex = STEPS.indexOf(currentStep);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setCurrentStep(step);
  }, [currentStep]);

  const nextStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      goToStep(STEPS[idx + 1]);
    }
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      goToStep(STEPS[idx - 1]);
    }
  }, [currentStep, goToStep]);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [cleanupAudio]);

  const requestMicPermission = useCallback(async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission('granted');

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      drawWaveform();
      updateVolume();
    } catch (err) {
      setMicPermission('denied');
      setMicError(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access was denied. Please allow microphone access in your browser settings.'
          : 'Could not access the microphone. Please check your device settings.'
      );
    }
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#818cf8');
        gradient.addColorStop(1, '#6366f1');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    draw();
  }, []);

  const updateVolume = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
      setVolumeLevel(Math.min(average / 128, 1));
      requestAnimationFrame(update);
    };

    update();
  }, []);

  const startRecording = useCallback(async () => {
    if (!streamRef.current) return;
    setIsRecording(true);
    setTranscription(null);
    setSttError(null);
    chunksRef.current = [];

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm',
    });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setIsRecording(false);
      setSttLoading(true);

      try {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        const response = await fetch('/api/voice/stt', {
          method: 'POST',
          body: await audioBlob.arrayBuffer(),
          headers: {
            'Content-Type': 'audio/wav',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Speech recognition failed');
        }

        const result = await response.json();
        setTranscription(result.text || 'No speech detected');
      } catch (err) {
        setSttError(
          err instanceof Error ? err.message : 'Failed to process speech. Please try again.'
        );
      } finally {
        setSttLoading(false);
      }
    };

    mediaRecorder.start();

    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 4000);
  }, []);

  const playTTS = useCallback(async () => {
    setTtsLoading(true);
    setTtsError(null);
    setTtsPlaying(false);

    try {
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Hello, I'm Sallie. Your voice interface is ready.",
          voice: selectedVoice.azureVoice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Voice synthesis failed');
      }

      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setTtsPlaying(true);
      audio.onended = () => {
        setTtsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setTtsPlaying(false);
        setTtsError('Failed to play audio');
        URL.revokeObjectURL(url);
      };

      await audio.play();
    } catch (err) {
      setTtsError(
        err instanceof Error ? err.message : 'Failed to generate speech. Please try again.'
      );
    } finally {
      setTtsLoading(false);
    }
  }, [selectedVoice]);

  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-300 ${
              index < currentStepIndex
                ? 'bg-indigo-500 text-white'
                : index === currentStepIndex
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {index < currentStepIndex ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 transition-all duration-300 ${
                index < currentStepIndex ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderWelcome = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
        <span className="text-4xl">🎙️</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Let&apos;s set up your voice interface</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          We&apos;ll walk through a quick setup to calibrate your microphone and choose Sallie&apos;s speaking voice.
          This only takes a minute.
        </p>
      </div>
      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={onSkip}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );

  const renderMicTest = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Microphone Test</h2>
        <p className="text-slate-400 text-sm">
          Let&apos;s make sure your microphone is working properly.
        </p>
      </div>

      {micPermission === 'pending' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <button
            onClick={requestMicPermission}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Enable Microphone
          </button>
        </div>
      )}

      {micPermission === 'denied' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm">{micError}</p>
          <button
            onClick={requestMicPermission}
            className="px-6 py-2.5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {micPermission === 'granted' && (
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="w-full h-[120px] rounded-lg bg-slate-900/50 border border-slate-700/50"
          />
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Volume Level</span>
              <span>{Math.round(volumeLevel * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: volumeLevel > 0.7
                    ? 'linear-gradient(90deg, #22c55e, #ef4444)'
                    : volumeLevel > 0.3
                    ? 'linear-gradient(90deg, #22c55e, #eab308)'
                    : 'linear-gradient(90deg, #22c55e, #22c55e)',
                }}
                animate={{ width: `${volumeLevel * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
          <p className="text-center text-sm text-emerald-400">
            ✓ Microphone is working! Try speaking to see the waveform.
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (micPermission !== 'granted') {
              nextStep();
            } else {
              nextStep();
            }
          }}
          disabled={micPermission !== 'granted'}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderVoiceRecognition = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Voice Recognition Test</h2>
        <p className="text-slate-400 text-sm">
          Say a short phrase and we&apos;ll transcribe it to make sure everything works.
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-center space-y-4">
        <p className="text-slate-300 text-sm italic">
          Try saying: &quot;Hello Sallie, how are you today?&quot;
        </p>

        <button
          onClick={startRecording}
          disabled={isRecording || sttLoading}
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/25'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
          } disabled:opacity-50`}
        >
          {sttLoading ? (
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <p className="text-xs text-slate-500">
          {isRecording ? 'Recording... (4 seconds)' : sttLoading ? 'Processing...' : 'Tap to record'}
        </p>
      </div>

      {transcription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
        >
          <p className="text-xs text-emerald-400 mb-1">Transcription:</p>
          <p className="text-white font-medium">&quot;{transcription}&quot;</p>
        </motion.div>
      )}

      {sttError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <p className="text-red-400 text-sm">{sttError}</p>
        </motion.div>
      )}

      <div className="flex gap-3 justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderVoiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Choose Sallie&apos;s Voice</h2>
        <p className="text-slate-400 text-sm">
          Pick the voice that feels most comfortable for you.
        </p>
      </div>

      <div className="space-y-3">
        {VOICE_OPTIONS.map((voice) => (
          <button
            key={voice.id}
            onClick={() => setSelectedVoice(voice)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedVoice.id === voice.id
                ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/30'
                : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedVoice.id === voice.id ? 'border-indigo-500' : 'border-slate-500'
                }`}
              >
                {selectedVoice.id === voice.id && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{voice.label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{voice.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderTTSTest = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Preview Sallie&apos;s Voice</h2>
        <p className="text-slate-400 text-sm">
          Listen to Sallie speak with the <span className="text-indigo-400">{selectedVoice.label}</span> voice.
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          {ttsPlaying ? (
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-white rounded-full"
                  animate={{ height: [8, 20, 8] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          ) : (
            <span className="text-3xl">🗣️</span>
          )}
        </div>

        <p className="text-slate-300 text-sm italic">
          &quot;Hello, I&apos;m Sallie. Your voice interface is ready.&quot;
        </p>

        <button
          onClick={playTTS}
          disabled={ttsLoading || ttsPlaying}
          className="px-8 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2"
        >
          {ttsLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </>
          ) : ttsPlaying ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75a.75.75 0 01-.75-.75V6a.75.75 0 011.5 0v12a.75.75 0 01-.75.75z" />
              </svg>
              Playing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Play Preview
            </>
          )}
        </button>
      </div>

      {ttsError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
        >
          <p className="text-red-400 text-sm">{ttsError}</p>
        </motion.div>
      )}

      <div className="flex gap-3 justify-between pt-4">
        <button
          onClick={prevStep}
          className="px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-12 h-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Voice calibration complete!</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Your voice interface is ready. Sallie will use the <span className="text-indigo-400">{selectedVoice.label}</span> voice
          when speaking with you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <button
          onClick={onComplete}
          className="px-8 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-500/25"
        >
          Start Using Sallie
        </button>
      </motion.div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'mic-test':
        return renderMicTest();
      case 'voice-recognition':
        return renderVoiceRecognition();
      case 'voice-selection':
        return renderVoiceSelection();
      case 'tts-test':
        return renderTTSTest();
      case 'complete':
        return renderComplete();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {renderProgressIndicator()}

        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl shadow-black/20 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          {STEP_LABELS[currentStep]} · Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}

export default VoiceCalibrationWizard;
