import { Image } from 'expo-image';
import { IMAGES, SOVEREIGN_MODES } from './constants';

/** Collect all image URLs used in the app */
function getAllImageUrls(): string[] {
  const urls = new Set<string>();
  urls.add(IMAGES.hero);
  urls.add(IMAGES.avatar);
  IMAGES.features.forEach((url) => urls.add(url));
  IMAGES.testimonials.forEach((url) => urls.add(url));
  SOVEREIGN_MODES.forEach((mode) => urls.add(mode.image));
  return Array.from(urls);
}

/**
 * Prefetch and cache images on app launch.
 * Call from root layout useEffect to reduce perceived load times.
 */
export async function cacheImages(): Promise<void> {
  const urls = getAllImageUrls();
  try {
    await Image.prefetch(urls, 'disk');
  } catch (e) {
    // Non-fatal: images will load on demand
    console.warn('[imageCache] Prefetch failed:', e);
  }
}
