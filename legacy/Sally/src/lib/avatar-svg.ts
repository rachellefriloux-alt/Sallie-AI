/**
 * Pro-level avatar SVG generation. Theme-specific shapes and gradients.
 */

import type { AvatarOption } from './avatar-options';

export type AvatarSize = 'small' | 'medium' | 'large';

const SIZES: Record<AvatarSize, number> = { small: 64, medium: 128, large: 256 };

export interface AvatarSvgOptions {
  size?: AvatarSize;
  accessories?: string[];
  effects?: string[];
}

function defs(option: AvatarOption): string {
  const { primary, secondary, accent } = option.colors;
  const theme = option.theme;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  return `
  <defs>
    <linearGradient id="${id}_bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${primary}"/>
      <stop offset="50%" style="stop-color:${secondary}"/>
      <stop offset="100%" style="stop-color:${accent}"/>
    </linearGradient>
    <radialGradient id="${id}_radial" cx="50%" cy="40%" r="60%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:0.9"/>
      <stop offset="60%" style="stop-color:${secondary};stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:${primary}"/>
    </radialGradient>
    <linearGradient id="${id}_shine" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
      <stop offset="0%" style="stop-color:#fff;stop-opacity:0.25"/>
      <stop offset="100%" style="stop-color:transparent"/>
    </linearGradient>
    ${theme === 'peacock' ? `
    <linearGradient id="${id}_feather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${accent}"/>
      <stop offset="100%" style="stop-color:${primary}"/>
    </linearGradient>
    ` : ''}
    ${theme === 'void' ? `
    <radialGradient id="${id}_swirl" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:0.6"/>
      <stop offset="100%" style="stop-color:${primary}"/>
    </radialGradient>
    ` : ''}
  </defs>`;
}

/** Peacock: elegant eye-feather crown, flowing lines */
function peacockShape(option: AvatarOption): string {
  const { primary, secondary, accent } = option.colors;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  return `
  <circle cx="100" cy="100" r="98" fill="url(#${id}_radial)"/>
  <path d="M100 28 Q140 50 130 85 Q120 70 100 65 Q80 70 70 85 Q60 50 100 28Z" fill="url(#${id}_feather)" opacity="0.95"/>
  <path d="M100 35 L115 75 L100 72 L85 75 Z" fill="${secondary}" opacity="0.8"/>
  <ellipse cx="100" cy="95" rx="22" ry="26" fill="${primary}" opacity="0.4"/>
  <ellipse cx="100" cy="92" rx="10" ry="12" fill="${accent}"/>
  <ellipse cx="98" cy="90" rx="3" ry="4" fill="#fff"/>
  <path d="M55 100 Q100 85 145 100 Q100 115 55 100" fill="none" stroke="${accent}" stroke-width="2" opacity="0.6"/>
  <circle cx="100" cy="100" r="98" fill="url(#${id}_shine)" opacity="0.15"/>`;
}

/** Leopard: warm circle with spot pattern */
function leopardShape(option: AvatarOption): string {
  const { primary, secondary, accent } = option.colors;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  const spots = [
    [72, 65], [128, 68], [85, 95], [115, 98], [65, 120], [135, 118],
    [100, 75], [78, 110], [122, 112],
  ];
  const spotsSvg = spots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${secondary}" opacity="0.7"/>`).join('\n  ');
  return `
  <circle cx="100" cy="100" r="98" fill="url(#${id}_radial)"/>
  <circle cx="100" cy="100" r="90" fill="${primary}" opacity="0.85"/>
  ${spotsSvg}
  <ellipse cx="100" cy="92" rx="18" ry="22" fill="${secondary}" opacity="0.5"/>
  <ellipse cx="100" cy="88" rx="8" ry="10" fill="${accent}"/>
  <ellipse cx="98" cy="86" rx="2.5" ry="3" fill="#fff"/>
  <circle cx="100" cy="100" r="98" fill="url(#${id}_shine)" opacity="0.12"/>`;
}

/** Obsidian: dark crystal facets */
function obsidianShape(option: AvatarOption): string {
  const { primary, secondary, accent } = option.colors;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  return `
  <circle cx="100" cy="100" r="98" fill="url(#${id}_radial)"/>
  <polygon points="100,35 145,75 120,130 80,130 55,75" fill="${primary}" opacity="0.95"/>
  <polygon points="100,45 125,75 110,115 90,115 75,75" fill="${secondary}" opacity="0.6"/>
  <path d="M100 55 L100 95 M75 75 L125 75" stroke="${accent}" stroke-width="1" opacity="0.5"/>
  <ellipse cx="100" cy="88" rx="12" ry="14" fill="${accent}" opacity="0.4"/>
  <circle cx="100" cy="100" r="98" fill="url(#${id}_shine)" opacity="0.08"/>`;
}

/** Celestial: star and light rays */
function celestialShape(option: AvatarOption): string {
  const { primary, secondary, accent } = option.colors;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    const x1 = 100 + 70 * Math.cos(a);
    const y1 = 100 + 70 * Math.sin(a);
    const x2 = 100 + 95 * Math.cos(a);
    const y2 = 100 + 95 * Math.sin(a);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent}" stroke-width="2" opacity="0.6"/>`;
  }).join('\n  ');
  return `
  <circle cx="100" cy="100" r="98" fill="url(#${id}_radial)"/>
  <circle cx="100" cy="100" r="75" fill="${primary}" opacity="0.9"/>
  ${rays}
  <circle cx="100" cy="100" r="35" fill="${secondary}" opacity="0.9"/>
  <circle cx="100" cy="100" r="18" fill="${accent}"/>
  <circle cx="96" cy="96" r="4" fill="#fff"/>
  <circle cx="72" cy="78" r="4" fill="${accent}" opacity="0.9"/>
  <circle cx="128" cy="82" r="3" fill="${accent}" opacity="0.8"/>
  <circle cx="100" cy="100" r="98" fill="url(#${id}_shine)" opacity="0.2"/>`;
}

/** Void: cosmic swirl, transcendent */
function voidShape(option: AvatarOption): string {
  const { primary, secondary, accent } = option.colors;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  return `
  <circle cx="100" cy="100" r="98" fill="url(#${id}_radial)"/>
  <circle cx="100" cy="100" r="90" fill="${primary}"/>
  <path d="M100 20 A45 45 0 0 1 145 65 A45 45 0 0 1 100 110 A45 45 0 0 1 55 65 A45 45 0 0 1 100 20" fill="none" stroke="${accent}" stroke-width="3" opacity="0.5"/>
  <path d="M100 35 A35 35 0 0 0 135 70 A35 35 0 0 0 100 105 A35 35 0 0 0 65 70 A35 35 0 0 0 100 35" fill="none" stroke="${secondary}" stroke-width="2" opacity="0.6"/>
  <circle cx="100" cy="100" r="40" fill="url(#${id}_swirl)"/>
  <circle cx="100" cy="98" r="12" fill="${accent}" opacity="0.9"/>
  <circle cx="98" cy="96" r="3" fill="#fff"/>
  <circle cx="100" cy="100" r="98" fill="url(#${id}_shine)" opacity="0.1"/>`;
}

function themeShape(option: AvatarOption): string {
  switch (option.theme) {
    case 'peacock': return peacockShape(option);
    case 'leopard': return leopardShape(option);
    case 'obsidian': return obsidianShape(option);
    case 'celestial': return celestialShape(option);
    case 'void': return voidShape(option);
    default: return peacockShape(option);
  }
}

/** Accessories and effects drawn on top of the theme shape (viewBox 0 0 200 200). */
function accessoriesAndEffects(option: AvatarOption, accessories: string[], effects: string[]): string {
  const { accent } = option.colors;
  const id = option.id.replace(/[^a-z0-9]/gi, '_');
  const out: string[] = [];

  if (effects.includes('glow')) {
    out.push(
      `<filter id="${id}_glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
      `<circle cx="100" cy="100" r="92" fill="none" stroke="${accent}" stroke-width="3" opacity="0.4" filter="url(#${id}_glow)"/>`
    );
  }

  if (accessories.includes('glasses')) {
    out.push(
      `<ellipse cx="72" cy="88" rx="18" ry="12" fill="none" stroke="#333" stroke-width="2"/>`,
      `<ellipse cx="128" cy="88" rx="18" ry="12" fill="none" stroke="#333" stroke-width="2"/>`,
      `<path d="M90 88 L110 88" stroke="#333" stroke-width="2"/>`,
      `<path d="M54 92 L40 85 M146 92 L160 85" stroke="#333" stroke-width="1.5"/>`
    );
  }
  if (accessories.includes('headwear')) {
    out.push(
      `<path d="M50 55 L70 45 L90 50 L100 38 L110 50 L130 45 L150 55 L145 65 L100 52 L55 65 Z" fill="${accent}" opacity="0.9"/>`,
      `<circle cx="100" cy="40" r="6" fill="#fff" opacity="0.6"/>`
    );
  }
  if (accessories.includes('jewelry')) {
    out.push(
      `<circle cx="100" cy="128" r="8" fill="none" stroke="${accent}" stroke-width="1.5"/>`,
      `<circle cx="85" cy="132" r="4" fill="${accent}" opacity="0.8"/>`,
      `<circle cx="115" cy="132" r="4" fill="${accent}" opacity="0.8"/>`
    );
  }

  return out.join('\n  ');
}

export function buildAvatarSvg(option: AvatarOption, opts: AvatarSvgOptions = {}): string {
  const size = SIZES[opts.size ?? 'medium'];
  const vb = '0 0 200 200';
  const accessories = opts.accessories ?? [];
  const effects = opts.effects ?? [];
  const content =
    defs(option) +
    themeShape(option) +
    (accessories.length > 0 || effects.length > 0 ? '\n  ' + accessoriesAndEffects(option, accessories, effects) : '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb}" aria-hidden="true">${content}</svg>`;
}
