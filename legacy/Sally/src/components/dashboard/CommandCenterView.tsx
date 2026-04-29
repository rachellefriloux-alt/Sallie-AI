'use client';

import Link from 'next/link';
import { Calendar, Zap, Brain, ChevronRight } from 'lucide-react';

const AGENDA = [
  { title: 'Board Meeting Prep', time: '10:00 AM', duration: '45m' },
  { title: 'Pick up Leo', time: '03:15 PM', sub: 'School' },
  { title: 'Yoga Session', time: '06:00 PM', sub: 'Home' },
];

export function CommandCenterView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Agenda & Insight */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-violet-500/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Upcoming</h3>
            <button aria-label="Open calendar" className="text-violet-400 hover:text-white transition-colors">
              <Calendar className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="space-y-4">
            {AGENDA.map((item, i) => (
              <div key={i} className="flex gap-3 relative">
                {i < AGENDA.length - 1 && (
                  <div className="absolute left-[5px] top-2 bottom-[-20px] w-0.5 bg-violet-500/20" />
                )}
                <div className="w-3 h-3 rounded-full bg-violet-500 mt-1.5 shrink-0 z-10 ring-4 ring-slate-900" />
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">
                    {item.time}
                    {item.duration && ` • ${item.duration}`}
                    {item.sub && ` • ${item.sub}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 to-slate-900/50 rounded-xl p-5 border border-violet-500/30 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl group-hover:bg-violet-500/30 transition-all duration-500" />
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-violet-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Daily Insight</h3>
          </div>
          <p className="text-white font-medium leading-relaxed relative z-10">
            Your productivity peaks between 9 AM and 11 AM. I&apos;ve blocked this time for deep work tomorrow.
          </p>
          <div className="flex gap-2 mt-4">
            <button className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg text-white transition-colors">
              Accept
            </button>
            <button className="text-xs text-slate-400 hover:text-white px-3 py-1.5 transition-colors">Dismiss</button>
          </div>
        </div>
      </div>

      {/* Center: Quick stats & Links */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="flex gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/80 border border-violet-500/20">
            <Brain className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Memory</p>
              <p className="text-sm font-bold text-white">+12% Growth</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/80 border border-violet-500/20">
            <Zap className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Energy</p>
              <p className="text-sm font-bold text-white">98% Charged</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-violet-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/conversation-hub"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-violet-500/30 transition-all"
            >
              <span className="text-white font-medium">Conversation Hub</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Link>
            <Link
              href="/life-management"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-violet-500/30 transition-all"
            >
              <span className="text-white font-medium">Life Management</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Link>
            <Link
              href="/growth"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-violet-500/30 transition-all"
            >
              <span className="text-white font-medium">Growth</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Link>
            <Link
              href="/thought-action-log"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-transparent hover:border-violet-500/30 transition-all"
            >
              <span className="text-white font-medium">Thought Log</span>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Critical Stats */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-violet-500/20 flex justify-between items-center group hover:border-violet-500/40 transition-colors">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Critical Tasks</p>
            <p className="text-2xl font-bold text-white">3 Remaining</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
            !
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-5 border border-violet-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Neural Growth</h3>
            <Link href="/growth" className="text-xs text-violet-400 hover:underline">
              View Matrix
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Parenting Logic', level: 4, pct: 65, color: 'from-purple-400 to-violet-500' },
              { name: 'Business Strategy', level: 7, pct: 82, color: 'from-emerald-400 to-violet-500' },
              { name: 'Creative Design', level: 3, pct: 45, color: 'from-orange-400 to-red-400' },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-white">{s.name}</span>
                  <span className="text-xs text-violet-400 font-mono">Lvl {s.level}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${s.color} rounded-full ${
                      s.pct === 65 ? 'w-[65%]' : s.pct === 82 ? 'w-[82%]' : 'w-[45%]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
