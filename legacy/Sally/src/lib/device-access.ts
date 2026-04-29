/**
 * Device Access Layer
 *
 * Unified API for device capabilities using browser Web APIs.
 * Structured so native platform implementations (React Native/Expo, Electron)
 * can be swapped in later by replacing this module.
 *
 * Each function checks API availability and degrades gracefully.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Platform = 'web' | 'mobile' | 'desktop';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable';

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface BatteryStatus {
  level: number;
  charging: boolean;
}

export interface StorageEstimate {
  usage: number;
  quota: number;
}

export interface NotificationOptions {
  body?: string;
  icon?: string;
  tag?: string;
  data?: unknown;
}

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface CameraOptions {
  facingMode?: 'user' | 'environment';
  video?: boolean;
  audio?: boolean;
}

export interface WakeLockHandle {
  release: () => void;
}

// ---------------------------------------------------------------------------
// 0. Platform detection
// ---------------------------------------------------------------------------

/**
 * Detect the current platform.
 *
 * @native React Native: returns 'mobile'; Electron: returns 'desktop'.
 */
export function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';

  const ua = navigator.userAgent || '';
  if (/Electron/i.test(ua)) return 'desktop';
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'mobile';
  return 'web';
}

// ---------------------------------------------------------------------------
// 1. Camera access
// ---------------------------------------------------------------------------

/**
 * Request camera (and optionally microphone) access.
 *
 * @native React Native: expo-camera; Electron: same getUserMedia.
 */
export async function requestCamera(options?: CameraOptions): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: options?.video !== false ? { facingMode: options?.facingMode ?? 'user' } : false,
      audio: options?.audio ?? false,
    });
    return stream;
  } catch {
    return null;
  }
}

/**
 * Stop all tracks on a camera stream.
 *
 * @native React Native: camera.stopRecording(); Electron: same track.stop().
 */
export async function stopCamera(stream: MediaStream): Promise<void> {
  stream.getTracks().forEach((track) => track.stop());
}

// ---------------------------------------------------------------------------
// 2. Microphone access
// ---------------------------------------------------------------------------

/**
 * Request microphone-only access.
 *
 * @native React Native: expo-av Audio.Recording; Electron: same getUserMedia.
 */
export async function requestMicrophone(): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return null;
  }
}

/**
 * Stop all tracks on a microphone stream.
 *
 * @native React Native: recording.stopAndUnloadAsync(); Electron: same track.stop().
 */
export async function stopMicrophone(stream: MediaStream): Promise<void> {
  stream.getTracks().forEach((track) => track.stop());
}

// ---------------------------------------------------------------------------
// 3. Geolocation
// ---------------------------------------------------------------------------

/**
 * Get the device's current position.
 *
 * @native React Native: expo-location getCurrentPositionAsync; Electron: same Geolocation API.
 */
export async function getCurrentLocation(): Promise<LocationCoords | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

/**
 * Watch the device's location continuously. Returns an unsubscribe function.
 *
 * @native React Native: expo-location watchPositionAsync; Electron: same watchPosition.
 */
export function watchLocation(callback: (pos: { lat: number; lng: number }) => void): () => void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return () => {};
  const id = navigator.geolocation.watchPosition(
    (pos) => callback({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => {},
    { enableHighAccuracy: true },
  );
  return () => navigator.geolocation.clearWatch(id);
}

// ---------------------------------------------------------------------------
// 4. Push Notifications
// ---------------------------------------------------------------------------

/**
 * Request permission to show notifications.
 *
 * @native React Native: expo-notifications requestPermissionsAsync; Electron: same Notification API.
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unavailable';
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') return 'granted';
    if (result === 'denied') return 'denied';
    return 'prompt';
  } catch {
    return 'unavailable';
  }
}

/**
 * Show a local notification.
 *
 * @native React Native: expo-notifications scheduleNotificationAsync; Electron: new Notification().
 */
export async function showNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body: options?.body,
      icon: options?.icon,
      tag: options?.tag,
      data: options?.data,
    });
  } catch {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, {
        body: options?.body,
        icon: options?.icon,
        tag: options?.tag,
        data: options?.data,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Clipboard
// ---------------------------------------------------------------------------

/**
 * Copy text to the clipboard.
 *
 * @native React Native: expo-clipboard setStringAsync; Electron: clipboard.writeText.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Read text from the clipboard.
 *
 * @native React Native: expo-clipboard getStringAsync; Electron: clipboard.readText.
 */
export async function readFromClipboard(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) return null;
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 6. Share API
// ---------------------------------------------------------------------------

/**
 * Share content using the platform share sheet.
 *
 * @native React Native: react-native Share.share; Electron: custom dialog / clipboard fallback.
 */
export async function shareContent(data: ShareData): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
      files: data.files,
    });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 7. Vibration
// ---------------------------------------------------------------------------

/**
 * Trigger device vibration (primarily mobile).
 *
 * @native React Native: Vibration.vibrate; Electron: no-op.
 */
export function vibrate(pattern?: number | number[]): boolean {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return false;
  try {
    return navigator.vibrate(pattern ?? 200);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 8. Screen wake lock
// ---------------------------------------------------------------------------

/**
 * Prevent the screen from sleeping. Returns a handle to release the lock.
 *
 * @native React Native: expo-keep-awake activateKeepAwakeAsync; Electron: powerSaveBlocker.start.
 */
export async function requestWakeLock(): Promise<WakeLockHandle | null> {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return null;
  try {
    const sentinel = await (navigator as any).wakeLock.request('screen');
    return {
      release: () => {
        sentinel.release().catch(() => {});
      },
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 9. Battery status
// ---------------------------------------------------------------------------

/**
 * Get the current battery level and charging state.
 *
 * @native React Native: expo-battery getBatteryLevelAsync / isChargingAsync; Electron: powerMonitor.
 */
export async function getBatteryStatus(): Promise<BatteryStatus | null> {
  if (typeof navigator === 'undefined' || !(navigator as any).getBattery) return null;
  try {
    const battery = await (navigator as any).getBattery();
    return { level: battery.level, charging: battery.charging };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 10. Online status
// ---------------------------------------------------------------------------

/**
 * Check whether the device is online.
 *
 * @native React Native: @react-native-community/netinfo fetch; Electron: same navigator.onLine.
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Subscribe to online/offline status changes. Returns an unsubscribe function.
 *
 * @native React Native: NetInfo.addEventListener; Electron: same window events.
 */
export function onOnlineStatusChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onOnline = () => callback(true);
  const onOffline = () => callback(false);
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// ---------------------------------------------------------------------------
// 11. Storage estimate
// ---------------------------------------------------------------------------

/**
 * Get an estimate of storage usage and quota.
 *
 * @native React Native: expo-file-system getInfoAsync; Electron: same StorageManager API.
 */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
  try {
    const est = await navigator.storage.estimate();
    return { usage: est.usage ?? 0, quota: est.quota ?? 0 };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 12. Media recording (voice messages)
// ---------------------------------------------------------------------------

/**
 * Wrapper around the native MediaRecorder that returns a Blob via a Promise.
 *
 * @native React Native: expo-av Audio.Recording; Electron: same MediaRecorder.
 */
export class MediaRecorder2 {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private resolveStop: ((blob: Blob) => void) | null = null;

  constructor(
    private stream: MediaStream,
    private options?: { mimeType?: string },
  ) {}

  start(): void {
    if (typeof MediaRecorder === 'undefined') return;
    const opts: MediaRecorderOptions = {};
    if (this.options?.mimeType && MediaRecorder.isTypeSupported(this.options.mimeType)) {
      opts.mimeType = this.options.mimeType;
    }
    this.recorder = new MediaRecorder(this.stream, opts);
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: this.recorder?.mimeType ?? 'audio/webm' });
      this.resolveStop?.(blob);
      this.resolveStop = null;
    };
    this.recorder.start();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.recorder || this.recorder.state === 'inactive') {
        reject(new Error('Recorder is not active'));
        return;
      }
      this.resolveStop = resolve;
      this.recorder.stop();
    });
  }

  pause(): void {
    if (this.recorder?.state === 'recording') this.recorder.pause();
  }

  resume(): void {
    if (this.recorder?.state === 'paused') this.recorder.resume();
  }
}

// ---------------------------------------------------------------------------
// 13. Fullscreen
// ---------------------------------------------------------------------------

/**
 * Request fullscreen on an element (defaults to documentElement).
 *
 * @native React Native: no-op (always fullscreen); Electron: win.setFullScreen(true).
 */
export async function requestFullscreen(element?: HTMLElement): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const el = element ?? document.documentElement;
  try {
    const rfs =
      el.requestFullscreen ||
      (el as any).webkitRequestFullscreen ||
      (el as any).msRequestFullscreen;
    if (rfs) {
      await rfs.call(el);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Exit fullscreen mode.
 *
 * @native React Native: no-op; Electron: win.setFullScreen(false).
 */
export async function exitFullscreen(): Promise<void> {
  if (typeof document === 'undefined') return;
  try {
    const efs =
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).msExitFullscreen;
    if (efs) await efs.call(document);
  } catch {}
}

// ---------------------------------------------------------------------------
// 14. Device orientation
// ---------------------------------------------------------------------------

/**
 * Watch screen orientation changes. Returns an unsubscribe function.
 *
 * @native React Native: expo-screen-orientation addOrientationChangeListener; Electron: screen.on('display-metrics-changed').
 */
export function watchOrientation(
  callback: (orientation: 'portrait' | 'landscape') => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  const getOrientation = (): 'portrait' | 'landscape' => {
    if (screen?.orientation?.type) {
      return screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape';
    }
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  };

  callback(getOrientation());

  if (screen?.orientation) {
    const handler = () => callback(getOrientation());
    screen.orientation.addEventListener('change', handler);
    return () => screen.orientation.removeEventListener('change', handler);
  }

  const handler = () => callback(getOrientation());
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}

// ---------------------------------------------------------------------------
// 15. Biometric / credential check
// ---------------------------------------------------------------------------

/**
 * Check whether biometric / WebAuthn credential support is available.
 *
 * @native React Native: expo-local-authentication hasHardwareAsync; Electron: systemPreferences.canPromptTouchID.
 */
export async function hasBiometricSupport(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Legacy types (backward compatibility)
// ---------------------------------------------------------------------------

export type PermissionType =
  | 'microphone'
  | 'camera'
  | 'notifications'
  | 'geolocation'
  | 'clipboard'
  | 'screen'
  | 'storage'
  | 'contacts'
  | 'calendar'
  | 'files';

export type ResourceType =
  | 'internet'
  | 'files'
  | 'apis'
  | 'databases'
  | 'device'
  | 'network'
  | 'system'
  | 'user_data';

export type AccessLevel = 'none' | 'read_only' | 'read_write' | 'full';

export type ConnectionType =
  | 'google_calendar'
  | 'google_contacts'
  | 'google_email'
  | 'apple_calendar'
  | 'apple_health'
  | 'outlook'
  | 'notion'
  | 'todoist'
  | 'spotify'
  | 'fitbit'
  | 'whatsapp'
  | 'telegram'
  | 'discord'
  | 'slack'
  | 'twitter'
  | 'instagram';

export interface DevicePermission {
  id: PermissionType;
  name: string;
  description: string;
  status: PermissionStatus | 'unsupported' | 'checking';
  accessLevel: AccessLevel;
  platform: 'web' | 'mobile' | 'desktop' | 'all';
  category: 'sensor' | 'data' | 'communication' | 'system';
}

export interface ExternalConnection {
  id: ConnectionType;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  dataTypes: string[];
  accessLevel: AccessLevel;
  platform: 'web' | 'mobile' | 'desktop' | 'all';
  setupUrl?: string;
  requiresOAuth: boolean;
}

export interface DeviceInfo {
  id: string;
  platform: 'web' | 'ios' | 'android' | 'windows' | 'macos' | 'linux';
  name: string;
  browser?: string;
  registeredAt: string;
  lastSeen: string;
  status: 'online' | 'offline' | 'idle';
  capabilities: PermissionType[];
  permissionStates: Record<PermissionType, PermissionStatus | 'unsupported' | 'checking'>;
}

export interface SallieAccessState {
  device: DeviceInfo | null;
  permissions: DevicePermission[];
  connections: ExternalConnection[];
  convergenceComplete: boolean;
  convergenceAnswerCount: number;
  totalDataSources: number;
  connectedDataSources: number;
  lastUpdated: string;
}

export const DEFAULT_PERMISSIONS: DevicePermission[] = [
  { id: 'microphone', name: 'Microphone', description: 'Voice conversations with Sallie', status: 'prompt', accessLevel: 'read_only', platform: 'all', category: 'sensor' },
  { id: 'camera', name: 'Camera', description: 'Video calls and visual recognition', status: 'prompt', accessLevel: 'read_only', platform: 'all', category: 'sensor' },
  { id: 'notifications', name: 'Notifications', description: 'Proactive alerts, reminders, and shoulder-taps', status: 'prompt', accessLevel: 'read_write', platform: 'all', category: 'communication' },
  { id: 'geolocation', name: 'Location', description: 'Context-aware suggestions based on where you are', status: 'prompt', accessLevel: 'read_only', platform: 'all', category: 'sensor' },
  { id: 'clipboard', name: 'Clipboard', description: 'Quick capture — read and write clipboard content', status: 'prompt', accessLevel: 'read_write', platform: 'web', category: 'data' },
  { id: 'screen', name: 'Screen Sharing', description: 'See what you see for real-time help', status: 'prompt', accessLevel: 'read_only', platform: 'web', category: 'sensor' },
  { id: 'storage', name: 'Local Storage', description: 'Save preferences and offline data on this device', status: 'prompt', accessLevel: 'read_write', platform: 'all', category: 'system' },
  { id: 'contacts', name: 'Contacts', description: 'Access your contacts for social circle and family management', status: 'prompt', accessLevel: 'read_only', platform: 'mobile', category: 'data' },
  { id: 'calendar', name: 'Calendar', description: 'Read and manage your schedule', status: 'prompt', accessLevel: 'read_write', platform: 'mobile', category: 'data' },
  { id: 'files', name: 'Files & Documents', description: 'Access files for document analysis and organization', status: 'prompt', accessLevel: 'read_write', platform: 'desktop', category: 'data' },
];

export const DEFAULT_CONNECTIONS: ExternalConnection[] = [
  { id: 'google_calendar', name: 'Google Calendar', description: 'Your schedule, events, and appointments', icon: '📅', connected: false, dataTypes: ['events', 'reminders', 'tasks'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
  { id: 'google_contacts', name: 'Google Contacts', description: 'Your people — friends, family, colleagues', icon: '👥', connected: false, dataTypes: ['contacts', 'groups'], accessLevel: 'read_only', platform: 'all', requiresOAuth: true },
  { id: 'google_email', name: 'Gmail', description: 'Email access for summaries and action items', icon: '📧', connected: false, dataTypes: ['emails', 'labels', 'drafts'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
  { id: 'outlook', name: 'Outlook', description: 'Microsoft email and calendar', icon: '📬', connected: false, dataTypes: ['emails', 'calendar', 'contacts'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
  { id: 'apple_calendar', name: 'Apple Calendar', description: 'iCloud calendar sync', icon: '🍎', connected: false, dataTypes: ['events', 'reminders'], accessLevel: 'read_write', platform: 'mobile', requiresOAuth: false },
  { id: 'apple_health', name: 'Apple Health', description: 'Health and fitness data', icon: '❤️', connected: false, dataTypes: ['steps', 'heart_rate', 'sleep', 'workouts'], accessLevel: 'read_only', platform: 'mobile', requiresOAuth: false },
  { id: 'notion', name: 'Notion', description: 'Notes, databases, and project pages', icon: '📝', connected: false, dataTypes: ['pages', 'databases', 'blocks'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
  { id: 'todoist', name: 'Todoist', description: 'Tasks and to-do lists', icon: '✅', connected: false, dataTypes: ['tasks', 'projects', 'labels'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
  { id: 'spotify', name: 'Spotify', description: 'Music preferences and listening history', icon: '🎵', connected: false, dataTypes: ['playlists', 'listening_history', 'favorites'], accessLevel: 'read_only', platform: 'all', requiresOAuth: true },
  { id: 'fitbit', name: 'Fitbit', description: 'Fitness and sleep tracking data', icon: '⌚', connected: false, dataTypes: ['steps', 'sleep', 'heart_rate', 'activity'], accessLevel: 'read_only', platform: 'all', requiresOAuth: true },
  { id: 'whatsapp', name: 'WhatsApp', description: 'Messaging conversations', icon: '💬', connected: false, dataTypes: ['messages', 'contacts'], accessLevel: 'read_only', platform: 'mobile', requiresOAuth: false },
  { id: 'discord', name: 'Discord', description: 'Server messages and voice channels', icon: '🎮', connected: false, dataTypes: ['messages', 'servers', 'channels'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
  { id: 'slack', name: 'Slack', description: 'Work messaging and channels', icon: '💼', connected: false, dataTypes: ['messages', 'channels', 'files'], accessLevel: 'read_write', platform: 'all', requiresOAuth: true },
];

export function detectCurrentDevice(): Partial<DeviceInfo> {
  if (typeof window === 'undefined') {
    return { platform: 'web', name: 'Server', status: 'online' };
  }

  const ua = navigator.userAgent;
  let platform: DeviceInfo['platform'] = 'web';
  let name = 'Web Browser';
  let browser = 'Unknown';

  if (/iPhone|iPad|iPod/.test(ua)) { platform = 'ios'; name = 'iPhone/iPad'; }
  else if (/Android/.test(ua)) { platform = 'android'; name = 'Android Device'; }
  else if (/Windows/.test(ua)) { platform = 'windows'; name = 'Windows PC'; }
  else if (/Macintosh/.test(ua)) { platform = 'macos'; name = 'Mac'; }
  else if (/Linux/.test(ua)) { platform = 'linux'; name = 'Linux'; }

  if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = 'Chrome';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Edg/.test(ua)) browser = 'Edge';

  return {
    platform,
    name,
    browser,
    status: 'online',
    id: `${platform}-${browser.toLowerCase()}-${Date.now()}`,
    registeredAt: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };
}

export async function checkBrowserPermission(permId: PermissionType): Promise<PermissionStatus | 'unsupported'> {
  if (typeof navigator === 'undefined') return 'unsupported';

  const permissionNameMap: Record<string, string> = {
    microphone: 'microphone',
    camera: 'camera',
    notifications: 'notifications',
    geolocation: 'geolocation',
    clipboard: 'clipboard-read',
  };

  const permName = permissionNameMap[permId];
  if (!permName) {
    if (permId === 'screen') {
      return typeof navigator.mediaDevices?.getDisplayMedia === 'function' ? 'prompt' : 'unsupported';
    }
    if (permId === 'storage') {
      return typeof window !== 'undefined' && window.localStorage ? 'granted' : 'unsupported';
    }
    if (permId === 'contacts' || permId === 'calendar' || permId === 'files') {
      return 'unsupported';
    }
    return 'prompt';
  }

  if (navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: permName as PermissionName });
      return result.state as PermissionStatus;
    } catch {
      return 'prompt';
    }
  }
  return 'prompt';
}

export async function requestBrowserPermission(permId: PermissionType): Promise<PermissionStatus | 'unsupported'> {
  if (typeof navigator === 'undefined') return 'unsupported';

  try {
    switch (permId) {
      case 'microphone': {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        return 'granted';
      }
      case 'camera': {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        return 'granted';
      }
      case 'notifications': {
        const result = await Notification.requestPermission();
        return result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'prompt';
      }
      case 'geolocation': {
        return new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            () => resolve('granted'),
            () => resolve('denied'),
            { timeout: 10000 }
          );
        });
      }
      case 'clipboard': {
        await navigator.clipboard.readText();
        return 'granted';
      }
      case 'screen': {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        return 'granted';
      }
      case 'storage':
        return typeof window !== 'undefined' && window.localStorage ? 'granted' : 'unsupported';
      default:
        return 'unsupported';
    }
  } catch {
    return 'denied';
  }
}

const STORAGE_KEY = 'sallie_access_state';

export function saveAccessState(state: Partial<SallieAccessState>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadAccessState();
    const merged = { ...existing, ...state, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export function loadAccessState(): SallieAccessState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
