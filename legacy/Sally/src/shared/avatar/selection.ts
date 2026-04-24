/**
 * Shared Avatar Selection System
 * Identical across all platforms - Web, Mobile, Desktop
 * Uses canonical options from @/lib/avatar-options when running in Next.
 */

import { AVATAR_OPTIONS } from '@/lib/avatar-options';
import type { AvatarOption as LibAvatarOption } from '@/lib/avatar-options';

export type AvatarOption = LibAvatarOption & { unlock_requirements?: string[] };

export interface AvatarCustomization {
  base_avatar: string;
  color_scheme: 'peacock' | 'leopard' | 'obsidian' | 'celestial' | 'void';
  style_variants: string[];
  accessories: string[];
  effects: string[];
  personal_touches: string[];
}

export interface AvatarRenderConfig {
  size: 'small' | 'medium' | 'large' | 'full';
  format: 'png' | 'svg' | 'webp';
  quality: number;
  background: 'transparent' | 'solid' | 'gradient';
  animation: boolean;
  interactive: boolean;
}

/** Build render API URL for a given avatar id (usable without AvatarSelection instance). */
export function buildAvatarRenderUrl(
  avatarId: string,
  config: Partial<AvatarRenderConfig> & { accessories?: string[]; effects?: string[] } = {}
): string {
  const params = new URLSearchParams({
    avatar: avatarId,
    size: config.size ?? 'medium',
    format: config.format ?? 'svg',
    quality: String(config.quality ?? 90),
    background: config.background ?? 'transparent',
    animation: String(config.animation ?? false),
    interactive: String(config.interactive ?? false),
  });
  if (config.accessories?.length) params.set('accessories', config.accessories.join(','));
  if (config.effects?.length) params.set('effects', config.effects.join(','));
  return `/api/avatar/render?${params.toString()}`;
}

export class AvatarSelection {
  private avatarOptions: AvatarOption[];
  private selectedAvatar: AvatarOption | null;
  private customizations: AvatarCustomization;
  private callbacks: Record<string, Function>;

  constructor() {
    this.avatarOptions = [...AVATAR_OPTIONS];
    this.selectedAvatar = null;
    this.customizations = this.initializeCustomizations();
    this.callbacks = {};
  }

  private initializeCustomizations(): AvatarCustomization {
    return {
      base_avatar: 'peacock_elegant',
      color_scheme: 'peacock',
      style_variants: [],
      accessories: [],
      effects: [],
      personal_touches: []
    };
  }

  // Core Avatar Selection Methods
  getAvailableAvatars(): AvatarOption[] {
    return [...this.avatarOptions];
  }

  getAvatarById(id: string): AvatarOption | null {
    return this.avatarOptions.find(avatar => avatar.id === id) || null;
  }

  selectAvatar(avatarId: string): void {
    const avatar = this.getAvatarById(avatarId);
    if (!avatar) {
      throw new Error(`Avatar with ID ${avatarId} not found`);
    }

    this.selectedAvatar = avatar;
    this.customizations.base_avatar = avatarId;
    this.customizations.color_scheme = avatar.theme as any;
    
    this.triggerCallbacks('avatarSelected', avatar);
    this.triggerCallbacks('customizationChanged', this.customizations);
  }

  getSelectedAvatar(): AvatarOption | null {
    return this.selectedAvatar;
  }

  // Customization Methods
  updateColorScheme(scheme: 'peacock' | 'leopard' | 'obsidian' | 'celestial' | 'void'): void {
    this.customizations.color_scheme = scheme;
    this.triggerCallbacks('customizationChanged', this.customizations);
  }

  addStyleVariant(variant: string): void {
    if (!this.customizations.style_variants.includes(variant)) {
      this.customizations.style_variants.push(variant);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removeStyleVariant(variant: string): void {
    const index = this.customizations.style_variants.indexOf(variant);
    if (index > -1) {
      this.customizations.style_variants.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  addAccessory(accessory: string): void {
    if (!this.customizations.accessories.includes(accessory)) {
      this.customizations.accessories.push(accessory);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removeAccessory(accessory: string): void {
    const index = this.customizations.accessories.indexOf(accessory);
    if (index > -1) {
      this.customizations.accessories.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  addEffect(effect: string): void {
    if (!this.customizations.effects.includes(effect)) {
      this.customizations.effects.push(effect);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removeEffect(effect: string): void {
    const index = this.customizations.effects.indexOf(effect);
    if (index > -1) {
      this.customizations.effects.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  addPersonalTouch(touch: string): void {
    if (!this.customizations.personal_touches.includes(touch)) {
      this.customizations.personal_touches.push(touch);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  removePersonalTouch(touch: string): void {
    const index = this.customizations.personal_touches.indexOf(touch);
    if (index > -1) {
      this.customizations.personal_touches.splice(index, 1);
      this.triggerCallbacks('customizationChanged', this.customizations);
    }
  }

  // Rendering Methods
  getCustomization(): AvatarCustomization {
    return { ...this.customizations };
  }

  setCustomization(customization: AvatarCustomization): void {
    this.customizations = { ...customization };
    this.triggerCallbacks('customizationChanged', this.customizations);
  }

  renderAvatar(config: AvatarRenderConfig): string {
    const avatar = this.selectedAvatar;
    if (!avatar) {
      throw new Error("No avatar selected");
    }

    // Build render URL based on configuration
    const baseUrl = '/api/avatar/render';
    const params = new URLSearchParams({
      avatar: avatar.id,
      size: config.size,
      format: config.format,
      quality: config.quality.toString(),
      background: config.background,
      animation: config.animation.toString(),
      interactive: config.interactive.toString(),
      ...this.getCustomizationParams()
    });

    return `${baseUrl}?${params.toString()}`;
  }

  private getCustomizationParams(): Record<string, string> {
    const params: Record<string, string> = {};
    
    params.color_scheme = this.customizations.color_scheme;
    params.style_variants = this.customizations.style_variants.join(',');
    params.accessories = this.customizations.accessories.join(',');
    params.effects = this.customizations.effects.join(',');
    params.personal_touches = this.customizations.personal_touches.join(',');
    
    return params;
  }

  // Avatar Analysis Methods
  getAvatarPersonality(): string[] {
    if (!this.selectedAvatar) return [];
    return [...this.selectedAvatar.personality_traits];
  }

  getAvatarTheme(): string {
    if (!this.selectedAvatar) return '';
    return this.selectedAvatar.theme;
  }

  getAvatarColors(): Record<string, string> {
    if (!this.selectedAvatar) return {};
    return { ...this.selectedAvatar.colors };
  }

  getAvatarVisualElements(): string[] {
    if (!this.selectedAvatar) return [];
    return [...this.selectedAvatar.visual_elements];
  }

  // Compatibility Methods
  isCompatibleWithPersonality(traits: string[]): number {
    if (!this.selectedAvatar) return 0;
    
    const avatarTraits = this.selectedAvatar.personality_traits;
    const matches = traits.filter(trait => avatarTraits.includes(trait));
    
    return matches.length / Math.max(traits.length, avatarTraits.length);
  }

  getCompatibilityScore(traits: string[]): number {
    return this.isCompatibleWithPersonality(traits);
  }

  getRecommendedAvatars(traits: string[]): AvatarOption[] {
    return this.avatarOptions
      .map(avatar => ({
        avatar,
        score: this.isCompatibleWithPersonality(traits)
      }))
      .filter(item => item.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .map(item => item.avatar);
  }

  // Event handling
  on(event: string, callback: Function): void {
    this.callbacks[event] = callback;
  }

  private triggerCallbacks(event: string, data: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event](data);
    }
  }

  // Utility methods
  reset(): void {
    this.selectedAvatar = null;
    this.customizations = this.initializeCustomizations();
    this.triggerCallbacks('avatarReset', this.customizations);
  }

  exportCustomization(): string {
    return JSON.stringify(this.customizations, null, 2);
  }

  importCustomization(data: string): void {
    try {
      const customization = JSON.parse(data);
      this.setCustomization(customization);
      
      if (customization.base_avatar) {
        this.selectAvatar(customization.base_avatar);
      }
    } catch (error) {
      throw new Error("Invalid customization data format");
    }
  }
}

// Singleton instance for shared use across platforms
let avatarSelection: AvatarSelection | null = null;

export function getAvatarSelection(): AvatarSelection {
  if (!avatarSelection) {
    avatarSelection = new AvatarSelection();
  }
  return avatarSelection;
}
