'use client';

import Link from 'next/link';
import {
  Sparkles,
  LayoutDashboard,
  GitBranch,
  Dna,
  Heart,
  MessageCircle,
  Hexagon,
  SlidersHorizontal,
  Settings,
  FolderKanban,
  Brain,
  Lightbulb,
  User,
  Palette,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { href: '/presence', label: 'Presence', description: "See Sallie's current state", icon: Sparkles },
  { href: '/dashboard', label: 'Dashboard', description: 'Central hub for all features', icon: LayoutDashboard },
  { href: '/conversation-hub', label: 'Conversation Hub', description: 'Voice, video & live chat with Sallie', icon: MessageCircle },
  { href: '/life-management', label: 'Life Management', description: 'Tasks, schedule, recall & insights', icon: LayoutDashboard },
  { href: '/growth', label: 'Growth', description: 'Goals, energy, journal & resources', icon: Lightbulb },
  { href: '/thought-action-log', label: 'Thought & Action Log', description: 'Cognitive pipeline & decisions', icon: Brain },
  { href: '/genesis', label: 'Genesis Flow', description: 'Dream cycle & hypothesis management', icon: GitBranch },
  { href: '/heritage', label: 'Heritage DNA', description: 'Identity & learned behaviors', icon: Dna },
  { href: '/limbic', label: 'Limbic Engine', description: 'Emotional state & patterns', icon: Heart },
  { href: '/communication', label: 'Communication', description: 'Chat, email, voice, files', icon: MessageCircle },
  { href: '/omnis', label: 'Omnis', description: 'Universal knowledge system', icon: Hexagon },
  { href: '/control', label: 'Control', description: 'Creator control panel', icon: SlidersHorizontal },
  { href: '/projects', label: 'Projects', description: 'Project browser', icon: FolderKanban },
  { href: '/thoughts', label: 'Thoughts', description: 'Thought log viewer', icon: Brain },
  { href: '/hypotheses', label: 'Hypotheses', description: 'Hypothesis manager', icon: Lightbulb },
  { href: '/avatar', label: 'Avatar Workshop', description: 'Customize your digital avatar', icon: Palette },
  { href: '/settings', label: 'Settings', description: 'Application settings', icon: Settings },
  { href: '/profile', label: 'Profile', description: 'Your profile & data', icon: User },
];

interface NavGridProps {
  items?: NavItem[];
}

export function NavGrid({ items = DEFAULT_NAV_ITEMS }: NavGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group relative flex flex-col gap-2 rounded-xl border border-violet-500/20 bg-black/20 backdrop-blur-sm px-5 py-4 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 transition-colors group-hover:bg-violet-500/30 group-hover:text-violet-300">
                <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <span className="font-medium text-white group-hover:text-violet-100 transition-colors">
                {item.label}
              </span>
            </div>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {item.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
