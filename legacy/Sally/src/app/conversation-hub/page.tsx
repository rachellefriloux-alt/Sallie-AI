'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, Search, MoreVertical, Network } from 'lucide-react';
import { ConversationHub } from '@/components/conversation/ConversationHub';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { useAvatarState } from '@/hooks/useAvatarState';

const VOICE_BARS = [40, 70, 35, 90, 55, 80, 45, 65, 95, 30, 75, 50, 85];

export default function ConversationHubPage() {
  const { avatarId } = useAvatarState();
  const [micMuted, setMicMuted] = useState(false);
  const [videoCallActive, setVideoCallActive] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex flex-col">
      <header className="shrink-0 flex items-center justify-between border-b border-violet-500/20 px-6 py-4 bg-black/20 backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-violet-300 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="hidden md:flex items-center gap-2 size-8 bg-violet-500/20 rounded-lg text-violet-400 justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <h1 className="text-xl font-bold text-white">Sallie AI</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/life-management" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Life Management
          </Link>
          <Link href="/growth" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Growth
          </Link>
          <Link href="/mind-map" className="text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
            <Network className="h-3 w-3" />
            Mind Map
          </Link>
          <Link href="/copy-mind" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            CopyMind
          </Link>
          <Link href="/meli-ai" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Meli AI
          </Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full overflow-hidden">
        <section className="flex flex-col gap-4 w-full lg:w-[380px] shrink-0 h-full overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Conversation Hub</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
              </span>
              <p className="text-violet-400 text-sm font-bold">Sallie is Online • Listening</p>
            </div>
          </div>

          <div className="relative w-full aspect-video lg:aspect-[4/3] bg-slate-800/80 rounded-2xl overflow-hidden border border-violet-500/20 group">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-32 rounded-full border-4 border-violet-500/30 p-1 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <AvatarDisplay size="xl" mood="attentive" interactive />
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-end">
              <span className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-1 text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                <Mic className="h-3.5 w-3.5 text-violet-400" />
                High Fidelity
              </span>
              <button
                onClick={() => setVideoCallActive(!videoCallActive)}
                className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm shadow-lg shadow-violet-500/20 transition-all"
              >
                <Video className="h-5 w-5" />
                Video Call
              </button>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-4 flex justify-around items-center">
            <button onClick={() => setMicMuted(!micMuted)} className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className={`p-3 rounded-full transition-colors ${micMuted ? 'bg-slate-700 text-slate-400' : 'bg-violet-500/20 text-violet-400 group-hover:bg-violet-500 group-hover:text-white'}`}>
                {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white">{micMuted ? 'Muted' : 'Unmuted'}</span>
            </button>
            <button className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="p-3 rounded-full bg-slate-700 text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                <VideoOff className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white">Camera Off</span>
            </button>
            <button className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="p-3 rounded-full bg-slate-700 text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                <Monitor className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white">Share</span>
            </button>
            <Link href="/mind-map" className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="p-3 rounded-full bg-slate-700 text-slate-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                <Network className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white">Mind Map</span>
            </Link>
            <button className="flex flex-col items-center gap-1 group cursor-pointer">
              <div className="p-3 rounded-full bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <PhoneOff className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-white">End</span>
            </button>
          </div>

          <div className="bg-slate-800/60 border border-violet-500/20 rounded-xl p-6 flex flex-col gap-4 flex-1 min-h-[180px]">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-base font-bold">Voice Activity</p>
                <p className="text-slate-400 text-xs">Real-time analysis</p>
              </div>
              <span className="px-2 py-1 bg-violet-500/20 text-violet-400 text-[10px] uppercase font-bold rounded">Live</span>
            </div>
            <div className="flex-1 w-full flex items-end gap-1 h-28">
              {VOICE_BARS.map((val, i) => (
                <div key={i} className="flex-1 bg-violet-500/30 hover:bg-violet-500/50 rounded-t transition-all min-w-[4px]" style={{ height: `${val}%` }} />
              ))}
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col bg-slate-800/40 rounded-2xl border border-violet-500/20 overflow-hidden shadow-2xl min-h-[500px]">
          <div className="p-4 border-b border-violet-500/20 flex justify-between items-center bg-slate-900/50 backdrop-blur z-10">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-violet-500 rounded-full shadow-[0_0_10px_rgb(139,92,246)]" />
              <span className="text-sm font-medium text-white">Live Session</span>
            </div>
            <div className="flex items-center gap-2">
              <button aria-label="Search session" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button aria-label="More options" className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-[400px] overflow-hidden">
            <ConversationHub className="rounded-none border-0 shadow-none bg-transparent h-full" />
          </div>
        </section>
      </div>
    </main>
  );
}
