'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useLimbicStore } from '@/store/useLimbicStore';
import { motion, AnimatePresence } from 'framer-motion';
import { SallieAvatar } from '@/components/SallieAvatarAnimated';
import { SallieAvatar3D } from '@/components/SallieAvatar3DLoader';
import {
  Phone, Video, Mic, Send, X, Minimize2,
  Volume2, VolumeX, MicOff, VideoOff,
  PhoneOff, Plus, Smile, MoreVertical,
  MonitorUp, Circle, Share2, WifiOff,
} from 'lucide-react';
import { useProactiveNudges, hasSessionNudgeBeenSent, markSessionNudgeSent } from '@/hooks/useProactiveNudges';
import { useDeviceAccess } from '@/hooks/useDeviceAccess';

const API_BASE = '/api';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'sallie';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'voice' | 'system';
}

type ViewMode = 'chat' | 'voice-call' | 'video-call';

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatCallTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function shouldShowTimestamp(current: ChatMessage, previous?: ChatMessage) {
  if (!previous) return true;
  return current.timestamp.getTime() - previous.timestamp.getTime() > 300000;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] text-white font-bold">S</span>
      </div>
      <div className="bg-[#2a2a3e] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, showAvatar }: { message: ChatMessage; showAvatar: boolean }) {
  const isUser = message.sender === 'user';
  const statusIcons: Record<string, string> = {
    sending: '\u23F3',
    sent: '\u2713',
    delivered: '\u2713\u2713',
    read: '\u2713\u2713',
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-[10px] text-gray-500 bg-white/5 px-3 py-1 rounded-full">{message.text}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 px-4 py-0.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && showAvatar ? (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
          <span className="text-[10px] text-white font-bold">S</span>
        </div>
      ) : !isUser ? (
        <div className="w-6 flex-shrink-0" />
      ) : null}
      <div
        className={`max-w-[75%] px-3 py-2 ${
          isUser
            ? 'bg-gradient-to-br from-[#0084ff] to-[#0066cc] text-white rounded-2xl rounded-br-md'
            : 'bg-[#2a2a3e] text-gray-100 rounded-2xl rounded-bl-md'
        }`}
      >
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
        <div className={`flex items-center gap-1 mt-0.5 ${isUser ? 'justify-end' : ''}`}>
          <span className={`text-[10px] ${isUser ? 'text-blue-200/60' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </span>
          {isUser && (
            <span className={`text-[10px] ${message.status === 'read' ? 'text-blue-300' : 'text-blue-200/40'}`}>
              {statusIcons[message.status]}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingGhostAvatar() {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hey! I'm right here whenever you need me. What's on your mind?",
      sender: 'sallie',
      timestamp: new Date(),
      status: 'read',
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const limbic = useLimbicStore((s) => s.state);
  const { nudges: proactiveNudges } = useProactiveNudges();
  const deviceAccess = useDeviceAccess();
  const proactiveInjectedRef = useRef(false);

  useEffect(() => {
    if (
      proactiveNudges.length > 0 &&
      !proactiveInjectedRef.current &&
      !hasSessionNudgeBeenSent()
    ) {
      const nudge = proactiveNudges[0];
      proactiveInjectedRef.current = true;
      markSessionNudgeSent();
      const proactiveMsg: ChatMessage = {
        id: `proactive-${nudge.id}`,
        text: `${nudge.title}\n${nudge.message}`,
        sender: 'sallie',
        timestamp: new Date(),
        status: 'read',
        type: 'text',
      };
      setMessages(prev => [...prev, proactiveMsg]);
      if (!expanded) setUnreadCount(c => c + 1);
    }
  }, [proactiveNudges, expanded]);

  const limbicForAvatar = useMemo(() => ({
    trust: limbic.trust,
    warmth: limbic.warmth,
    arousal: limbic.arousal,
    valence: limbic.valence,
    curiosity: 0.5,
    creativity: 0.7,
    autonomy: 0.4,
    energy: limbic.arousal,
    loyalty: 0.8,
    focus: 0.6,
  }), [limbic.trust, limbic.warmth, limbic.arousal, limbic.valence]);

  const status = useMemo(() => {
    if (limbic.arousal > 0.6 && limbic.valence > 0.5) return 'Active';
    if (limbic.arousal > 0.4) return 'Thinking';
    return 'Online';
  }, [limbic.arousal, limbic.valence]);

  const statusColor = status === 'Active' ? '#22c55e' : status === 'Thinking' ? '#eab308' : '#22c55e';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [inputText]);

  useEffect(() => {
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const playTTS = useCallback(async (text: string) => {
    if (!ttsEnabled) return;
    try {
      const res = await fetch(`${API_BASE}/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'en-US-JennyNeural', style: 'gentle' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
        audio.onended = () => URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('TTS failed:', err);
    }
  }, [ttsEnabled]);

  const sendMessage = useCallback(async (text: string, type: 'text' | 'voice' = 'text') => {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'delivered' as const } : m));
    }, 300);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), role: 'COMPANION' }),
      });

      setIsTyping(false);

      if (res.ok) {
        const data = await res.json();
        const sallieMsg: ChatMessage = {
          id: `s-${Date.now()}`,
          text: data.reply || "I'm here, just gathering my thoughts...",
          sender: 'sallie',
          timestamp: new Date(),
          status: 'read',
          type: 'text',
        };
        setMessages(prev => [
          ...prev.map(m => m.id === userMsg.id ? { ...m, status: 'read' as const } : m),
          sallieMsg,
        ]);

        if (!expanded) setUnreadCount(c => c + 1);
        playTTS(data.reply);
      } else {
        const errData = await res.json().catch(() => ({ error: 'Connection failed' }));
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          text: errData.error || "I couldn't connect right now. Try again?",
          sender: 'sallie',
          timestamp: new Date(),
          status: 'read',
          type: 'system',
        }]);
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        text: "Network hiccup. I'm still here though.",
        sender: 'sallie',
        timestamp: new Date(),
        status: 'read',
        type: 'system',
      }]);
    } finally {
      setIsSending(false);
    }
  }, [isSending, expanded, playTTS]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  }, [inputText, sendMessage]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const res = await fetch(`${API_BASE}/voice/stt`, {
            method: 'POST',
            headers: { 'Content-Type': 'audio/webm' },
            body: blob,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.text?.trim()) {
              sendMessage(data.text, 'voice');
            }
          }
        } catch (err) {
          console.error('STT failed:', err);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
    }
  }, [sendMessage]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const startVoiceCall = useCallback(async () => {
    setViewMode('voice-call');
    setCallTime(0);
    setTtsEnabled(true);
    callTimerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    const stream = await deviceAccess.requestMicrophone();
    if (stream) {
      streamRef.current = stream;
    } else {
      console.error('Mic access denied for voice call');
    }
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      text: 'Voice call started',
      sender: 'sallie',
      timestamp: new Date(),
      status: 'read',
      type: 'system',
    }]);
  }, [deviceAccess]);

  const startVideoCall = useCallback(async () => {
    setViewMode('video-call');
    setCallTime(0);
    setTtsEnabled(true);
    callTimerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    const stream = await deviceAccess.requestCamera({ video: true, audio: true });
    if (stream) {
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } else {
      console.error('Camera access denied');
    }
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      text: 'Video call started',
      sender: 'sallie',
      timestamp: new Date(),
      status: 'read',
      type: 'system',
    }]);
  }, [deviceAccess]);

  const endCall = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    setIsCamOff(false);
    setIsMuted(false);
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      text: `Call ended \u2022 ${formatCallTime(callTime)}`,
      sender: 'sallie',
      timestamp: new Date(),
      status: 'read',
      type: 'system',
    }]);
    setViewMode('chat');
    setCallTime(0);
  }, [callTime]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (screenRef.current) {
          screenRef.current.srcObject = stream;
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share denied:', err);
      }
    }
  }, [isScreenSharing]);

  const handleShareChat = useCallback(async () => {
    const chatText = messages
      .filter(m => m.type !== 'system')
      .map(m => `${m.sender === 'user' ? 'You' : 'Sallie'}: ${m.text}`)
      .join('\n');
    const shared = await deviceAccess.shareContent({
      title: 'Chat with Sallie',
      text: chatText,
    });
    if (!shared) {
      await deviceAccess.copyToClipboard(chatText);
    }
  }, [messages, deviceAccess]);

  const quickEmojis = ['\u2764\uFE0F', '\uD83D\uDE02', '\uD83D\uDC4D', '\uD83D\uDE0D', '\uD83D\uDE22', '\uD83D\uDD25', '\u2728', '\uD83D\uDE4F'];

  const handleOpen = () => {
    setExpanded(true);
    setUnreadCount(0);
  };

  const handleMinimize = useCallback(() => {
    if (viewMode !== 'chat') {
      endCall();
    }
    setExpanded(false);
  }, [viewMode, endCall]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleOpen}
            className="relative w-16 h-16 rounded-full focus:outline-none group"
            aria-label="Open Sallie Chat"
          >
            <motion.div
              className="absolute -inset-2 rounded-full opacity-70"
              style={{
                background: `radial-gradient(circle, ${statusColor}60, transparent 70%)`,
                filter: 'blur(10px)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex items-center justify-center" style={{ boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 2px ${statusColor}50, 0 0 20px ${statusColor}30` }}>
              <SallieAvatar limbicState={limbicForAvatar} size="sm" showAura={false} interactive={false} className="!w-full !h-full" />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0d1117]"
              style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}80` }}
            />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -left-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="messenger"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-[380px] h-[560px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,168,150,0.15)',
            }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]" style={{ background: 'linear-gradient(135deg, #1e1e36, #1a2540)' }}>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center">
                  <SallieAvatar3D limbicState={limbicForAvatar} size="sm" isThinking={isTyping} isSpeaking={ttsEnabled && !isTyping} isListening={isRecording} interactive={false} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1e1e36]" style={{ backgroundColor: deviceAccess.online ? statusColor : '#6b7280' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-white">Sallie</h3>
                  {!deviceAccess.online && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-600/50 text-gray-300 font-medium flex items-center gap-0.5">
                      <WifiOff className="w-2.5 h-2.5" />
                      Offline
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">{deviceAccess.online ? status : 'Offline'}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleShareChat} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-white/[0.06] transition-all" title="Share Chat">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={startVoiceCall} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-white/[0.06] transition-all" title="Voice Call">
                  <Phone className="w-4 h-4" />
                </button>
                <button onClick={startVideoCall} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-white/[0.06] transition-all" title="Video Call">
                  <Video className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute right-0 top-10 w-48 rounded-xl overflow-hidden border border-white/[0.08] z-50"
                        style={{ background: '#1e1e36' }}
                      >
                        <button
                          onClick={() => { setTtsEnabled(!ttsEnabled); setShowMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] transition-colors"
                        >
                          {ttsEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          {ttsEnabled ? 'Mute Voice' : 'Enable Voice'}
                        </button>
                        <button
                          onClick={() => { setMessages([{ id: 'welcome', text: "Fresh start! What's up?", sender: 'sallie', timestamp: new Date(), status: 'read', type: 'text' }]); setShowMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06] transition-colors"
                        >
                          <Circle className="w-4 h-4" />
                          New Chat
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button onClick={handleMinimize} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all" title="Minimize">
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-white/5" onClick={() => { setShowMenu(false); setShowEmojiPicker(false); }}>
                  {messages.map((msg, i) => (
                    <div key={msg.id}>
                      {shouldShowTimestamp(msg, messages[i - 1]) && (
                        <div className="text-center py-2">
                          <span className="text-[10px] text-gray-500">
                            {msg.timestamp.toLocaleDateString() === new Date().toLocaleDateString()
                              ? formatTime(msg.timestamp)
                              : msg.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + formatTime(msg.timestamp)
                            }
                          </span>
                        </div>
                      )}
                      <MessageBubble
                        message={msg}
                        showAvatar={msg.sender === 'sallie' && (i === 0 || messages[i - 1]?.sender !== 'sallie')}
                      />
                    </div>
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-white/[0.08] px-3 py-2" style={{ background: '#1a1a2e' }}>
                  <AnimatePresence>
                    {showEmojiPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex gap-2 pb-2 flex-wrap"
                      >
                        {quickEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => { setInputText(prev => prev + emoji); setShowEmojiPicker(false); }}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.08] flex items-center justify-center text-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-end gap-1.5">
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-teal-400 hover:bg-white/[0.06] transition-all flex-shrink-0" title="Attach">
                      <Plus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0 bg-[#2a2a3e] rounded-2xl px-3 py-1.5 flex items-end gap-2">
                      <textarea
                        ref={textareaRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Aa"
                        rows={1}
                        className="flex-1 bg-transparent border-none outline-none resize-none text-[13px] text-white placeholder-gray-500 max-h-[100px] leading-snug py-0.5"
                      />
                    </div>
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-yellow-400 hover:bg-white/[0.06] transition-all flex-shrink-0"
                      title="Emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {inputText.trim() ? (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => sendMessage(inputText)}
                        disabled={isSending}
                        className="w-8 h-8 rounded-full bg-[#0084ff] flex items-center justify-center text-white hover:bg-[#0073e6] transition-colors flex-shrink-0 disabled:opacity-50"
                        title="Send"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                          isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'text-gray-400 hover:text-teal-400 hover:bg-white/[0.06]'
                        }`}
                        title="Hold to record"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {viewMode === 'voice-call' && (
              <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ background: 'radial-gradient(ellipse at center, rgba(0,168,150,0.08) 0%, transparent 70%)' }}>
                <motion.div
                  className="relative mb-6"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute -inset-4 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,168,150,0.25), transparent 70%)' }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -inset-8 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(0,168,150,0.15), transparent 70%)' }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0.05, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <div className="w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(0,168,150,0.3)' }}>
                    <SallieAvatar3D limbicState={limbicForAvatar} size="md" isSpeaking={true} isListening={!isMuted} interactive={false} />
                  </div>
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-1">Sallie</h3>
                <p className="text-sm text-teal-400 mb-8">{formatCallTime(callTime)}</p>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      const newMuted = !isMuted;
                      setIsMuted(newMuted);
                      if (streamRef.current) {
                        streamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
                      }
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      !isSpeakerOn ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={endCall}
                    className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-8 w-full">
                  <div className="flex items-end gap-2 bg-white/[0.04] rounded-xl px-3 py-2">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type while on call..."
                      rows={1}
                      className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-white placeholder-gray-500"
                    />
                    {inputText.trim() && (
                      <button onClick={() => sendMessage(inputText)} className="text-teal-400 hover:text-teal-300 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'video-call' && (
              <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: '#0a0a1a' }}>
                <div className="flex-1 flex items-center justify-center relative">
                  {isScreenSharing ? (
                    <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                  ) : (
                    <div className="relative">
                      <motion.div
                        className="absolute -inset-6 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(0,168,150,0.2), transparent 70%)' }}
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="w-40 h-52 rounded-2xl overflow-hidden flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(0,168,150,0.25)' }}>
                        <SallieAvatar3D limbicState={limbicForAvatar} size="lg" isSpeaking={true} isListening={!isMuted} interactive={false} />
                      </div>
                    </div>
                  )}

                  {!isCamOff && (
                    <div className="absolute top-3 right-3 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/20" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-sm font-medium text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {formatCallTime(callTime)}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4 py-4 px-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                  <button
                    onClick={() => {
                      const newMuted = !isMuted;
                      setIsMuted(newMuted);
                      if (streamRef.current) {
                        streamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
                      }
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isMuted ? 'bg-red-500/30 text-red-400' : 'bg-white/[0.12] text-white hover:bg-white/[0.18]'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      const newCamOff = !isCamOff;
                      setIsCamOff(newCamOff);
                      if (streamRef.current) {
                        streamRef.current.getVideoTracks().forEach(t => { t.enabled = !newCamOff; });
                      }
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isCamOff ? 'bg-red-500/30 text-red-400' : 'bg-white/[0.12] text-white hover:bg-white/[0.18]'
                    }`}
                  >
                    {isCamOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleScreenShare}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      isScreenSharing ? 'bg-teal-500/30 text-teal-400' : 'bg-white/[0.12] text-white hover:bg-white/[0.18]'
                    }`}
                  >
                    <MonitorUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={endCall}
                    className="w-13 h-11 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors px-5"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {showMenu && expanded && <div className="fixed inset-0 z-[9998]" onClick={() => setShowMenu(false)} />}
    </div>
  );
}

export default FloatingGhostAvatar;
