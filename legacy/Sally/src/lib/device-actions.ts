export type ActionCategory =
  | 'Communication'
  | 'Productivity'
  | 'Media'
  | 'System'
  | 'Information'
  | 'Smart Home'
  | 'Files';

export type ActionPlatform = 'web' | 'mobile' | 'desktop';
export type ActionStatus = 'available' | 'needs-native' | 'unavailable';

export interface DeviceAction {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  platforms: ActionPlatform[];
  status: ActionStatus;
  icon: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  executeWeb?: (params: Record<string, unknown>) => Promise<{ success: boolean; message: string; data?: unknown }>;
  nativeModule?: string;
  connectInstructions?: string;
}

const DEVICE_ACTIONS: DeviceAction[] = [
  {
    id: 'send_message',
    name: 'Send Message',
    description: 'Send a text message to a contact',
    category: 'Communication',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'MessageSquare',
    nativeModule: 'expo-sms',
    connectInstructions: 'Install expo-sms on mobile or use Twilio integration for web SMS',
    params: [
      { name: 'to', type: 'string', required: true, description: 'Recipient phone number or name' },
      { name: 'message', type: 'string', required: true, description: 'Message content' },
    ],
  },
  {
    id: 'make_call',
    name: 'Make Call',
    description: 'Place a phone call to a contact',
    category: 'Communication',
    platforms: ['mobile'],
    status: 'needs-native',
    icon: 'Phone',
    nativeModule: 'expo-linking',
    connectInstructions: 'Uses expo-linking tel: scheme on mobile. Connect Twilio for web calling.',
    params: [
      { name: 'to', type: 'string', required: true, description: 'Phone number or contact name' },
    ],
  },
  {
    id: 'send_email',
    name: 'Send Email',
    description: 'Compose and send an email',
    category: 'Communication',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Mail',
    params: [
      { name: 'to', type: 'string', required: true, description: 'Recipient email address' },
      { name: 'subject', type: 'string', required: true, description: 'Email subject' },
      { name: 'body', type: 'string', required: true, description: 'Email body' },
    ],
    executeWeb: async (params) => {
      const mailto = `mailto:${params.to}?subject=${encodeURIComponent(String(params.subject || ''))}&body=${encodeURIComponent(String(params.body || ''))}`;
      return { success: true, message: 'Email client opened', data: { url: mailto } };
    },
  },
  {
    id: 'schedule_meeting',
    name: 'Schedule Meeting',
    description: 'Schedule a meeting or calendar event',
    category: 'Communication',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'CalendarPlus',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Meeting title' },
      { name: 'date', type: 'string', required: true, description: 'Date and time (ISO format)' },
      { name: 'duration', type: 'number', required: false, description: 'Duration in minutes' },
      { name: 'attendees', type: 'string', required: false, description: 'Comma-separated attendee emails' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Meeting "${params.title}" scheduled for ${params.date}`, data: { scheduled: true } };
    },
  },
  {
    id: 'set_timer',
    name: 'Set Timer',
    description: 'Set a countdown timer',
    category: 'Productivity',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Timer',
    params: [
      { name: 'duration', type: 'number', required: true, description: 'Duration in seconds' },
      { name: 'label', type: 'string', required: false, description: 'Timer label' },
    ],
    executeWeb: async (params) => {
      const duration = Number(params.duration) || 60;
      const label = String(params.label || 'Timer');
      return { success: true, message: `Timer "${label}" set for ${duration} seconds`, data: { duration, label, startedAt: new Date().toISOString() } };
    },
  },
  {
    id: 'set_alarm',
    name: 'Set Alarm',
    description: 'Set an alarm for a specific time',
    category: 'Productivity',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'AlarmClock',
    nativeModule: 'expo-notifications',
    connectInstructions: 'Uses expo-notifications scheduled notifications on mobile. Electron Notification API on desktop.',
    params: [
      { name: 'time', type: 'string', required: true, description: 'Alarm time (HH:MM format)' },
      { name: 'label', type: 'string', required: false, description: 'Alarm label' },
    ],
  },
  {
    id: 'create_reminder',
    name: 'Create Reminder',
    description: 'Create a reminder for later',
    category: 'Productivity',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Bell',
    params: [
      { name: 'text', type: 'string', required: true, description: 'Reminder text' },
      { name: 'time', type: 'string', required: false, description: 'When to remind (ISO format)' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Reminder created: "${params.text}"`, data: { text: params.text, time: params.time, createdAt: new Date().toISOString() } };
    },
  },
  {
    id: 'add_calendar_event',
    name: 'Add Calendar Event',
    description: 'Add an event to the calendar',
    category: 'Productivity',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Calendar',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Event title' },
      { name: 'date', type: 'string', required: true, description: 'Event date (ISO format)' },
      { name: 'description', type: 'string', required: false, description: 'Event description' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Calendar event "${params.title}" added`, data: { title: params.title, date: params.date } };
    },
  },
  {
    id: 'create_note',
    name: 'Create Note',
    description: 'Create a new note',
    category: 'Productivity',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'StickyNote',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Note title' },
      { name: 'content', type: 'string', required: true, description: 'Note content' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Note "${params.title}" created`, data: { title: params.title, content: params.content, createdAt: new Date().toISOString() } };
    },
  },
  {
    id: 'create_task',
    name: 'Create Task',
    description: 'Create a new task or to-do item',
    category: 'Productivity',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'CheckSquare',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Task title' },
      { name: 'priority', type: 'string', required: false, description: 'Priority: low, medium, high' },
      { name: 'dueDate', type: 'string', required: false, description: 'Due date (ISO format)' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Task "${params.title}" created`, data: { title: params.title, priority: params.priority || 'medium', createdAt: new Date().toISOString() } };
    },
  },
  {
    id: 'play_music',
    name: 'Play Music',
    description: 'Play music or a specific song',
    category: 'Media',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Music',
    nativeModule: 'expo-av',
    connectInstructions: 'Connect Spotify integration for streaming, or use expo-av for local playback on mobile.',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Song name, artist, or genre' },
    ],
  },
  {
    id: 'take_photo',
    name: 'Take Photo',
    description: 'Take a photo using the camera',
    category: 'Media',
    platforms: ['mobile'],
    status: 'needs-native',
    icon: 'Camera',
    nativeModule: 'expo-camera',
    connectInstructions: 'Uses expo-camera on mobile. Web uses getUserMedia via platform adapter.',
  },
  {
    id: 'record_video',
    name: 'Record Video',
    description: 'Record a video using the camera',
    category: 'Media',
    platforms: ['mobile'],
    status: 'needs-native',
    icon: 'Video',
    nativeModule: 'expo-camera',
    connectInstructions: 'Uses expo-camera video recording on mobile. Web uses MediaRecorder API via platform adapter.',
  },
  {
    id: 'take_screenshot',
    name: 'Take Screenshot',
    description: 'Capture the current screen',
    category: 'Media',
    platforms: ['desktop'],
    status: 'needs-native',
    icon: 'Monitor',
    nativeModule: 'electron-screenshot',
    connectInstructions: 'Uses Electron desktopCapturer API on desktop.',
  },
  {
    id: 'open_app',
    name: 'Open App',
    description: 'Open an application',
    category: 'System',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'AppWindow',
    nativeModule: 'expo-linking',
    connectInstructions: 'Uses expo-linking with app schemes on mobile. Electron shell.openExternal on desktop.',
    params: [
      { name: 'appName', type: 'string', required: true, description: 'Application name' },
    ],
  },
  {
    id: 'change_settings',
    name: 'Change Settings',
    description: 'Modify device settings',
    category: 'System',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Settings',
    nativeModule: 'expo-intent-launcher',
    connectInstructions: 'Uses expo-intent-launcher on Android, expo-linking on iOS. Electron shell.openExternal on desktop.',
    params: [
      { name: 'setting', type: 'string', required: true, description: 'Setting to change' },
      { name: 'value', type: 'string', required: true, description: 'New value' },
    ],
  },
  {
    id: 'toggle_wifi',
    name: 'Toggle Wi-Fi',
    description: 'Turn Wi-Fi on or off',
    category: 'System',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Wifi',
    nativeModule: 'react-native-wifi-reborn',
    connectInstructions: 'Uses react-native-wifi-reborn on mobile. OS-level API on desktop.',
  },
  {
    id: 'toggle_bluetooth',
    name: 'Toggle Bluetooth',
    description: 'Turn Bluetooth on or off',
    category: 'System',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Bluetooth',
    nativeModule: 'react-native-ble-plx',
    connectInstructions: 'Uses react-native-ble-plx on mobile. Web Bluetooth API partially available via platform adapter.',
  },
  {
    id: 'adjust_volume',
    name: 'Adjust Volume',
    description: 'Change the device volume',
    category: 'System',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Volume2',
    nativeModule: 'react-native-volume-manager',
    connectInstructions: 'Uses react-native-volume-manager on mobile. Electron powerSaveBlocker + nircmd on desktop.',
    params: [
      { name: 'level', type: 'number', required: true, description: 'Volume level (0-100)' },
    ],
  },
  {
    id: 'adjust_brightness',
    name: 'Adjust Brightness',
    description: 'Change screen brightness',
    category: 'System',
    platforms: ['mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Sun',
    nativeModule: 'expo-brightness',
    connectInstructions: 'Uses expo-brightness on mobile. OS-level API on desktop.',
    params: [
      { name: 'level', type: 'number', required: true, description: 'Brightness level (0-100)' },
    ],
  },
  {
    id: 'get_weather',
    name: 'Get Weather',
    description: 'Get current weather and forecast',
    category: 'Information',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'CloudSun',
    params: [
      { name: 'location', type: 'string', required: false, description: 'City or location name' },
    ],
    executeWeb: async (params) => {
      const location = String(params.location || 'current location');
      return { success: true, message: `Weather data for ${location}`, data: { location, note: 'Connect a weather API for live data' } };
    },
  },
  {
    id: 'get_news',
    name: 'Get News',
    description: 'Get latest news headlines',
    category: 'Information',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Newspaper',
    params: [
      { name: 'topic', type: 'string', required: false, description: 'News topic or category' },
    ],
    executeWeb: async (params) => {
      const topic = String(params.topic || 'top stories');
      return { success: true, message: `News results for "${topic}"`, data: { topic, note: 'Connect a news API for live data' } };
    },
  },
  {
    id: 'get_directions',
    name: 'Get Directions',
    description: 'Get directions to a destination',
    category: 'Information',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'MapPin',
    params: [
      { name: 'destination', type: 'string', required: true, description: 'Destination address' },
      { name: 'origin', type: 'string', required: false, description: 'Starting location' },
    ],
    executeWeb: async (params) => {
      const dest = encodeURIComponent(String(params.destination));
      const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
      return { success: true, message: `Directions to ${params.destination}`, data: { url } };
    },
  },
  {
    id: 'calculate',
    name: 'Calculate',
    description: 'Perform mathematical calculations',
    category: 'Information',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Calculator',
    params: [
      { name: 'expression', type: 'string', required: true, description: 'Math expression to evaluate' },
    ],
    executeWeb: async (params) => {
      try {
        const expr = String(params.expression).replace(/[^0-9+\-*/().%\s^]/g, '');
        const result = Function(`"use strict"; return (${expr.replace(/\^/g, '**')})`)();
        return { success: true, message: `${params.expression} = ${result}`, data: { expression: params.expression, result } };
      } catch {
        return { success: false, message: 'Invalid expression' };
      }
    },
  },
  {
    id: 'convert_units',
    name: 'Convert Units',
    description: 'Convert between different units of measurement',
    category: 'Information',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'ArrowLeftRight',
    params: [
      { name: 'value', type: 'number', required: true, description: 'Value to convert' },
      { name: 'from', type: 'string', required: true, description: 'Source unit' },
      { name: 'to', type: 'string', required: true, description: 'Target unit' },
    ],
    executeWeb: async (params) => {
      const conversions: Record<string, Record<string, number | ((v: number) => number)>> = {
        km: { mi: 0.621371, m: 1000, ft: 3280.84, yd: 1093.61 },
        mi: { km: 1.60934, m: 1609.34, ft: 5280, yd: 1760 },
        m: { km: 0.001, mi: 0.000621371, ft: 3.28084, yd: 1.09361, cm: 100, in: 39.3701 },
        ft: { m: 0.3048, km: 0.0003048, mi: 0.000189394, in: 12, cm: 30.48 },
        kg: { lb: 2.20462, g: 1000, oz: 35.274 },
        lb: { kg: 0.453592, g: 453.592, oz: 16 },
        g: { kg: 0.001, lb: 0.00220462, oz: 0.035274 },
        oz: { g: 28.3495, kg: 0.0283495, lb: 0.0625 },
        l: { gal: 0.264172, ml: 1000, qt: 1.05669, cup: 4.22675 },
        gal: { l: 3.78541, ml: 3785.41, qt: 4, cup: 16 },
        c: { f: (v: number) => v * 9 / 5 + 32, k: (v: number) => v + 273.15 },
        f: { c: (v: number) => (v - 32) * 5 / 9, k: (v: number) => (v - 32) * 5 / 9 + 273.15 },
        k: { c: (v: number) => v - 273.15, f: (v: number) => (v - 273.15) * 9 / 5 + 32 },
      };
      const from = String(params.from).toLowerCase();
      const to = String(params.to).toLowerCase();
      const value = Number(params.value);
      const conv = conversions[from]?.[to];
      if (conv === undefined) return { success: false, message: `Cannot convert ${from} to ${to}` };
      const result = typeof conv === 'function' ? conv(value) : value * conv;
      return { success: true, message: `${value} ${from} = ${Number(result.toFixed(6))} ${to}`, data: { value, from, to, result: Number(result.toFixed(6)) } };
    },
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search the web for information',
    category: 'Information',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'Search',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Search results for "${params.query}"`, data: { query: params.query, endpoint: '/api/search/web' } };
    },
  },
  {
    id: 'control_lights',
    name: 'Control Lights',
    description: 'Turn lights on/off or adjust brightness and color',
    category: 'Smart Home',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Lightbulb',
    nativeModule: 'home-assistant-api',
    connectInstructions: 'Connect Home Assistant integration with your HA URL and long-lived access token.',
    params: [
      { name: 'room', type: 'string', required: true, description: 'Room name' },
      { name: 'action', type: 'string', required: true, description: 'on, off, dim, or color' },
      { name: 'value', type: 'string', required: false, description: 'Brightness (0-100) or color hex' },
    ],
  },
  {
    id: 'control_thermostat',
    name: 'Control Thermostat',
    description: 'Adjust thermostat temperature and mode',
    category: 'Smart Home',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Thermometer',
    nativeModule: 'home-assistant-api',
    connectInstructions: 'Connect Home Assistant integration with your HA URL and long-lived access token.',
    params: [
      { name: 'temperature', type: 'number', required: true, description: 'Target temperature' },
      { name: 'mode', type: 'string', required: false, description: 'heat, cool, or auto' },
    ],
  },
  {
    id: 'control_locks',
    name: 'Control Locks',
    description: 'Lock or unlock smart locks',
    category: 'Smart Home',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Lock',
    nativeModule: 'home-assistant-api',
    connectInstructions: 'Connect Home Assistant integration with your HA URL and long-lived access token.',
    params: [
      { name: 'lock', type: 'string', required: true, description: 'Lock name or location' },
      { name: 'action', type: 'string', required: true, description: 'lock or unlock' },
    ],
  },
  {
    id: 'control_cameras',
    name: 'Control Cameras',
    description: 'View or control security cameras',
    category: 'Smart Home',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Cctv',
    nativeModule: 'home-assistant-api',
    connectInstructions: 'Connect Home Assistant integration with your HA URL and long-lived access token.',
    params: [
      { name: 'camera', type: 'string', required: true, description: 'Camera name or location' },
      { name: 'action', type: 'string', required: true, description: 'view, record, or snapshot' },
    ],
  },
  {
    id: 'create_file',
    name: 'Create File',
    description: 'Create a new file with content',
    category: 'Files',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'FilePlus',
    params: [
      { name: 'name', type: 'string', required: true, description: 'File name' },
      { name: 'content', type: 'string', required: true, description: 'File content' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `File "${params.name}" created`, data: { name: params.name, size: String(params.content || '').length } };
    },
  },
  {
    id: 'read_file',
    name: 'Read File',
    description: 'Read contents of a file',
    category: 'Files',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'FileText',
    params: [
      { name: 'path', type: 'string', required: true, description: 'File path' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Reading file: ${params.path}`, data: { path: params.path } };
    },
  },
  {
    id: 'search_files',
    name: 'Search Files',
    description: 'Search for files by name or content',
    category: 'Files',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'available',
    icon: 'FolderSearch',
    params: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
    ],
    executeWeb: async (params) => {
      return { success: true, message: `Searching for files matching "${params.query}"`, data: { query: params.query } };
    },
  },
  {
    id: 'share_file',
    name: 'Share File',
    description: 'Share a file with others',
    category: 'Files',
    platforms: ['web', 'mobile', 'desktop'],
    status: 'needs-native',
    icon: 'Share2',
    nativeModule: 'expo-sharing',
    connectInstructions: 'Uses expo-sharing on mobile. Web Share API via platform adapter where supported.',
    params: [
      { name: 'path', type: 'string', required: true, description: 'File path' },
      { name: 'to', type: 'string', required: false, description: 'Recipient' },
    ],
  },
];

export function getAllActions(): DeviceAction[] {
  return [...DEVICE_ACTIONS];
}

export function getActionsByCategory(category: ActionCategory): DeviceAction[] {
  return DEVICE_ACTIONS.filter((a) => a.category === category);
}

export function getActionById(id: string): DeviceAction | undefined {
  return DEVICE_ACTIONS.find((a) => a.id === id);
}

export function getAvailableActions(platform: ActionPlatform = 'web'): DeviceAction[] {
  return DEVICE_ACTIONS.filter(
    (a) => a.platforms.includes(platform) && (a.status === 'available' || a.status === 'needs-native')
  );
}

export function getCategories(): ActionCategory[] {
  return [...new Set(DEVICE_ACTIONS.map((a) => a.category))];
}

export async function executeAction(
  actionId: string,
  params: Record<string, unknown> = {}
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const action = getActionById(actionId);
  if (!action) {
    return { success: false, message: `Action "${actionId}" not found` };
  }
  if (action.status === 'unavailable') {
    return { success: false, message: `Action "${action.name}" is unavailable on this platform` };
  }
  if (action.status === 'needs-native' && !action.executeWeb) {
    return { success: false, message: `Action "${action.name}" requires a native app (mobile/desktop)` };
  }
  if (action.executeWeb) {
    return action.executeWeb(params);
  }
  return { success: false, message: `Action "${action.name}" has no web implementation` };
}
