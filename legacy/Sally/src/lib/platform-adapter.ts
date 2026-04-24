export type Platform = 'web' | 'mobile' | 'desktop';

export interface PlatformCapabilityResult {
  available: boolean;
  connectInstructions?: string;
  nativeModule?: string;
}

export interface CameraAdapter {
  isAvailable(): PlatformCapabilityResult;
  capturePhoto(): Promise<{ success: boolean; data?: string; error?: string }>;
  captureVideo(): Promise<{ success: boolean; data?: string; error?: string }>;
}

export interface MicrophoneAdapter {
  isAvailable(): PlatformCapabilityResult;
  startRecording(): Promise<{ success: boolean; error?: string }>;
  stopRecording(): Promise<{ success: boolean; data?: Blob | null; error?: string }>;
}

export interface FileSystemAdapter {
  isAvailable(): PlatformCapabilityResult;
  readFile(path: string): Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile(path: string, content: string): Promise<{ success: boolean; error?: string }>;
  pickFile(accept?: string): Promise<{ success: boolean; data?: File | null; error?: string }>;
}

export interface NotificationsAdapter {
  isAvailable(): PlatformCapabilityResult;
  requestPermission(): Promise<{ granted: boolean }>;
  send(title: string, body: string, options?: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
}

export interface BiometricsAdapter {
  isAvailable(): PlatformCapabilityResult;
  authenticate(reason: string): Promise<{ success: boolean; error?: string }>;
}

export interface GPSAdapter {
  isAvailable(): PlatformCapabilityResult;
  getCurrentPosition(): Promise<{ success: boolean; latitude?: number; longitude?: number; error?: string }>;
  watchPosition(callback: (pos: { latitude: number; longitude: number }) => void): Promise<{ success: boolean; watchId?: number; error?: string }>;
  clearWatch(watchId: number): void;
}

export interface ContactsAdapter {
  isAvailable(): PlatformCapabilityResult;
  getContacts(): Promise<{ success: boolean; data?: { name: string; phone?: string; email?: string }[]; error?: string }>;
  pickContact(): Promise<{ success: boolean; data?: { name: string; phone?: string; email?: string } | null; error?: string }>;
}

export interface BluetoothAdapter {
  isAvailable(): PlatformCapabilityResult;
  scan(): Promise<{ success: boolean; devices?: { id: string; name: string }[]; error?: string }>;
  connect(deviceId: string): Promise<{ success: boolean; error?: string }>;
  disconnect(deviceId: string): Promise<{ success: boolean; error?: string }>;
}

export interface NFCAdapter {
  isAvailable(): PlatformCapabilityResult;
  read(): Promise<{ success: boolean; data?: string; error?: string }>;
  write(data: string): Promise<{ success: boolean; error?: string }>;
}

export interface SmartHomeAdapter {
  isAvailable(): PlatformCapabilityResult;
  controlDevice(deviceId: string, action: string, params?: Record<string, unknown>): Promise<{ success: boolean; error?: string }>;
  listDevices(): Promise<{ success: boolean; devices?: { id: string; name: string; type: string; state: string }[]; error?: string }>;
}

export interface SystemControlsAdapter {
  isAvailable(): PlatformCapabilityResult;
  setVolume(level: number): Promise<{ success: boolean; error?: string }>;
  setBrightness(level: number): Promise<{ success: boolean; error?: string }>;
  toggleWifi(enabled: boolean): Promise<{ success: boolean; error?: string }>;
  toggleBluetooth(enabled: boolean): Promise<{ success: boolean; error?: string }>;
}

export interface PlatformAdapter {
  platform: Platform;
  camera: CameraAdapter;
  microphone: MicrophoneAdapter;
  fileSystem: FileSystemAdapter;
  notifications: NotificationsAdapter;
  biometrics: BiometricsAdapter;
  gps: GPSAdapter;
  contacts: ContactsAdapter;
  bluetooth: BluetoothAdapter;
  nfc: NFCAdapter;
  smartHome: SmartHomeAdapter;
  systemControls: SystemControlsAdapter;
}

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  const ua = navigator.userAgent || '';
  if (/Electron/i.test(ua)) return 'desktop';
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return 'mobile';
  return 'web';
}

function nativeOnly(feature: string, nativeModule?: string): PlatformCapabilityResult {
  return {
    available: false,
    connectInstructions: `${feature} requires the native mobile or desktop app. Install the Sallie companion app to enable this feature.`,
    nativeModule: nativeModule || feature.toLowerCase().replace(/\s+/g, '-'),
  };
}

function createWebCamera(): CameraAdapter {
  return {
    isAvailable() {
      if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function') {
        return { available: true };
      }
      return nativeOnly('Camera', 'camera-capture');
    },
    async capturePhoto() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        await video.play();
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        stream.getTracks().forEach(t => t.stop());
        return { success: true, data: canvas.toDataURL('image/jpeg') };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Camera access denied' };
      }
    },
    async captureVideo() {
      return { success: false, error: 'Video capture requires native app for full functionality' };
    },
  };
}

function createWebMicrophone(): MicrophoneAdapter {
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  return {
    isAvailable() {
      if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices?.getUserMedia === 'function') {
        return { available: true };
      }
      return nativeOnly('Microphone', 'audio-capture');
    },
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.start();
        return { success: true };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Microphone access denied' };
      }
    },
    async stopRecording() {
      return new Promise((resolve) => {
        if (!mediaRecorder) {
          resolve({ success: false, data: null, error: 'No recording in progress' });
          return;
        }
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          mediaRecorder?.stream.getTracks().forEach(t => t.stop());
          mediaRecorder = null;
          chunks = [];
          resolve({ success: true, data: blob });
        };
        mediaRecorder.stop();
      });
    },
  };
}

function createWebFileSystem(): FileSystemAdapter {
  return {
    isAvailable() {
      return { available: true };
    },
    async readFile() {
      return { success: false, error: 'Use pickFile() to select files in the browser' };
    },
    async writeFile(_path: string, content: string) {
      try {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = _path.split('/').pop() || 'file.txt';
        a.click();
        URL.revokeObjectURL(url);
        return { success: true };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'File write failed' };
      }
    },
    async pickFile(accept?: string) {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (accept) input.accept = accept;
        input.onchange = () => {
          const file = input.files?.[0] || null;
          resolve({ success: !!file, data: file });
        };
        input.click();
      });
    },
  };
}

function createWebNotifications(): NotificationsAdapter {
  return {
    isAvailable() {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return { available: true };
      }
      return nativeOnly('Notifications', 'push-notifications');
    },
    async requestPermission() {
      if (typeof window === 'undefined' || !('Notification' in window)) return { granted: false };
      const result = await Notification.requestPermission();
      return { granted: result === 'granted' };
    },
    async send(title: string, body: string, options?: Record<string, unknown>) {
      try {
        if (typeof window === 'undefined' || !('Notification' in window)) {
          return { success: false, error: 'Notifications not supported' };
        }
        if (Notification.permission !== 'granted') {
          return { success: false, error: 'Notification permission not granted' };
        }
        new Notification(title, { body, ...options });
        return { success: true };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Notification failed' };
      }
    },
  };
}

function createWebBiometrics(): BiometricsAdapter {
  return {
    isAvailable() {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        return { available: true };
      }
      return nativeOnly('Biometrics', 'biometric-auth');
    },
    async authenticate(reason: string) {
      try {
        if (!window.PublicKeyCredential) {
          return { success: false, error: 'WebAuthn not supported' };
        }
        void reason;
        return { success: false, error: 'Biometric authentication requires native app setup. WebAuthn available for passkeys.' };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Authentication failed' };
      }
    },
  };
}

function createWebGPS(): GPSAdapter {
  return {
    isAvailable() {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        return { available: true };
      }
      return nativeOnly('GPS', 'geolocation');
    },
    async getCurrentPosition() {
      return new Promise((resolve) => {
        if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
          resolve({ success: false, error: 'Geolocation not supported' });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ success: true, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => resolve({ success: false, error: err.message }),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });
    },
    async watchPosition(callback) {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        return { success: false, error: 'Geolocation not supported' };
      }
      const watchId = navigator.geolocation.watchPosition(
        (pos) => callback({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        undefined,
        { enableHighAccuracy: true }
      );
      return { success: true, watchId };
    },
    clearWatch(watchId: number) {
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    },
  };
}

function createNativeOnlyAdapter<T>(feature: string, nativeModule: string, methods: Record<string, (...args: unknown[]) => unknown>): T {
  const adapter: Record<string, unknown> = {
    isAvailable: () => nativeOnly(feature, nativeModule),
  };
  for (const [key, fallback] of Object.entries(methods)) {
    adapter[key] = fallback;
  }
  return adapter as T;
}

function createWebContacts(): ContactsAdapter {
  return createNativeOnlyAdapter<ContactsAdapter>('Contacts', 'contacts-access', {
    getContacts: async () => ({ success: false, error: 'Contacts access requires native app' }),
    pickContact: async () => ({ success: false, data: null, error: 'Contacts picker requires native app' }),
  });
}

function createWebBluetooth(): BluetoothAdapter {
  return {
    isAvailable() {
      if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
        return { available: true };
      }
      return nativeOnly('Bluetooth', 'bluetooth-le');
    },
    async scan() {
      return { success: false, error: 'Bluetooth scanning requires native app for full device discovery' };
    },
    async connect() {
      return { success: false, error: 'Bluetooth connection requires native app' };
    },
    async disconnect() {
      return { success: false, error: 'Bluetooth disconnection requires native app' };
    },
  };
}

function createWebNFC(): NFCAdapter {
  return createNativeOnlyAdapter<NFCAdapter>('NFC', 'nfc-reader', {
    read: async () => ({ success: false, error: 'NFC requires native app' }),
    write: async () => ({ success: false, error: 'NFC requires native app' }),
  });
}

function createWebSmartHome(): SmartHomeAdapter {
  return {
    isAvailable() {
      return {
        available: false,
        connectInstructions: 'Smart Home control requires a Home Assistant or similar hub connection. Configure in Settings > Integrations.',
        nativeModule: 'smart-home-bridge',
      };
    },
    async controlDevice() {
      return { success: false, error: 'Connect a smart home hub (Home Assistant) in Settings > Integrations' };
    },
    async listDevices() {
      return { success: false, error: 'Connect a smart home hub (Home Assistant) in Settings > Integrations' };
    },
  };
}

function createWebSystemControls(): SystemControlsAdapter {
  return createNativeOnlyAdapter<SystemControlsAdapter>('System Controls', 'system-controls', {
    setVolume: async () => ({ success: false, error: 'Volume control requires native app' }),
    setBrightness: async () => ({ success: false, error: 'Brightness control requires native app' }),
    toggleWifi: async () => ({ success: false, error: 'Wi-Fi toggle requires native app' }),
    toggleBluetooth: async () => ({ success: false, error: 'Bluetooth toggle requires native app' }),
  });
}

function createWebAdapter(): PlatformAdapter {
  return {
    platform: 'web',
    camera: createWebCamera(),
    microphone: createWebMicrophone(),
    fileSystem: createWebFileSystem(),
    notifications: createWebNotifications(),
    biometrics: createWebBiometrics(),
    gps: createWebGPS(),
    contacts: createWebContacts(),
    bluetooth: createWebBluetooth(),
    nfc: createWebNFC(),
    smartHome: createWebSmartHome(),
    systemControls: createWebSystemControls(),
  };
}

function createMobileAdapter(): PlatformAdapter {
  const web = createWebAdapter();
  return {
    ...web,
    platform: 'mobile',
  };
}

function createDesktopAdapter(): PlatformAdapter {
  const web = createWebAdapter();
  return {
    ...web,
    platform: 'desktop',
  };
}

let _adapter: PlatformAdapter | null = null;

export function getPlatformAdapter(): PlatformAdapter {
  if (!_adapter) {
    const platform = detectPlatform();
    switch (platform) {
      case 'mobile':
        _adapter = createMobileAdapter();
        break;
      case 'desktop':
        _adapter = createDesktopAdapter();
        break;
      default:
        _adapter = createWebAdapter();
    }
  }
  return _adapter;
}

export function getCurrentPlatform(): Platform {
  return detectPlatform();
}

export function getCapabilitySummary(): Record<string, PlatformCapabilityResult> {
  const adapter = getPlatformAdapter();
  return {
    camera: adapter.camera.isAvailable(),
    microphone: adapter.microphone.isAvailable(),
    fileSystem: adapter.fileSystem.isAvailable(),
    notifications: adapter.notifications.isAvailable(),
    biometrics: adapter.biometrics.isAvailable(),
    gps: adapter.gps.isAvailable(),
    contacts: adapter.contacts.isAvailable(),
    bluetooth: adapter.bluetooth.isAvailable(),
    nfc: adapter.nfc.isAvailable(),
    smartHome: adapter.smartHome.isAvailable(),
    systemControls: adapter.systemControls.isAvailable(),
  };
}

export function resetAdapter(): void {
  _adapter = null;
}
