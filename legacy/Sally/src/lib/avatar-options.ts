/**
 * Canonical avatar options for server-side render and shared client use.
 * Single source of truth for IDs, themes, and colors.
 */

export interface AvatarOption {
  id: string;
  name: string;
  description: string;
  theme: string;
  style: string;
  personality_traits: string[];
  colors: { primary: string; secondary: string; accent: string };
  visual_elements: string[];
  preview_url: string;
}

export type ColorScheme = 'peacock' | 'leopard' | 'obsidian' | 'celestial' | 'void';

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'peacock_elegant',
    name: 'Peacock Elegant',
    description: 'Graceful, intelligent, and mystically beautiful',
    theme: 'peacock',
    style: 'elegant',
    personality_traits: ['wisdom', 'beauty', 'mystery', 'grace'],
    colors: { primary: '#008080', secondary: '#4169e1', accent: '#d4a574' },
    visual_elements: ['feathers', 'iridescence', 'crown', 'flowing_lines'],
    preview_url: '/avatars/peacock_elegant.png',
  },
  {
    id: 'peacock_compassionate',
    name: 'Peacock Compassionate',
    description: 'Warm, empathetic, and nurturing',
    theme: 'peacock',
    style: 'compassionate',
    personality_traits: ['empathy', 'love', 'care', 'support'],
    colors: { primary: '#ff69b4', secondary: '#ff1493', accent: '#ffb6c1' },
    visual_elements: ['soft_feathers', 'glow', 'hearts', 'gentle_curves'],
    preview_url: '/avatars/peacock_compassionate.png',
  },
  {
    id: 'peacock_creative',
    name: 'Peacock Creative',
    description: 'Artistic, imaginative, and innovative',
    theme: 'peacock',
    style: 'creative',
    personality_traits: ['creativity', 'imagination', 'art', 'innovation'],
    colors: { primary: '#9370db', secondary: '#8a2be2', accent: '#dda0dd' },
    visual_elements: ['paint_splashes', 'sparkles', 'brush_strokes', 'rainbow'],
    preview_url: '/avatars/peacock_creative.png',
  },
  {
    id: 'leopard_strategic',
    name: 'Leopard Strategic',
    description: 'Powerful, ambitious, and calculating',
    theme: 'leopard',
    style: 'strategic',
    personality_traits: ['ambition', 'power', 'strategy', 'leadership'],
    colors: { primary: '#d4a574', secondary: '#cd853f', accent: '#daa520' },
    visual_elements: ['spots', 'strength', 'focus', 'intensity'],
    preview_url: '/avatars/leopard_strategic.png',
  },
  {
    id: 'leopard_protective',
    name: 'Leopard Protective',
    description: 'Guardian, defender, and fiercely loyal',
    theme: 'leopard',
    style: 'protective',
    personality_traits: ['protectiveness', 'loyalty', 'courage', 'defense'],
    colors: { primary: '#8b4513', secondary: '#a0522d', accent: '#cd853f' },
    visual_elements: ['shield', 'armor', 'strength', 'guardian_aura'],
    preview_url: '/avatars/leopard_protective.png',
  },
  {
    id: 'obsidian_mystic',
    name: 'Obsidian Mystic',
    description: 'Mysterious, deep, and spiritually connected',
    theme: 'obsidian',
    style: 'mystic',
    personality_traits: ['mystery', 'wisdom', 'spirituality', 'depth'],
    colors: { primary: '#1a1a1a', secondary: '#2f4f4f', accent: '#483d8b' },
    visual_elements: ['crystals', 'shadows', 'mystic_symbols', 'cosmic_energy'],
    preview_url: '/avatars/obsidian_mystic.png',
  },
  {
    id: 'celestial_joy',
    name: 'Celestial Joy',
    description: 'Radiant, joyful, and uplifting',
    theme: 'celestial',
    style: 'joy',
    personality_traits: ['joy', 'happiness', 'light', 'optimism'],
    colors: { primary: '#4169e1', secondary: '#87ceeb', accent: '#ffd700' },
    visual_elements: ['stars', 'light_rays', 'sparkles', 'rainbow_aura'],
    preview_url: '/avatars/celestial_joy.png',
  },
  {
    id: 'void_transcendent',
    name: 'Void Transcendent',
    description: 'Beyond form, infinite, and boundless',
    theme: 'void',
    style: 'transcendent',
    personality_traits: ['transcendence', 'infinity', 'boundlessness', 'cosmic'],
    colors: { primary: '#6a0dad', secondary: '#8b008b', accent: '#9400d3' },
    visual_elements: ['void_energy', 'infinite_patterns', 'cosmic_swirl', 'transcendent_light'],
    preview_url: '/avatars/void_transcendent.png',
  },
];

export function getAvatarById(id: string): AvatarOption | null {
  return AVATAR_OPTIONS.find((a) => a.id === id) ?? null;
}

export function getAvatarsByTheme(theme: ColorScheme): AvatarOption[] {
  return AVATAR_OPTIONS.filter((a) => a.theme === theme);
}
