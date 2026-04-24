# Sallie v5.4.2 - AI Cognitive Partner

## Overview
Sallie is a complete AI cognitive partner mobile application with emotional intelligence, long-term memory, creative expression, and the ability to learn, grow, and truly understand you.

## Features

### Core Systems (9 Total)
1. **Limbic Engine** - Emotional processing with Trust, Warmth, Arousal, Valence tracking
2. **Memory Trinity** - Heritage DNA, Vector Memory, Working Memory
3. **Internal Monologue** - Gemini/INFJ debate for balanced responses
4. **Synthesis Engine** - Unified response generation
5. **Agency System** - Autonomous decision making
6. **Dream Cycle** - Nightly processing (scheduled jobs)
7. **Degradation System** - Realistic fatigue simulation
8. **Control System** - Full transparency and rollback
9. **Convergence** - Initial user profiling questionnaire

### Main Features
- **AI Chat Interface** - Real-time conversation with emotional context
- **50+ Tools** - Categorized capabilities (See, Hear, Create, Analyze, etc.)
- **Account Integrations** - Email, Calendar, Social Media, Smart Home, Cloud Storage
- **Project Management** - Goal tracking and progress visualization
- **Memory System** - Persistent context and learning
- **100% Privacy** - All data stored locally in MongoDB

## Architecture

### Backend (FastAPI)
- **Framework:** FastAPI with Motor (async MongoDB driver)
- **Database:** MongoDB
- **AI:** Gemini 3 Flash via Emergent LLM Key
- **Authentication:** JWT-based
- **API Prefix:** `/api`

### Frontend (Expo React Native)
- **Framework:** Expo SDK 54
- **Navigation:** Expo Router with tab navigation
- **State:** React Context + AsyncStorage
- **UI:** Native components with custom styling

## Getting Started

### Prerequisites
- MongoDB running on localhost:27017
- Node.js and Yarn
- Python 3.11+

### Installation

1. **Backend Setup:**
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

2. **Frontend Setup:**
```bash
cd /app/frontend
yarn install
yarn start
```

### Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=sallie_db
EMERGENT_LLM_KEY=sk-emergent-c216b2773A25e940eD
JWT_SECRET=sallie_secret_key_change_in_production
```

**Frontend (.env):**
```
EXPO_PUBLIC_BACKEND_URL=https://trusting-satoshi-9.preview.emergentagent.com
```

## User Flow

1. **Registration/Login** → User creates account
2. **Welcome** → Introduction to Sallie's capabilities  
3. **Integrations** → Optional account connections (Email, Calendar, etc.)
4. **Convergence** → 10-question questionnaire to understand user
5. **Main App** → Access to Chat, Tools, Home, Profile

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/history` - Get conversation history

### System
- `GET /api/limbic` - Get emotional state
- `GET /api/stats` - Get user statistics
- `GET /api/tools` - Get available tools
- `POST /api/tools/execute` - Execute a tool

### Integrations
- `GET /api/integrations` - List user integrations
- `POST /api/integrations` - Add new integration
- `DELETE /api/integrations/{id}` - Remove integration

### Convergence
- `POST /api/convergence` - Submit questionnaire answers

## MongoDB Collections

- `users` - User accounts
- `chat_messages` - Conversation history
- `memories` - Heritage, vector, and working memories
- `limbic_states` - Emotional state tracking
- `integrations` - Connected services
- `projects` - User goals and tasks
- `convergence` - Onboarding questionnaire data
- `tool_executions` - Tool usage logs

## Key Technologies

### Backend
- FastAPI 0.110.1
- Motor (AsyncIOMotorClient)
- emergentintegrations (LLM wrapper)
- PyJWT (authentication)
- bcrypt (password hashing)

### Frontend
- Expo 54.0.33
- React Native 0.81.5
- Expo Router 6.0.22
- Axios (API client)
- AsyncStorage (local storage)
- React Navigation (tabs + stack)

## Design Patterns

### Mobile-First UX
- Tab navigation for main sections
- Stack navigation for flows
- Touch-optimized components (44px minimum)
- Dark theme (#0c0c0c background)
- Purple accent (#6C63FF)

### State Management
- AuthContext for global user state
- Local state with useState/useEffect
- AsyncStorage for token persistence
- API-driven data fetching

### Security
- JWT authentication
- Password hashing with bcrypt
- Protected routes with auth middleware
- Secure credential storage (encrypted)

## Testing

### Backend Testing
All endpoints tested and functional:
- ✅ Authentication flow
- ✅ Chat with AI (Gemini integration)
- ✅ Limbic state tracking
- ✅ Tools listing and filtering
- ✅ Integration management
- ✅ Convergence processing

### Test Credentials
See `/app/memory/test_credentials.md`

## Deployment

### Production Checklist
1. Change JWT_SECRET to secure random string
2. Enable HTTPS only
3. Configure MongoDB authentication
4. Set up rate limiting
5. Enable request validation
6. Configure CORS properly
7. Set up error monitoring
8. Enable backup system

## Future Enhancements

### Planned Features
- **Dream Cycle** - Scheduled nightly processing (2 AM)
- **P2P Network** - Sallie-to-Sallie communication
- **Advanced Tools** - Camera vision, voice input, file operations
- **Creative Suite** - Art generation (Stable Diffusion), Music (MusicGen)
- **Teaching System** - Adaptive learning style detection
- **Project Manager** - Timeline estimation, progress tracking
- **Export/Import** - Data portability

### Tool Categories
- **See:** Camera, Screen Capture, OCR, Object Detection
- **Hear:** Microphone, Speech-to-Text, Tone Analysis
- **Create:** Art Gen, Music Composer, Story Writer, Code Gen
- **Analyze:** Data Science, Pattern Recognition, Sentiment
- **Communicate:** Email, Messaging, Calendar, Notifications
- **Automate:** Workflows, Scheduler, Batch Processing
- **Security:** Encryption, Key Manager, Backup

## License
All rights reserved. Sallie v5.4.2

## Credits
- **AI Model:** Google Gemini 3 Flash
- **Framework:** Expo + FastAPI
- **Database:** MongoDB
- **Deployment:** Emergent Agent Platform

---

**"Your thoughts are sacred. Your conversations are private. Your data is yours—forever."**
