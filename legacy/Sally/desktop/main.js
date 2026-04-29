/**
 * Sallie Studio Desktop — Electron Main Process
 * Reference: platforms/desktop/SallieStudioApp/ (WinUI 3 C#)
 *
 * Features:
 * - Wraps Next.js web app
 * - Tray icon and notifications
 * - Keyboard shortcuts (16+)
 * - Performance monitoring
 * - Native bridge for desktop features
 */

const { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, Notification, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';

// Auto Updater Configuration
function configureAutoUpdater() {
  if (isDev) {
    console.log('Auto updater disabled in development');
    return;
  }

  autoUpdater.logger = console;
  autoUpdater.autoDownload = false;
  
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    showUpdateNotification(info);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
  });

  autoUpdater.on('error', (err) => {
    console.error('Auto updater error:', err);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    showUpdateReadyNotification(info);
  });

  // Check for updates on startup
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Failed to check for updates:', err);
  });

  // Check for updates every 30 minutes
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => {
      console.error('Failed to check for updates:', err);
    });
  }, 30 * 60 * 1000);
}

function showUpdateNotification(info) {
  const notification = new Notification({
    title: 'Sallie Studio Update Available',
    body: `Version ${info.version} is available. Click to download and install.`
  });

  notification.on('click', () => {
    autoUpdater.downloadUpdate().catch(err => {
      console.error('Failed to download update:', err);
    });
  });

  notification.show();
}

function showUpdateReadyNotification(info) {
  const notification = new Notification({
    title: 'Sallie Studio Update Ready',
    body: `Version ${info.version} has been downloaded. Restart to apply updates.`
  });

  notification.on('click', () => {
    autoUpdater.quitAndInstall();
  });

  notification.show();
}

const DEFAULT_URL = 'https://sallie-studio.replit.app';

let productionUrl = (process.env.SALLIE_APP_URL || '').trim();
if (!productionUrl) {
  try {
    const configPath = path.join(__dirname, 'build-config.json');
    const config = require(configPath);
    if (config && typeof config.appUrl === 'string') productionUrl = config.appUrl.trim();
  } catch (_) {}
}
const WEB_URL = isDev ? 'http://localhost:3000' : (productionUrl || DEFAULT_URL);

let mainWindow = null;
let tray = null;

function createWindow() {
  const { width, height, x, y } = store.get('windowBounds', { width: 1400, height: 900 });

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth: 800,
    minHeight: 600,
    title: 'Sallie Studio',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0F0A1A',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: true,
    },
  });

  mainWindow.loadURL(WEB_URL);

  // Save window bounds on resize/move
  mainWindow.on('resize', saveWindowBounds);
  mainWindow.on('move', saveWindowBounds);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in dev mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function saveWindowBounds() {
  if (!mainWindow) return;
  const bounds = mainWindow.getBounds();
  store.set('windowBounds', bounds);
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  try {
    tray = new Tray(nativeImage.createEmpty());
  } catch {
    // Tray icon creation may fail if assets not present
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Sallie Studio', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Dashboard', click: () => navigateTo('/dashboard') },
    { label: 'Chat', click: () => navigateTo('/presence') },
    { label: 'Limbic Engine', click: () => navigateTo('/limbic') },
    { label: 'Heritage DNA', click: () => navigateTo('/heritage') },
    { type: 'separator' },
    { 
      label: 'Check for Updates', 
      click: () => {
        autoUpdater.checkForUpdates().catch(err => {
          console.error('Failed to check for updates:', err);
        });
      }
    },
    { label: 'Settings', click: () => navigateTo('/settings') },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setToolTip('Sallie Studio');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}

function navigateTo(path) {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.webContents.executeJavaScript(`window.location.href = '${path}'`);
  }
}

function registerShortcuts() {
  // Reference: 16+ shortcuts from WinUI KeyboardShortcutService
  const shortcuts = {
    'CommandOrControl+K': () => mainWindow?.webContents.executeJavaScript("document.dispatchEvent(new CustomEvent('sallie:open-chat'))"),
    'CommandOrControl+Shift+K': () => mainWindow?.webContents.executeJavaScript("document.dispatchEvent(new CustomEvent('sallie:quick-command'))"),
    'CommandOrControl+D': () => navigateTo('/dashboard'),
    'CommandOrControl+L': () => navigateTo('/limbic'),
    'CommandOrControl+H': () => navigateTo('/heritage'),
    'CommandOrControl+G': () => navigateTo('/genesis'),
    'CommandOrControl+P': () => navigateTo('/presence'),
    'CommandOrControl+,': () => navigateTo('/settings'),
    'CommandOrControl+Shift+C': () => navigateTo('/control'),
    'CommandOrControl+Shift+O': () => navigateTo('/omnis'),
    'CommandOrControl+Shift+T': () => navigateTo('/thoughts'),
    'CommandOrControl+Shift+H': () => navigateTo('/hypotheses'),
    'CommandOrControl+Shift+M': () => navigateTo('/communication'),
    'CommandOrControl+Shift+P': () => navigateTo('/projects'),
    'CommandOrControl+Shift+S': () => mainWindow?.webContents.executeJavaScript("document.dispatchEvent(new CustomEvent('sallie:sync'))"),
    'CommandOrControl+Shift+V': () => mainWindow?.webContents.executeJavaScript("document.dispatchEvent(new CustomEvent('sallie:voice'))"),
  };

  Object.entries(shortcuts).forEach(([accel, handler]) => {
    try {
      globalShortcut.register(accel, handler);
    } catch (err) {
      console.warn(`Failed to register shortcut ${accel}:`, err.message);
    }
  });
}

// IPC handlers (Native Bridge)
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('get-store-value', (_, key) => store.get(key));
ipcMain.handle('set-store-value', (_, key, value) => store.set(key, value));
ipcMain.handle('show-notification', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});
ipcMain.handle('get-performance', () => ({
  memory: process.memoryUsage(),
  uptime: process.uptime(),
  cpu: process.cpuUsage(),
}));
ipcMain.handle('check-for-updates', () => {
  return autoUpdater.checkForUpdates().catch(err => {
    console.error('Failed to check for updates:', err);
    throw err;
  });
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();
  configureAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
