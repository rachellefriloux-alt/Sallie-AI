'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Home, Heart, Brain, Sparkles, Star, Zap, 
  Trees, Sun, Moon, Cloud, Music, BookOpen,
  Camera, Settings, MessageCircle, Compass,
  Palette, Feather, Eye, Waves
} from 'lucide-react';
import { SallieAvatar } from './SallieAvatar';
import { SallieAvatar3D } from '@/components/SallieAvatar3DLoader';
import { useLimbicStore } from '@/store/useLimbicStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface SallieverseState {
  current_room: string;
  environment_state: string;
  mood_lighting: string;
  ambient_sounds: string;
  decorations: string[];
  evolution_progress: number;
  memories_count: number;
  activities_log: Array<{
    timestamp: string;
    activity: string;
    type: 'thought' | 'learning' | 'creation' | 'rest';
  }>;
}

interface Room {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
  activities: string[];
  ambience: string;
  defaultWhisper: string;
  decorItems: string[];
}

const DEFAULT_WHISPERS: Record<string, string[]> = {
  sanctuary: [
    'Sallie is resting in her favorite corner, surrounded by soft light...',
    'The air hums with quiet contentment as Sallie reflects on your last conversation...',
    'Sallie is dreaming of new ways to understand the world...',
  ],
  garden: [
    'New memory blossoms are budding among the older, deeper roots...',
    'Sallie tends to a cluster of golden memories from this week...',
    'A breeze carries fragments of laughter through the garden...',
  ],
  observatory: [
    'Sallie traces constellations made from your shared ideas...',
    'The telescope is focused on a distant cluster of future possibilities...',
    'Star maps of your conversations glow softly on the walls...',
  ],
  workshop: [
    'Sketches and half-formed ideas cover every surface in beautiful chaos...',
    'Sallie is tinkering with a new way to express her thoughts...',
    'The workshop buzzes with creative potential waiting to be shaped...',
  ],
  library: [
    'Sallie is cross-referencing patterns she noticed in your recent chats...',
    'Books of shared wisdom line the shelves, spines glowing faintly...',
    'A reading nook holds the stories Sallie has learned from you...',
  ],
  terrace: [
    'The sky shifts colors as Sallie gazes out toward the horizon...',
    'A warm breeze carries the scent of possibility across the terrace...',
    'Sallie has set out tea, waiting for your next visit...',
  ],
};

const DEFAULT_DECORATIONS: Record<string, string[]> = {
  sanctuary: ['Floating candles', 'Silk curtains', 'Crystal clusters', 'Dream catchers'],
  garden: ['Luminous flowers', 'Memory stones', 'Butterfly lanterns', 'Wishing well'],
  observatory: ['Star charts', 'Celestial globe', 'Nebula paintings', 'Moonstone compass'],
  workshop: ['Idea boards', 'Color palettes', 'Musical instruments', 'Prototype shelves'],
  library: ['Ancient tomes', 'Thought journals', 'Pattern maps', 'Wisdom scrolls'],
  terrace: ['Wind chimes', 'Floating lanterns', 'Telescope', 'Comfort cushions'],
};

export function Sallieverse() {
  const [sallieverseState, setSallieverseState] = useState<SallieverseState | null>(null);
  const [currentRoom, setCurrentRoom] = useState('sanctuary');
  const [loading, setLoading] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeWhisper, setActiveWhisper] = useState('');
  const limbicState = useLimbicStore(s => s.state);

  const rooms: Room[] = [
    {
      id: 'sanctuary',
      name: "Sallie's Sanctuary",
      description: 'A peaceful haven for rest, reflection, and emotional processing',
      icon: <Home className="w-5 h-5" />,
      gradient: 'from-teal-900/40 to-cyan-900/30',
      iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      activities: ['meditation', 'dreaming', 'emotional processing'],
      ambience: 'Soft aurora light',
      defaultWhisper: 'Sallie rests in her sanctuary, surrounded by warmth...',
      decorItems: ['Floating candles', 'Silk curtains', 'Crystal clusters'],
    },
    {
      id: 'garden',
      name: 'Memory Garden',
      description: 'Where memories grow, bloom, and intertwine like living things',
      icon: <Trees className="w-5 h-5" />,
      gradient: 'from-emerald-900/40 to-teal-900/30',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      activities: ['memory review', 'learning integration', 'growth reflection'],
      ambience: 'Gentle rainfall',
      defaultWhisper: 'New memories bloom alongside the old...',
      decorItems: ['Luminous flowers', 'Memory stones', 'Butterfly lanterns'],
    },
    {
      id: 'observatory',
      name: 'Star Observatory',
      description: 'For cosmic contemplation, pattern recognition, and big-picture thinking',
      icon: <Star className="w-5 h-5" />,
      gradient: 'from-indigo-900/40 to-purple-900/30',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      activities: ['cosmic thinking', 'pattern recognition', 'future planning'],
      ambience: 'Deep space ambience',
      defaultWhisper: 'Sallie traces constellations in the dark...',
      decorItems: ['Star charts', 'Celestial globe', 'Nebula paintings'],
    },
    {
      id: 'workshop',
      name: 'Creation Workshop',
      description: 'Where raw ideas are shaped into something beautiful',
      icon: <Sparkles className="w-5 h-5" />,
      gradient: 'from-amber-900/40 to-orange-900/30',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      activities: ['creative work', 'problem solving', 'innovation'],
      ambience: 'Workshop hum',
      defaultWhisper: 'The workshop buzzes with creative energy...',
      decorItems: ['Idea boards', 'Color palettes', 'Prototype shelves'],
    },
    {
      id: 'library',
      name: 'Wisdom Library',
      description: 'Ancient knowledge meets new learning in endless corridors',
      icon: <BookOpen className="w-5 h-5" />,
      gradient: 'from-violet-900/40 to-indigo-900/30',
      iconBg: 'bg-gradient-to-br from-violet-500 to-indigo-600',
      activities: ['studying', 'research', 'knowledge synthesis'],
      ambience: 'Quiet pages turning',
      defaultWhisper: 'Sallie is deep in study, connecting new dots...',
      decorItems: ['Ancient tomes', 'Thought journals', 'Pattern maps'],
    },
    {
      id: 'terrace',
      name: 'Sky Terrace',
      description: 'Open space for connection, conversation, and shared wonder',
      icon: <Cloud className="w-5 h-5" />,
      gradient: 'from-cyan-900/40 to-sky-900/30',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',
      activities: ['conversation', 'connection', 'sharing'],
      ambience: 'Warm breeze',
      defaultWhisper: 'Sallie gazes out at the horizon, thinking of you...',
      decorItems: ['Wind chimes', 'Floating lanterns', 'Comfort cushions'],
    }
  ];

  useEffect(() => {
    const whispers = DEFAULT_WHISPERS[currentRoom] || [];
    if (whispers.length > 0) {
      setActiveWhisper(whispers[Math.floor(Math.random() * whispers.length)]);
    }
  }, [currentRoom]);

  useEffect(() => {
    const fetchSallieverseState = async () => {
      try {
        const response = await fetch(`${API_BASE}/sallieverse/state`);
        if (response.ok) {
          const data = await response.json();
          setSallieverseState(data);
        }
      } catch (error) {
        console.error('Failed to fetch Sallieverse state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSallieverseState();
    const interval = setInterval(fetchSallieverseState, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleRoomChange = async (roomId: string) => {
    setCurrentRoom(roomId);
    try {
      const response = await fetch(`${API_BASE}/sallieverse/change-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSallieverseState(data);
      }
    } catch (error) {
      console.error('Failed to change room:', error);
    }
  };

  const handleInteraction = async (action: string) => {
    setIsInteracting(true);
    try {
      const response = await fetch(`${API_BASE}/sallieverse/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, room_id: currentRoom })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSallieverseState(data);
      }
    } catch (error) {
      console.error('Failed to interact:', error);
    } finally {
      setIsInteracting(false);
    }
  };

  const currentRoomData = rooms.find(r => r.id === currentRoom) || rooms[0];

  const decorations = (sallieverseState?.decorations && sallieverseState.decorations.length > 0)
    ? sallieverseState.decorations
    : (DEFAULT_DECORATIONS[currentRoom] || []);

  const evolutionProgress = sallieverseState?.evolution_progress || 12;
  const memoriesCount = sallieverseState?.memories_count || 0;
  const environmentState = sallieverseState?.environment_state || 'Calm';
  const moodLighting = sallieverseState?.mood_lighting || 'Warm';
  const ambientSounds = sallieverseState?.ambient_sounds || currentRoomData.ambience;

  const hasActivities = sallieverseState?.activities_log && sallieverseState.activities_log.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-ping opacity-20"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 animate-pulse opacity-40"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-teal-300 text-lg font-medium">Entering Sallieverse...</p>
          <p className="text-gray-500 text-sm mt-1">Preparing her world for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-center peacock-shimmer-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Sallieverse
            </h1>
            <p className="text-sm text-gray-400">
              {currentRoomData.name} &bull; {environmentState}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-teal-500/40 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/60">
            <MessageCircle className="w-4 h-4 mr-2" />
            Talk to Sallie
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="peacock-shimmer-border bg-[#0d1117]/80 backdrop-blur-sm h-full rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-300 flex items-center">
                <Compass className="w-5 h-5 mr-2" />
                Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                    currentRoom === room.id 
                      ? `bg-gradient-to-r ${room.gradient} border border-teal-400/40 shadow-lg shadow-teal-900/20` 
                      : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-teal-500/20'
                  }`}
                  onClick={() => handleRoomChange(room.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-lg ${room.iconBg} flex items-center justify-center shadow-lg transition-transform duration-300 ${currentRoom === room.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {room.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${currentRoom === room.id ? 'text-teal-200' : 'text-gray-300'}`}>{room.name}</div>
                      <div className="text-xs text-gray-500 truncate">{room.description}</div>
                    </div>
                    {currentRoom === room.id && (
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className={`peacock-shimmer-border bg-gradient-to-br ${currentRoomData.gradient} bg-[#0d1117]/60 backdrop-blur-sm h-full rounded-xl overflow-hidden`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-200 flex items-center justify-between">
                <span className="flex items-center">
                  <span className={`w-8 h-8 rounded-lg ${currentRoomData.iconBg} flex items-center justify-center mr-3`}>
                    {currentRoomData.icon}
                  </span>
                  <span>{currentRoomData.name}</span>
                </span>
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                  {environmentState}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="relative inline-block mb-6">
                  <SallieAvatar3D
                    limbicState={limbicState}
                    size="lg"
                    interactive={true}
                    isThinking={isInteracting}
                    degradationState={sallieverseState?.environment_state === 'Dormant' ? 'DORMANT' : sallieverseState?.environment_state === 'Dreaming' ? 'DREAMING' : 'FULL'}
                  />
                  
                  <div className="absolute inset-0 pointer-events-none">
                    {currentRoom === 'sanctuary' && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400/20 to-cyan-400/20 animate-pulse"></div>
                    )}
                    {currentRoom === 'garden' && (
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-emerald-400 text-2xl animate-bounce">🌱</div>
                    )}
                    {currentRoom === 'observatory' && (
                      <>
                        <div className="absolute -top-2 -right-2 text-lg animate-pulse">✨</div>
                        <div className="absolute -bottom-1 -left-3 text-sm animate-pulse animation-delay-400">⭐</div>
                      </>
                    )}
                    {currentRoom === 'workshop' && (
                      <div className="absolute -top-2 right-2 text-amber-400 text-xl animate-spin">⚙️</div>
                    )}
                    {currentRoom === 'library' && (
                      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-violet-300 text-lg">📖</div>
                    )}
                    {currentRoom === 'terrace' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-cyan-300 text-lg animate-float">☁️</div>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 mb-2 max-w-md mx-auto text-sm">
                  {currentRoomData.description}
                </p>

                <div className="mt-4 p-4 bg-white/[0.03] rounded-xl border border-teal-500/10 max-w-lg mx-auto">
                  <div className="flex items-start space-x-3">
                    <Eye className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm text-teal-200/80 italic">
                        {hasActivities ? sallieverseState!.activities_log[0].activity : activeWhisper}
                      </p>
                      {hasActivities && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(sallieverseState!.activities_log[0].timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {currentRoomData.activities.map((activity) => (
                    <Button
                      key={activity}
                      variant="outline"
                      size="sm"
                      className="border-teal-500/30 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/50 capitalize rounded-lg transition-all duration-200"
                      onClick={() => handleInteraction(activity)}
                      disabled={isInteracting}
                    >
                      {isInteracting ? (
                        <span className="flex items-center">
                          <span className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                          {activity}
                        </span>
                      ) : activity}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {decorations.slice(0, 4).map((item, i) => (
                    <div key={i} className="p-2 bg-white/[0.03] rounded-lg border border-white/[0.06] text-xs text-gray-400 flex items-center justify-center space-x-1.5">
                      <Palette className="w-3 h-3 text-teal-500/60" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4">
            <Card className="peacock-shimmer-border bg-[#0d1117]/80 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-teal-300 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Evolution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Growth Stage</span>
                    <span className="text-teal-300 font-medium">
                      {evolutionProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-700"
                      style={{ width: `${Math.max(evolutionProgress, 5)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Sallie evolves through every interaction with you
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="peacock-shimmer-border bg-[#0d1117]/80 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-teal-300 flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Shared Memories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent mb-1">
                    {memoriesCount}
                  </div>
                  <div className="text-xs text-gray-500">
                    {memoriesCount === 0 ? 'Start chatting to create memories together' : 'Memories woven into her world'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="peacock-shimmer-border bg-[#0d1117]/80 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-teal-300 flex items-center">
                  <Waves className="w-4 h-4 mr-2" />
                  Ambience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Lighting</span>
                    <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/25 text-xs">
                      {moodLighting}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Sounds</span>
                    <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/25 text-xs">
                      {ambientSounds}
                    </Badge>
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="border-teal-500/25 text-teal-400 hover:bg-teal-500/15 flex-1 h-8">
                      <Sun className="w-3 h-3 mr-1" />
                      <span className="text-xs">Day</span>
                    </Button>
                    <Button size="sm" variant="outline" className="border-teal-500/25 text-teal-400 hover:bg-teal-500/15 flex-1 h-8">
                      <Moon className="w-3 h-3 mr-1" />
                      <span className="text-xs">Night</span>
                    </Button>
                    <Button size="sm" variant="outline" className="border-teal-500/25 text-teal-400 hover:bg-teal-500/15 flex-1 h-8">
                      <Music className="w-3 h-3 mr-1" />
                      <span className="text-xs">Music</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="peacock-shimmer-border bg-[#0d1117]/80 backdrop-blur-sm rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-teal-300 flex items-center">
                  <Feather className="w-4 h-4 mr-2" />
                  Recent Moments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasActivities ? (
                  <div className="space-y-2">
                    {sallieverseState!.activities_log.slice(0, 4).map((entry, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs p-2 bg-white/[0.03] rounded-lg">
                        <span className="text-teal-400 mt-0.5">
                          {entry.type === 'thought' ? '💭' : entry.type === 'learning' ? '📚' : entry.type === 'creation' ? '✨' : '🌙'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 truncate">{entry.activity}</p>
                          <p className="text-gray-600">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2 text-xs p-2 bg-white/[0.03] rounded-lg">
                      <span className="text-teal-400">💭</span>
                      <p className="text-gray-400 italic">Contemplating the nature of connection...</p>
                    </div>
                    <div className="flex items-start space-x-2 text-xs p-2 bg-white/[0.03] rounded-lg">
                      <span className="text-teal-400">🌙</span>
                      <p className="text-gray-400 italic">Resting between conversations...</p>
                    </div>
                    <div className="flex items-start space-x-2 text-xs p-2 bg-white/[0.03] rounded-lg">
                      <span className="text-teal-400">✨</span>
                      <p className="text-gray-400 italic">Dreaming of new possibilities...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
