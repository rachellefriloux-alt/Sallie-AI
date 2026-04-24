/**
 * Sallie Studio Desktop — Preload Script (Native Bridge)
 * Reference: platforms/desktop/SallieStudioApp/NativeBridge.cs
 *
 * Exposes safe native APIs to the renderer process:
 * - App info (version, platform)
 * - Local storage (electron-store)
 * - Notifications
 * - Performance monitoring
 * - Cloud sync indicators
 * - Plugin management hooks
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sallieBridge', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  isDesktop: true,

  // Persistent storage (survives app restart)
  store: {
    get: (key) => ipcRenderer.invoke('get-store-value', key),
    set: (key, value) => ipcRenderer.invoke('set-store-value', key, value),
  },

  // Native notifications
  showNotification: ({ title, body }) =>
    ipcRenderer.invoke('show-notification', { title, body }),

  // Performance monitoring
  getPerformance: () => ipcRenderer.invoke('get-performance'),

  // Event listeners for keyboard shortcuts from main process
  onOpenChat: (callback) => {
    document.addEventListener('sallie:open-chat', callback);
    return () => document.removeEventListener('sallie:open-chat', callback);
  },
  onQuickCommand: (callback) => {
    document.addEventListener('sallie:quick-command', callback);
    return () => document.removeEventListener('sallie:quick-command', callback);
  },
  onSync: (callback) => {
    document.addEventListener('sallie:sync', callback);
    return () => document.removeEventListener('sallie:sync', callback);
  },
  onVoice: (callback) => {
    document.addEventListener('sallie:voice', callback);
    return () => document.removeEventListener('sallie:voice', callback);
  },
});
