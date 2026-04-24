# Sallie Cross-Platform Setup Guide

Complete step-by-step instructions for building and running Sallie on all platforms: Web, Mobile (Expo/React Native), Desktop (Electron), and Local Development.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    Supabase Cloud                        │
│  (Auth, Postgres DB, Storage, Edge Functions)            │
└────────────┬────────────────────────┬────────────────────┘
             │                        │
    ┌────────┴────────┐     ┌────────┴────────┐
    │  Next.js Web App │     │  Direct Supabase │
    │  (API + Frontend)│     │    Connection     │
    │  Port 3000/5000  │     │  (mobile auth)    │
    └────┬───────┬─────┘     └────────┬──────────┘
         │       │                    │
    ┌────┴──┐ ┌──┴───────┐   ┌──────┴──────┐
    │ Web   │ │ Desktop  │   │   Mobile    │
    │Browser│ │ Electron │   │ Expo/RN     │
    └───────┘ └──────────┘   └─────────────┘
```

All platforms share:
- **Supabase** for auth and database
- **Next.js API routes** for all business logic (`/api/*`)
- **Shared types** defined in `src/types/shared-api.ts`

---

## Required Tools by Platform

| Tool | Web (Replit) | Web (Vercel) | Mobile (Android) | Mobile (iOS) | Desktop (Windows) | Desktop (macOS) | Desktop (Linux) | Local Dev |
|------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Node.js 20+** | Built-in | CI only | Yes | Yes | Yes | Yes | Yes | Yes |
| **npm** (comes with Node.js) | Built-in | CI only | Yes | Yes | Yes | Yes | Yes | Yes |
| **Git** | Built-in | CI only | Yes | Yes | Yes | Yes | Yes | Yes |
| **VS Code** (or any editor) | N/A | Optional | Recommended | Recommended | Recommended | Recommended | Recommended | Recommended |
| **Android Studio** (SDK 34+) | N/A | N/A | Yes | N/A | N/A | N/A | N/A | N/A |
| **Xcode 15+** | N/A | N/A | N/A | Yes (macOS only) | N/A | N/A | N/A | N/A |
| **EAS CLI** | N/A | N/A | Yes | Yes | N/A | N/A | N/A | N/A |
| **Expo CLI** | N/A | N/A | Yes | Yes | N/A | N/A | N/A | N/A |
| **Electron** | N/A | N/A | N/A | N/A | Yes | Yes | Yes | N/A |
| **Visual Studio Build Tools** | N/A | N/A | N/A | N/A | Yes (for native modules) | N/A | N/A | N/A |
| **Xcode Command Line Tools** | N/A | N/A | N/A | N/A | N/A | Yes | N/A | N/A |
| **dpkg / rpm tools** | N/A | N/A | N/A | N/A | N/A | N/A | Yes | N/A |

---

## 0. Local Development Setup (All Platforms Start Here)

Before working on any platform, you need a local development environment.

### Step 1: Install Node.js 20+

Download and install from [nodejs.org](https://nodejs.org) (LTS version recommended). This also installs npm.

Verify installation:
```bash
node --version   # Should show v20.x.x or higher
npm --version    # Should show 10.x.x or higher
```

### Step 2: Install Git

Download from [git-scm.com](https://git-scm.com) (Windows/macOS) or install via package manager:
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt install git

# Windows (use installer from git-scm.com)
```

Verify:
```bash
git --version
```

### Step 3: Install VS Code (Recommended)

Download from [code.visualstudio.com](https://code.visualstudio.com). Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

### Step 4: Clone the Repository

```bash
git clone <your-repo-url>
cd Sally
```

### Step 5: Install Dependencies and Generate Prisma Client

```bash
npm install
npm run setup
```

`npm run setup` generates the Prisma client and any project scripts. Run this after the first clone and after pulling changes that touch the database schema.

### Step 6: Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set the required variables (see the Web section below for details).

---

## 1. Web App (Next.js 15)

### Option A: Run on Replit

The web app runs directly on Replit with no extra setup. The workflow is already configured:
1. Open the project on Replit
2. Environment variables are set in the Secrets tab
3. The app starts automatically via the `Next.js Dev Server` workflow
4. Access the app at the URL shown in the Webview

To deploy from Replit, use the Deploy button in the Replit interface. Replit handles hosting and HTTPS.

### Option B: Run Locally

After completing Section 0 (Local Development Setup):

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Option C: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set environment variables in the Vercel dashboard (Project Settings > Environment Variables)
4. Vercel auto-deploys on every push to `main`

Manual deploy:
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables (`.env.local`)

| Variable | Required | Where to Get It |
|----------|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Dashboard > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Yes | Supabase Dashboard > Project Settings > API > `anon` key |
| `DATABASE_URL` | Yes | Supabase Dashboard > Project Settings > Database > Connection string (URI, with `?pgbouncer=true`) |
| `DIRECT_URL` | Yes | Same page > Direct connection string |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Supabase Dashboard > Project Settings > API > `service_role` key |
| `OPENAI_API_KEY` | Optional | Azure OpenAI key (for AI chat features) |
| `AZURE_SPEECH_SERVICES_KEY` | Optional | Azure Speech Services key (for voice STT/TTS) |
| `OLLAMA_URL` | Optional | URL of local Ollama instance (e.g., `http://localhost:11434`) |
| `JWT_SECRET` | Optional | Any random string for JWT signing |

Example `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://qluhpkbwtykkcjshsqau.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIs...
DATABASE_URL=postgresql://postgres.qluhpkbwtykkcjshsqau:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.qluhpkbwtykkcjshsqau:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
OLLAMA_URL=http://localhost:11434
```

### Key API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | System health check |
| `/api/chat` | POST | Chat with Sallie |
| `/api/limbic/state` | GET/POST | Read/write limbic dimensions |
| `/api/capabilities` | GET | Browse all capabilities |
| `/api/capabilities/discover` | GET | Real-time service availability |
| `/api/control/status` | GET | Control system state |
| `/api/control/[action]` | POST | pause/resume/setAutonomy/override |
| `/api/transparency/log` | GET/POST | Action log with filtering |
| `/api/convergence` | GET/POST | Great Convergence questions/answers |
| `/api/heritage` | GET/POST | Heritage DNA data |
| `/api/consciousness` | GET | Consciousness state |
| `/api/ghost/suggestions` | GET | Ghost system suggestions |
| `/api/voice/stt` | POST | Speech-to-text |
| `/api/voice/tts` | POST | Text-to-speech |
| `/api/core/identity` | GET/POST | Core identity and values |
| `/api/kinship` | GET/POST | Multi-user context |
| `/api/sensors/activity` | GET/POST | Activity tracking |
| `/api/agency` | GET/POST | Agency system |
| `/api/dream-cycle` | GET/POST | Dream cycle state |
| `/api/settings` | GET/PUT | User settings |
| `/api/user` | GET | Current user profile |
| `/api/auth/callback` | GET | Supabase auth callback |

### Build and Verify

```bash
npm run build          # Production build
npm test               # Run all Vitest tests
npx tsc --noEmit       # Type-check only
```

---

## 2. Mobile App (Expo / React Native)

### Prerequisites

Install these tools in order:

#### Step 1: Node.js 20+ and Git (from Section 0)

#### Step 2: Install Expo CLI

```bash
npm install -g expo-cli
```

Verify:
```bash
npx expo --version
```

#### Step 3: Install EAS CLI (for building standalone apps)

```bash
npm install -g eas-cli
```

Verify:
```bash
eas --version
```

#### Step 4: Install Android Studio (for Android development)

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. During install, make sure to check:
   - Android SDK
   - Android SDK Platform (API 34 or higher)
   - Android Virtual Device (AVD)
3. Open Android Studio > More Actions > SDK Manager
4. Under "SDK Platforms," install Android 14 (API 34)
5. Under "SDK Tools," install:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator
6. Set environment variables (add to your shell profile):

```bash
# macOS/Linux (~/.bashrc, ~/.zshrc, etc.)
export ANDROID_HOME=$HOME/Library/Android/sdk    # macOS
export ANDROID_HOME=$HOME/Android/Sdk            # Linux
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows (System Environment Variables)
# ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk
# Add to PATH: %ANDROID_HOME%\emulator and %ANDROID_HOME%\platform-tools
```

#### Step 5: Install Xcode (iOS development, macOS only)

1. Install Xcode 15+ from the Mac App Store
2. Open Xcode and accept the license agreement
3. Install Command Line Tools:
```bash
xcode-select --install
```
4. Install CocoaPods:
```bash
sudo gem install cocoapods
```

### Setup

```bash
cd mobile
npm install
```

### Environment Variables

Create `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://qluhpkbwtykkcjshsqau.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

| Variable | Value |
|----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same as `NEXT_PUBLIC_SUPABASE_URL` from the web app |
| `EXPO_PUBLIC_SUPABASE_KEY` | Same as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` from the web app |
| `EXPO_PUBLIC_API_URL` | Your web app URL: `http://<your-machine-ip>:3000` for local testing, or `https://your-app.vercel.app` for a deployed app |

When testing on a physical device on the same Wi-Fi:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

Replace `192.168.1.100` with your computer's actual local IP address.

### Running in Development

```bash
cd mobile
npx expo start
```

- **Android emulator**: Press `a` in the terminal
- **iOS simulator** (macOS only): Press `i` in the terminal
- **Physical device**: Scan the QR code with Expo Go (Android) or the Camera app (iOS)

### Building Standalone Apps

#### Development build (for testing on device):
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

#### Preview build (internal testing):
```bash
eas build --profile preview --platform all
```

#### Production build (for app stores):
```bash
eas build --profile production --platform all
```

#### Local build without EAS (requires native SDKs):
```bash
# Android (requires Android Studio)
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
cd ..

# iOS (requires Mac + Xcode)
npx expo prebuild --platform ios
cd ios && xcodebuild
cd ..
```

#### Submit to app stores:
```bash
eas submit --platform ios
eas submit --platform android
```

### Supabase Auth Setup for Mobile

In the Supabase Dashboard:
1. Go to Authentication > URL Configuration > Redirect URLs
2. Add `sallie://` (the app's deep-link scheme)
3. This allows sign-in to redirect back to the mobile app

### Key Files

| File | Purpose |
|------|---------|
| `mobile/app.json` | Expo app config (scheme: `sallie`, bundle ID: `com.sallie.studio`) |
| `mobile/eas.json` | EAS build profiles with env vars per environment |
| `mobile/app/lib/api-config.ts` | API URL configuration |
| `mobile/app/lib/supabase.ts` | Supabase client for auth |
| `mobile/src/services/api_client.ts` | Full API client (all Next.js endpoints) |
| `mobile/app/(tabs)/` | Main tab screens (Home, Chat, Features, Profile) |
| `mobile/app/lib/constants.ts` | Colors, images, feature definitions |

### Deep Linking

The app uses `sallie://` scheme for deep links:
- `sallie://auth/callback` — Supabase auth redirect
- Configured in `mobile/app.json` under `scheme`
- Android: Intent filter in `app.json` > `android.intentFilters`
- iOS: Associated Domains configured in `app.json` > `ios`

### API Client

`mobile/src/services/api_client.ts` provides typed methods for all API endpoints:
- `chat(message)` — send chat message
- `getLimbicState()` / `updateLimbicState(state)` — limbic dimensions
- `getCapabilities(params)` — capability registry
- `getControlStatus()` — control system
- `getTransparencyLog(params)` / `logAction(params)` — action log
- `getConsciousness(params)` — consciousness state
- `getConvergenceQuestions()` / `submitConvergenceAnswer(answer)` — onboarding
- `speechToText(audioBlob)` / `textToSpeech(text)` — voice
- `healthCheck()` — system health

---

## 3. Desktop App (Electron)

### Prerequisites

#### Step 1: Node.js 20+ and Git (from Section 0)

#### Step 2: Platform-Specific Build Tools

**Windows:**
1. Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Select "Desktop development with C++" workload
   - This is needed for compiling native Node.js modules
2. Or install the full Visual Studio Community edition with C++ workload

**macOS:**
1. Install Xcode Command Line Tools:
```bash
xcode-select --install
```

**Linux:**
1. Install build essentials and packaging tools:
```bash
# Ubuntu/Debian
sudo apt install build-essential dpkg fakeroot rpm

# Fedora
sudo dnf groupinstall "Development Tools"
sudo dnf install rpm-build
```

### Setup

```bash
cd desktop
npm install
```

### Environment Variables

Set before running or building:
```env
SALLIE_APP_URL=https://your-deployed-sallie-url.com
NODE_ENV=development
```

For local development, point to the locally running web app:
```env
SALLIE_APP_URL=http://localhost:3000
NODE_ENV=development
```

For production builds, point to the deployed URL:
```env
SALLIE_APP_URL=https://sallie-studio.replit.app
NODE_ENV=production
```

### Running in Development

1. Start the web app first (in the project root):
```bash
npm run dev
```

2. In a separate terminal, start the desktop app:
```bash
cd desktop
SALLIE_APP_URL=http://localhost:3000 npm run dev
```

The Electron window will open and load the web app.

### Building for Distribution

The build script (`scripts/write-build-config.js`) bakes the production URL into `build-config.json` so the app knows where to load from.

```bash
# Windows (NSIS installer)
SALLIE_APP_URL=https://your-url.com npm run build:win

# macOS (DMG)
SALLIE_APP_URL=https://your-url.com npm run build:mac

# Linux (AppImage)
SALLIE_APP_URL=https://your-url.com npm run build:linux
```

Built files appear in `desktop/dist/`.

### Key Files

| File | Purpose |
|------|---------|
| `desktop/main.js` | Electron main process — creates window, handles tray, shortcuts |
| `desktop/preload.js` | Native bridge (`window.sallieBridge`) exposed to the web app |
| `desktop/scripts/write-build-config.js` | Bakes `SALLIE_APP_URL` into `build-config.json` for production |
| `desktop/package.json` | Electron dependencies and electron-builder config |
| `desktop/forge.config.js` | Electron Forge config (alternative build system) |
| `desktop/assets/` | App icons (`.ico`, `.icns`, `.png`) |

### Native Bridge API

The desktop app exposes `window.sallieBridge` to the web app:
```javascript
sallieBridge.getAppVersion()             // App version string
sallieBridge.getPlatform()               // 'win32' | 'darwin' | 'linux'
sallieBridge.isDesktop                   // true
sallieBridge.store.get(key)              // Persistent local storage
sallieBridge.store.set(key, val)         // Persistent local storage
sallieBridge.showNotification({ title, body })  // Native notifications
sallieBridge.getPerformance()            // Memory, uptime, CPU stats
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open chat |
| `Ctrl+Shift+K` | Quick command |
| `Ctrl+D` | Dashboard |
| `Ctrl+L` | Limbic engine |
| `Ctrl+H` | Heritage browser |
| `Ctrl+G` | Genesis |
| `Ctrl+P` | Presence/chat |
| `Ctrl+,` | Settings |
| `Ctrl+Shift+V` | Voice mode |

---

## 4. Connecting to the Same Supabase Backend

All platforms connect to the same Supabase project. This is how data syncs across devices.

### Supabase Project Details

- **Project ref**: `qluhpkbwtykkcjshsqau`
- **Auth providers**: Email/password, magic link
- **Key tables**: `profiles`, `heritage_dna`, `conversations`, `messages`, `streaks`, `controlLog`

### How Each Platform Connects

| Platform | Auth Method | API Method | Database Access |
|----------|-------------|------------|-----------------|
| **Web** | Supabase SSR cookies | Next.js API routes (direct) | Prisma ORM (server-side) |
| **Mobile** | Supabase JS client + deep linking | HTTP calls to Next.js API | Via API routes only |
| **Desktop** | Same as Web (embedded browser) | Same as Web (embedded browser) | Via API routes only |

### Supabase Setup Checklist

1. Create a project at [supabase.com](https://supabase.com)
2. Note your Project URL and anon key from Project Settings > API
3. Note the database connection strings from Project Settings > Database
4. Under Authentication > URL Configuration > Redirect URLs, add:
   - `http://localhost:3000` (for local web development)
   - `https://your-deployed-url.com` (for production web)
   - `sallie://` (for mobile deep linking)
5. Run database migrations:
```bash
npx prisma db push
```

### Prisma Schema

Located at `prisma/schema.prisma`. After schema changes:
```bash
npx prisma generate      # Regenerate the Prisma client
npx prisma db push       # Push schema changes to the database
npx prisma migrate dev   # Create a migration file (for version control)
```

### Shared Types

`src/types/shared-api.ts` defines all cross-platform API types:
- `ChatRequest` / `ChatResponse`
- `LimbicState` (dimensions)
- `Capability`, `CapabilityStatus`, `CapabilityCategory`
- `ControlState`, `ControlOverride`
- `TransparencyLogEntry`, `AdvisoryLevel`
- `HeritageAnswer`
- `ConsciousnessState`
- `ServiceCheck`, `DiscoveryResult`

---

## 5. Native Modules Required for Mobile/Desktop

Some features require native modules that are not available in the browser. The table below lists all native modules referenced in the device action framework (`src/lib/device-actions.ts`).

### Mobile (Expo/React Native) Native Modules

| Module | What It Does | Install Command |
|--------|-------------|-----------------|
| `expo-sms` | Send text messages | `npx expo install expo-sms` |
| `expo-linking` | Open apps, make phone calls, deep links | `npx expo install expo-linking` (already included) |
| `expo-notifications` | Alarms, scheduled notifications, push | `npx expo install expo-notifications` |
| `expo-av` | Audio/video playback | `npx expo install expo-av` |
| `expo-camera` | Take photos and record video | `npx expo install expo-camera` |
| `expo-brightness` | Adjust screen brightness | `npx expo install expo-brightness` |
| `expo-sharing` | Share files with other apps | `npx expo install expo-sharing` |
| `expo-intent-launcher` | Open device settings (Android) | `npx expo install expo-intent-launcher` |
| `react-native-wifi-reborn` | Toggle Wi-Fi on/off | `npm install react-native-wifi-reborn` |
| `react-native-ble-plx` | Bluetooth Low Energy scanning/connecting | `npm install react-native-ble-plx` |
| `react-native-volume-manager` | Adjust device volume | `npm install react-native-volume-manager` |

Install all at once:
```bash
cd mobile
npx expo install expo-sms expo-notifications expo-av expo-camera expo-brightness expo-sharing expo-intent-launcher
npm install react-native-wifi-reborn react-native-ble-plx react-native-volume-manager
```

### Desktop (Electron) Native Modules

| Module | What It Does | Notes |
|--------|-------------|-------|
| `electron` (built-in `desktopCapturer`) | Take screenshots | No extra install needed |
| `electron` (built-in `shell`) | Open apps and URLs | No extra install needed |
| `electron-store` | Persistent local storage | Already included in `desktop/package.json` |
| `electron-updater` | Auto-update the app | Already included in `desktop/package.json` |

### Smart Home Integration (All Platforms)

| Module | What It Does | Setup |
|--------|-------------|-------|
| `home-assistant-api` | Control lights, thermostat, locks, cameras | Requires a Home Assistant hub. Configure the hub URL and long-lived access token in Settings > Integrations. |

### Platform Adapter

The file `src/lib/platform-adapter.ts` provides a unified abstraction layer for hardware features:
- Camera, Microphone, File System, Notifications
- Biometrics, GPS, Contacts, Bluetooth, NFC
- Smart Home, System Controls

On the web, browser APIs are used where available (camera via getUserMedia, geolocation, Web Notifications, etc.). On mobile and desktop, the platform adapter serves as a hook point where native module implementations can be plugged in.

---

## 6. What Works Where

### Web (Replit / Vercel / Any Host)

| Feature | Status |
|---------|--------|
| Chat with AI | Available (requires Azure OpenAI or Ollama key) |
| Limbic Engine | Available |
| Heritage DNA / Great Convergence | Available |
| Capability Browser | Available |
| Transparency Log | Available |
| Control System (pause/resume/override) | Available |
| Ghost Notifications | Available |
| Consciousness Monitoring | Available |
| Voice (STT/TTS) | Available (requires Azure Speech key) |
| Core Identity Protection | Available |
| Agency System | Available |
| Dream Cycle | Available |
| Mind Map | Available |
| CopyMind / Meli AI | Available |
| Growth and Life Management | Available |

### Mobile (Requires Separate Build)

| Feature | Status |
|---------|--------|
| All web features via API | Requires deployed web app URL |
| Native push notifications | Requires EAS build + `expo-notifications` |
| Haptic feedback | Requires native build + `expo-haptics` (already included) |
| Biometric auth | Requires native build |
| Deep linking (`sallie://`) | Configured |
| Offline mode | Partial (AsyncStorage cache) |
| SMS, Phone calls | Requires `expo-sms`, `expo-linking` |
| Camera, Video | Requires `expo-camera` |
| Brightness, Volume | Requires `expo-brightness`, `react-native-volume-manager` |

### Desktop (Requires Separate Build)

| Feature | Status |
|---------|--------|
| All web features (embedded) | Requires deployed web app URL |
| System tray | Configured |
| Native notifications | Configured |
| Keyboard shortcuts (16+) | Configured |
| Auto-updater | Configured (needs update server) |
| Window state persistence | Configured |
| Performance monitoring | Configured |
| Screenshots | Available via `desktopCapturer` |

### Not Feasible on Any Web Platform

| Feature | Requirement |
|---------|-------------|
| Local Stable Diffusion | GPU + model weights |
| Local Whisper STT | GPU + model weights |
| MusicGen composition | GPU + model weights |
| QLoRA fine-tuning | GPU + large VRAM |
| Qdrant vector DB | Separate infrastructure |
| libp2p networking | Native runtime |
| Blockchain anchoring | Separate infrastructure |
| TPM/Secure Enclave | Hardware access |
| System file access | Desktop app only |
| System commands | Desktop app only |

---

## 7. Testing

### Web Tests
```bash
npm test                    # Run all Vitest tests
npm run build               # Verify production build
npx tsc --noEmit            # Type check
```

### Mobile Tests
```bash
cd mobile
npx expo start              # Verify dev server starts
eas build --profile preview # Verify build configuration
```

### Desktop Tests
```bash
cd desktop
npm run dev                 # Verify Electron launches
npm run build               # Verify packaging works
```

---

## 8. Deployment Checklist

### Before Going Live

- [ ] Set all environment variables in production (Replit Secrets, Vercel Environment Variables, or `.env.production`)
- [ ] Run `npx prisma db push` against the production database
- [ ] Run `npm run build` to verify no build errors
- [ ] Run `npm test` to verify all tests pass
- [ ] Set `SALLIE_APP_URL` for desktop and mobile builds to the deployed web URL
- [ ] Update `mobile/eas.json` production `EXPO_PUBLIC_API_URL` to the deployed web URL
- [ ] In Supabase, add the deployed URL to Authentication > Redirect URLs
- [ ] Generate desktop build: `SALLIE_APP_URL=https://... npm run build:win`
- [ ] Generate mobile build: `eas build --profile production`

### After Going Live

- [ ] Verify `/api/health` returns `status: ok`
- [ ] Verify `/api/capabilities/discover` shows service status
- [ ] Test chat functionality end-to-end
- [ ] Test Genesis/Convergence flow
- [ ] Verify mobile app connects to deployed API
- [ ] Verify desktop app loads deployed URL

---

## 9. Troubleshooting

| Issue | What to Do |
|-------|------------|
| **"Unauthorized" or sign-in fails** | Check Supabase URL and anon key in `.env.local` (web) and `mobile/.env`. Add your app's redirect URL (e.g., `sallie://`) in Supabase Auth > Redirect URLs. |
| **Chat not working** | Ensure you have either `OLLAMA_URL` (for local AI) or `OPENAI_API_KEY` / `AZURE_OPENAI_API_KEY` set. |
| **Chat not working on mobile** | Ensure `EXPO_PUBLIC_API_URL` in `mobile/.env` is reachable from the device (same Wi-Fi and correct IP, or a deployed HTTPS URL). |
| **Prisma errors / database issues** | Run `npx prisma generate` then `npx prisma db push`. For Supabase migrations, run the SQL files in `supabase/migrations/` in order via the SQL Editor. |
| **Desktop app shows a blank page** | Set `SALLIE_APP_URL` to your web app URL (e.g., `http://localhost:3000` or your production URL) and rebuild. |
| **Mobile API errors** | Ensure you're signed in and `EXPO_PUBLIC_API_URL` points to the same Next.js app you use in the browser. |
| **Android build fails** | Verify Android SDK is installed (API 34+), `ANDROID_HOME` is set, and build tools are available. Run `npx expo doctor` for diagnostics. |
| **iOS build fails** | Verify Xcode 15+ is installed, CocoaPods is installed (`sudo gem install cocoapods`), and run `cd ios && pod install`. |
| **Desktop build fails on Windows** | Install Visual Studio Build Tools with the "Desktop development with C++" workload. |
| **Native module not found** | Run `npx expo install <module-name>` for Expo modules or `npm install <module-name>` for community modules, then rebuild. |
| **Data not syncing across platforms** | Make sure you're signed in with the same Supabase account on all platforms and all platforms point to the same web app URL. |
