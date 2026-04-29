# └─ Sally
   |
   ├─ src/                          # Main Next.js web application
   │  ├─ app/                      # Next.js app router pages
   │  ├─ components/              # React components
   │  ├─ shared/                  # Shared services & utilities
   │  ├─ store/                   # State management (Zustand)
   │  ├─ styles/                  # CSS stylesheets
   │  └─ types/                   # TypeScript type definitions
   ├─ mobile/                      # Expo React Native mobile app
   ├─ desktop/                     # Electron desktop app
   ├─ supabase/                    # Supabase backend & Edge Functions
   ├─ prisma/                      # Prisma ORM schema
   ├─ azure/                       # Azure deployment configs
   ├─ docs/                        # Documentation
   └─ packages/                    # Shared packages
```

---

## Current Status

### ✅ Completed

- Next.js web app with app router
- Supabase authentication & database
- Mobile app with Expo
- Desktop app with Electron
- Limbic system (state management)
- Heritage system (identity persistence)
- Convergence flow (14-question onboarding)
- Genesis questions system
- Agency service implementation
- Memory service implementation

### 🚧 In Progress

- Enhanced convergence flow
- Mind map visualization
- Thought-action logging
- Multi-interface support (meli-ai, omni, presence)

### 📋 To Do

- Voice integration (TTS/STT)
  - Voice sample recording UI
  - Waveform visualization
  - Calibration wizard flow
  - Save/load voice profiles
  - Test results display
- Advanced avatar animations
  - Breathing animation (subtle chest/glow movement)
  - Blinking animation (periodic eye blinks)
  - Thinking animation (particle effects, aura shifts)
  - Emotion transitions (smooth color/shape changes)
  - Interactive hover states
- Design system
  - Design tokens defined
  - Color system implemented
  - Typography scale configured
  - Spacing system applied
  - Component library built
- Mobile enhancements
  - Mobile gold accents and shimmer effects
  - Image cache on app launch
  - Genesis phases UI for convergence page
  - App icon and splash screen
- Offline support improvements
  - Offline mode with sync queue
  - Service auto-restart on failure detection
- Performance & Testing
  - Performance benchmarks
  - Bundle optimization
  - Load testing
  - Performance regression tests
  - Add code coverage badge
  - Enable mobile builds with Android SDK
  - Unit tests for all core systems
  - E2E tests for all critical flows
  - Integration tests
- Enhanced notification system
  - Richer notification templates
  - Notification preferences (per-type)
  - Shoulder Tap animation polish
  - Veto Popup UI refinement
- PWA capabilities
- Accessibility audit (WCAG AA+)
- Storybook setup for component library
- Dark mode support
- Tablet-optimized layouts
  - Gesture controls polish
- In-app tutorial/walkthrough
- Custom keyboard shortcut configuration
- Contextual help system
- Advanced troubleshooting wizard
- Dependency update bot
- Integration tests for agency system
- Edge case tests for Dream Cycle
- Error scenario tests
- Security tests
- Sovereign Modes implementation
- Mode detection system
- Take the Wheel protocol
- Moral Friction reconciliation
- Adaptive UI with role-based layouts
- Code linting configured
- Type checking enabled
- CI/CD pipeline setup
- Windows 11 desktop app enhancements
  - System tray functionality
  - Auto-updater implementation
  - Desktop installer improvements
- Web fallback parity (Next.js mirrors mobile/desktop screens)
- Production deployment verification
  - Verify API responds at deployed URL
  - Test sign in (magic link), chat, profile, avatar upload
  - Test on target browsers
  - Verify backend connection
  - Check responsive layouts
- Mobile build verification
  - Test on physical devices
  - Verify backend connection over WiFi
  - Test offline behavior
  - Prepare screenshots for store listing
- Mobile deployment configuration
  - Configure `.env` with proper URLs
  - Start Docker services
  - Start backend API
  - Test health endpoint
  - Build production version
- Code signing setup
  - Windows code signing
  - macOS code signing
- API documentation complete
- OpenAPI/Swagger documentation
- Production build scripts
- Environment configuration guides
- Quick start guide
- Network configuration guide
- Firewall rules documentation (port 8000)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Web | Next.js 14+, React, TypeScript |
| Mobile | Expo (React Native) |
| Desktop | Electron |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| State | Zustand |
| ORM | Prisma |
