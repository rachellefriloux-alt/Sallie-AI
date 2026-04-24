import { describe, it, expect } from 'vitest';
import { buildAvatarSvg } from './avatar-svg';
import { getAvatarById } from './avatar-options';

describe('avatar-svg', () => {
  const option = getAvatarById('peacock_elegant');
  if (!option) throw new Error('peacock_elegant not found');

  it('buildAvatarSvg returns a non-empty string', () => {
    const svg = buildAvatarSvg(option);
    expect(typeof svg).toBe('string');
    expect(svg.length).toBeGreaterThan(100);
  });

  it('output is valid SVG with viewBox', () => {
    const svg = buildAvatarSvg(option);
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 200 200"');
  });

  it('respects size option', () => {
    const small = buildAvatarSvg(option, { size: 'small' });
    const large = buildAvatarSvg(option, { size: 'large' });
    expect(small).toContain('width="64"');
    expect(small).toContain('height="64"');
    expect(large).toContain('width="256"');
    expect(large).toContain('height="256"');
  });

  it('includes defs and theme content', () => {
    const svg = buildAvatarSvg(option);
    expect(svg).toContain('<defs>');
    expect(svg).toContain('linearGradient');
    expect(svg).toContain(option.colors.primary);
  });
});
