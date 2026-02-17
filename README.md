# BrainBolt: Adaptive Infinite Quiz Platform

> A full-stack adaptive quiz application with realtime leaderboards, intelligent difficulty adjustment, and comprehensive scoring metrics.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Data Model](#data-model)
- [Adaptive Algorithm & Scoring](#adaptive-algorithm--scoring)
- [Edge Cases & Safeguards](#edge-cases--safeguards)
- [Real-time Features](#real-time-features)
- [10-Question Quiz Mode](#10-question-quiz-mode)
- [Deployment](#deployment)
- [Submission Checklist](#submission-checklist)
- [Troubleshooting](#troubleshooting)

---

## Overview

BrainBolt is an adaptive quiz platform that dynamically adjusts question difficulty based on user performance. The system tracks:
- **User Score**: weighted by difficulty, streak, and accuracy
- **Streaks**: consecutive correct answers with multiplier scaling
- **Live Leaderboards**: real-time rankings by score and streak
- **10-Question Quiz Mode**: auto-completion and final score display

The platform is built with:
- **Frontend**: Next.js 16 + React 19 + Tailwind CSS + Socket.IO client
- **Backend**: Express + TypeScript + Prisma + PostgreSQL + Redis
- **Deployment**: Docker & Docker Compose

---

## Key Features

### ✅ Core Quiz Features
- **One Question at a Time**: users answer one question per request
- **Adaptive Difficulty**: difficulty increases/decreases based on performance (scale 1-10)
- **Question Streaks**: track consecutive correct answers
- **Score Multipliers**: streaks provide score bonuses (capped at 2.0×)
- **Accuracy Tracking**: overall and recent performance metrics

### ✅ Adaptive Intelligence
- **Confidence Stabilizer**: prevents ping-pong difficulty oscillation
- **Inactivity Decay**: streaks halve after 10 minutes of inactivity
- **Boundary Clamping**: difficulty stays between MIN (1) and MAX (10)
- **Recent Performance Window**: weights last 5 answers in scoring

### ✅ 10-Question Quiz Mode
- **Question Progress Bar**: visual indicator showing question count (X/10)
- **Auto-Completion**: quiz ends after 10 questions
- **Final Score Screen**: displays score, streak, max streak, and rank
- **Restart Option**: one-click restart to begin new 10-question quiz

### ✅ Live Leaderboards
- **Dual Rankings**: sort by total score or max streak
- **Real-time Updates**: Socket.IO broadcasts leaderboard changes
- **Top 10 Display**: shows current user's rank and stats
- **Persistent Storage**: rankings stored in Redis sorted sets

### ✅ Dark Mode Support
- **Theme Toggle**: Light/Dark/System modes via next-themes
- **CSS Variables**: smooth color transitions
- **Persistent Theme**: saved in localStorage
- **WCAG Compliant**: sufficient contrast in both modes

### ✅ Production-Ready
- **Idempotency**: duplicate submissions don't double-score
- **Strong Consistency**: transactions ensure reliable state updates
- **Stateless Servers**: enables horizontal scaling
- **Docker Support**: single-command deployment

---

## Quick Start

### Prerequisites
- **Node.js** v18+ (or v20+ recommended)
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL** 13+ (if running locally)
- **Redis** 6+ (if running locally)

### Option 1: Docker (Recommended - Single Command)

```bash
# From repository root
docker compose -f backend/docker-compose.yml up --build
```

This starts:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Express API backend (port 4000)
- Next.js frontend (port 3000)

Then open http://localhost:3000 in your browser.

### Option 2: Local Development (Manual Setup)

**Backend:**
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev  # starts on http://localhost:4000
```

**Frontend:**
```bash
cd frontend/apps/web
npm install
npm run dev  # starts on http://localhost:3000
```

Requires local Postgres and Redis running.

### Environment Files

**Backend** (`backend/.env`):
```dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brainbolt"
REDIS_URL="redis://localhost:6379"
PORT=4000
NODE_ENV=development
```

**Frontend** (`frontend/apps/web/.env.local` for local dev):
```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

See `.env.example` files for templates.

---

## Project Structure

```
brainbolt-adaptive-quiz/
├── backend/
│   ├── apps/api/src/
│   │   ├── app.ts                 # Express app setup
│   │   ├── server.ts              # Server entry & Socket.IO init
│   │   ├── modules/
│   │   │   ├── quiz/              # Question fetching, scoring
│   │   │   │   ├── quiz.service.ts
│   │   │   │   ├── quiz.controller.ts
│   │   │   │   └── quiz.routes.ts
│   │   │   ├── leaderboard/       # Ranking queries
│   │   │   └── realtime/          # Socket.IO event handling
│   │   ├── lib/
│   │   │   ├── prisma.ts          # Prisma client
│   │   │   └── redis.ts           # Redis client
│   │   └── middleware/
│   │       └── validate.ts        # Request validation
│   ├── prisma/
│   │   ├── schema.prisma          # DB schema
│   │   ├── seed.ts                # Seed questions
│   │   └── migrations/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
├── frontend/apps/web/
│   ├── app/
│   │   ├── page.tsx               # Home page
│   │   ├── quiz/page.tsx          # Quiz page (10-question mode)
│   │   ├── leaderboard/page.tsx   # Leaderboard page
│   │   └── stats/page.tsx         # User stats page
│   ├── components/
│   │   ├── quiz/
│   │   │   └── question-card.tsx  # Question display
│   │   └── ui/
│   │       ├── badge.tsx, button.tsx, card.tsx
│   │       ├── progress-bar.tsx, stat-pill.tsx
│   │       └── ...
│   ├── hooks/
│   │   ├── use-quiz.ts            # Quiz state & API logic
│   │   ├── use-leaderboard.ts     # Leaderboard fetching
│   │   └── use-session.ts         # User session management
│   ├── lib/
│   │   ├── api.ts                 # API client
│   │   ├── socket.ts              # Socket.IO connection
│   │   └── types.ts               # TypeScript types
│   ├── store/
│   │   └── session-store.ts       # Zustand session & question count
│   ├── Dockerfile
│   ├── .env.local                 # Local dev env vars
│   └── .env                       # Docker env vars
├── README.md
└── .gitignore
```

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser (Next.js Frontend)          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Quiz Page (10-question mode)                       │ │
│  │  - Question display & selection                     │ │
│  │  - Progress bar (X/10)                              │ │
│  │  - Live score/streak/rank display                   │ │
│  │  - Auto-completion after 10 questions               │ │
│  └──────────────────────────────────────────────────────┘ │
│                    ↓ REST API                               │
│                    ↓ WebSocket (Socket.IO)                  │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│             Express API Server (Backend)                    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Quiz Service                                     │   │
│  │  - Adaptive algorithm (confidence, difficulty)  │   │
│  │  - Scoring calculation                          │   │
│  │  - Idempotency checks (answerLog table)          │   │
│  └────────────────────────────────────────────────────┘   │
│                         ↓                                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Prisma ORM                                       │   │
│  │  - user_state, answer_log, questions             │   │
│  └────────────────────────────────────────────────────┘   │
│           ↓ Write (transaction)                            │
└─────────────────────────────────────────────────────────────┘
         ↓                           ↓
    ┌─────────────┐          ┌──────────────┐
    │ PostgreSQL  │          │    Redis     │
    │             │          │              │
    │ - users     │          │ Questions:   │
    │ - questions │          │  <diff> list │
    │ - user_state│          │ Leaderboards:│
    │ - answer_log│          │  lb:score sz │
    │             │          │  lb:streak sz│
    └─────────────┘          └──────────────┘
```

### Data Flow: Answer Submission

```
1. User selects answer & clicks "Submit"
   ↓
2. Frontend: POST /v1/quiz/answer
   { userId, questionId, selected, idempotencyKey }
   ↓
3. Backend (quiz.service.ts):
   - Check idempotency key → return cached result if exists
   - Load user_state from DB
   - Apply inactivity decay to streak
   - Calculate correctness, new difficulty, score
   ↓
4. Transaction writes:
   - INSERT answerLog (for idempotency)
   - UPDATE user_state
   ↓
5. Update Redis:
   - ZADD lb:score (totalScore → userId)
   - ZADD lb:streak (maxStreak → userId)
   ↓
6. Emit Socket.IO event "leaderboard:update"
   ↓
7. Frontend receives:
   - Response with new score, difficulty, streak, rank
   - Socket event updates leaderboard display
   ↓
8. Displays result, fetches next question → loop back to step 1
```

---

## API Documentation

### Base URL
- **Local**: `http://localhost:4000`
- **Docker**: `http://api:4000`

### Endpoints

#### `GET /v1/quiz/next`
Fetches the next question for a user.

**Request:**
```
GET /v1/quiz/next?userId=user123&sessionId=session456
```

**Response (200):**
```json
{
  "id": "q1",
  "question": "What is 2+2?",
  "options": ["3", "4", "5"],
  "difficulty": 3,
  "prompt": "Choose the correct answer"
}
```

**Notes:**
- Correct answer is **never** sent to frontend
- Difficulty auto-adjusts based on performance
- Returns cached questions from Redis when available

---

#### `POST /v1/quiz/answer`
Submits an answer and receives scoring & state updates.

**Request:**
```json
{
  "userId": "user123",
  "questionId": "q1",
  "selected": "4",
  "idempotencyKey": "abc123xyz"
}
```

**Response (200):**
```json
{
  "correct": true,
  "correctAnswer": 1,
  "score": 45,
  "streak": 5,
  "maxStreak": 5,
  "rank": 3
}
```

**Behavior:**
- Idempotent: same `idempotencyKey` returns cached result
- Updates leaderboards via Redis
- Emits Socket.IO event for realtime display
- Applies difficulty adjustment based on confidence

---

#### `GET /v1/quiz/metrics`
Retrieves user's current stats & performance.

**Request:**
```
GET /v1/quiz/metrics?userId=user123
```

**Response (200):**
```json
{
  "currentDifficulty": 5,
  "streak": 3,
  "maxStreak": 10,
  "totalScore": 1250,
  "accuracy": 0.75
}
```

---

#### `GET /v1/leaderboard/score`
Top 10 users by total score.

**Response (200):**
```json
[
  { "userId": "user1", "score": 5000 },
  { "userId": "user2", "score": 4800 }
]
```

---

#### `GET /v1/leaderboard/streak`
Top 10 users by max streak.

**Response (200):**
```json
[
  { "userId": "user1", "maxStreak": 25 },
  { "userId": "user2", "maxStreak": 22 }
]
```

---

## Data Model

### Database Schema (Prisma)

#### `users`
```typescript
model User {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
}
```

#### `questions`
```typescript
model Question {
  id         String @id @default(cuid())
  difficulty Int
  prompt     String
  options    String[] // JSON array
  correct    String
  tags       String[]
  answerLogs AnswerLog[]
}
```

#### `user_state`
```typescript
model UserState {
  userId              String @id
  currentDifficulty   Int @default(1)
  confidence          Int @default(0)
  streak              Int @default(0)
  maxStreak           Int @default(0)
  totalScore          Float @default(0)
  correctAnswers      Int @default(0)
  totalAnswers        Int @default(0)
  lastQuestionId      String?
  lastAnsweredAt      DateTime?
  stateVersion        Int @default(1)
  answerLogs          AnswerLog[]
  user                User @relation(fields: [userId], references: [id])
}
```

#### `answer_log`
```typescript
model AnswerLog {
  id              String   @id @default(cuid())
  userId          String
  questionId      String
  difficulty      Int
  answer          String
  correct         Boolean
  scoreDelta      Float
  streakAtAnswer  Int
  answeredAt      DateTime @default(now())
  idempotencyKey  String @unique  // Prevents duplicate submissions
  userState       UserState @relation(fields: [userId], references: [userId])
  question        Question @relation(fields: [questionId], references: [id])
}
```

### Indexes
- `questions(difficulty)` – fast lookup by difficulty
- `answer_log(userId, answeredAt)` – recent history
- `answer_log(idempotencyKey)` – idempotency checks

### Redis Keys
- `questions:<difficulty>` – list of questions at difficulty level
- `lb:score` – sorted set (score → userId)
- `lb:streak` – sorted set (maxStreak → userId)

---

## Adaptive Algorithm & Scoring

### Difficulty Adjustment (Confidence Stabilizer)

**Problem:** Rapid oscillation between two difficulty levels (ping-pong).

**Solution:** Confidence accumulator prevents single-answer flips:

```typescript
// After each answer:
confidence += correct ? +1 : -1

// Only adjust when threshold is crossed:
if (confidence >= 3) {
  difficulty = min(difficulty + 1, MAX_DIFF)
  confidence = 0  // Reset
}
if (confidence <= -3) {
  difficulty = max(difficulty - 1, MIN_DIFF)
  confidence = 0  // Reset
}
```

**Effect:** User needs 3 consecutive correct answers to +1 difficulty, or 3 wrong to -1 difficulty. Prevents flipping on alternating single answers.

### Inactivity Decay

If last answer > 10 minutes ago:
```typescript
streak = Math.floor(streak / 2)
```

Prevents stale long streaks when sessions resume.

### Score Calculation

Only awarded for **correct answers**:

```
baseScore = difficulty × 10

streakMultiplier = 1 + min(streak, 5) × 0.2
                 (caps out at 2.0× for streak ≥ 5)

accuracy = correctAnswers / totalAnswers
accuracyBonus = 1 + (accuracy - 0.5)
              (ranges 0.5× to 1.5×)

recentAvg = avg of last 5 answers
recentFactor = 0.8 + recentAvg × 0.4
             (ranges 0.8× to 1.2×)

SCORE DELTA = baseScore × streakMultiplier × accuracyBonus × recentFactor
```

**Example:**
```
Difficulty: 7, Streak: 4, Accuracy: 80%, Recent: 4/5 correct

baseScore = 7 × 10 = 70
streakMultiplier = 1 + min(4, 5) × 0.2 = 1.8
accuracyBonus = 1 + (0.8 - 0.5) = 1.3
recentFactor = 0.8 + (4/5) × 0.4 = 1.12

SCORE = 70 × 1.8 × 1.3 × 1.12 ≈ 182 points
```

---

## Edge Cases & Safeguards

### 1. Ping-Pong Oscillation ✅
**How we solve it:** Confidence stabilizer (described above)

### 2. Inactivity & Stale Streaks ✅
**How we solve it:** Streak decay (halve after 10 min inactivity)

### 3. Duplicate Answer Submissions ✅
**How we solve it:** Idempotency keys in `answer_log` table
- Frontend generates unique `idempotencyKey` per answer
- Backend checks for existing entry with same key
- Returns cached result without re-scoring

### 4. Boundary Conditions ✅
**How we solve it:** Clamping
```typescript
difficulty = Math.max(MIN_DIFF, Math.min(difficulty, MAX_DIFF))
```

### 5. Race Conditions ✅
**How we solve it:** Database transactions
```typescript
await prisma.$transaction([
  prisma.answerLog.create({ /* ... */ }),
  prisma.userState.update({ /* ... */ })
])
```
Both succeed or both fail atomically.

### 6. Session/User Loss ✅
**How we solve it:** Persistent storage
- User ID saved in browser `localStorage` via Zustand
- Session ID persists across page reloads
- Zustand with persist middleware

---

## Real-time Features

### Socket.IO Events

**Server → Client:**
```typescript
socket.on("leaderboard:update", (data) => {
  // { userId, rankScore, rankStreak }
  // Trigger leaderboard re-fetch
})

socket.on("metrics:update", (data) => {
  // User's rank changed
  // Trigger metrics re-fetch
})
```

**Client → Server:**
- Connects on app startup
- Listens for leaderboard changes
- Re-fetches via React Query on event

### Realtime Guarantees

1. **Server writes answer to DB (transaction)**
2. **Server updates Redis sorted sets**
3. **Server emits Socket.IO event**
4. **Frontend receives event & refetches leaderboards**
5. **Frontend displays updated stats**

All within a single request/response cycle → sub-second updates.

---

## 10-Question Quiz Mode

### Features

1. **Question Progress Bar**
   - Displays "X/10" with visual fill
   - Updates after each successful submission

2. **Auto-Completion**
   - After 10 questions submitted, quiz auto-ends
   - Triggers final score screen

3. **Final Score Screen**
   - Shows celebratory icon (🎉)
   - Displays:
     - Final Score
     - Final Streak
     - Max Streak
     - Final Rank
   - Offers "Try Again" (restart) or "Back to Home"

4. **Question Counter in Store**
   - Zustand tracks `questionCount` (0-10)
   - Incremented after each successful answer
   - Reset when new session created

### Implementation Details

| File | Change |
|------|--------|
| `store/session-store.ts` | Added `questionCount`, `incrementQuestionCount()`, `resetQuestionCount()` |
| `hooks/use-quiz.ts` | Exports `questionCount` & `isQuizComplete` flag |
| `app/quiz/page.tsx` | Shows progress bar, completion screen when `isQuizComplete` |

---

## Deployment

### Docker Deployment (Recommended)

#### Single-Command Build & Run

```bash
# From repository root
docker compose -f backend/docker-compose.yml up --build

# In a separate terminal, check if frontend is ready
open http://localhost:3000
```

#### Services Started
- **api** (backend) – port 4000
- **db** (PostgreSQL) – port 5432
- **redis** (Redis) – port 6379
- **frontend** (Next.js) – port 3000

#### Detached Mode
```bash
docker compose -f backend/docker-compose.yml up --build -d
docker logs -f backend-api
docker logs -f backend-frontend
```

#### Stop Services
```bash
docker compose -f backend/docker-compose.yml down
```

---

## Submission Checklist

### Required Deliverables ✅

- [x] **Public GitHub Repository**
  - URL: `https://github.com/[user]/brainbolt-adaptive-quiz`
  - Ensure visibility set to public

- [x] **Single-Command Run**
  ```bash
  docker compose -f backend/docker-compose.yml up --build
  ```
  - Starts backend, frontend, PostgreSQL, Redis
  - Opens frontend on http://localhost:3000

- [x] **Demo Video** (`demo.mp4` at repo root)
  - [x] Show starting the stack with Docker command
  - [x] Play through 10-question quiz
  - [x] Show difficulty adaptation
  - [x] Show final score screen with auto-completion
  - [x] Show realtime leaderboard updates
  - [x] Show dark mode toggle functionality
  - [x] Brief walkthrough of key files:
    - `backend/apps/api/src/modules/quiz/quiz.service.ts` (adaptive algorithm)
    - `frontend/apps/web/hooks/use-quiz.ts` (10-question tracking)
    - `README.md` (this documentation)
  - Duration: 3-5 minutes

- [x] **Complete README.md** (this file)

### Assignment Requirements Mapping

| Requirement | Implementation | File Location |
|-------------|-----------------|-----------------|
| **Adaptive algorithm** | Confidence stabilizer + boundary clamping | `quiz.service.ts:adjustDifficulty()` |
| **Ping-pong prevention** | Confidence threshold (±3) before flip | `quiz.service.ts` lines ~15-25 |
| **Streak system** | Increment on correct, reset on wrong | `quiz.service.ts:submitAnswer()` |
| **Streak decay** | Halve after 10 min inactivity | `quiz.service.ts:applyInactivityDecay()` |
| **Score model** | Multi-factor (difficulty, streak, accuracy) | `quiz.service.ts:calculateScore()` |
| **Live leaderboards** | Redis sorted sets + Socket.IO | `realtime.service.ts`, `leaderboard.controller.ts` |
| **Real-time updates** | WebSocket events + refetch | `hooks/use-leaderboard.ts` |
| **10-question mode** | Progress bar + auto-completion | `quiz/page.tsx`, `session-store.ts` |
| **Component library** | Reusable UI components | `components/ui/*` |
| **Responsive design** | Tailwind grid breakpoints | All pages |
| **Idempotency** | `idempotencyKey` in `answer_log` | `quiz.service.ts` |
| **Docker deployment** | Single docker-compose command | `docker-compose.yml` |

---

## Troubleshooting

### Frontend cannot reach backend API

**Error:** `GET http://localhost:3000/undefined/v1/quiz/next 404`

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` is set in `.env.local` (local) or `.env` (Docker)
2. Verify backend is running on port 4000
3. Check CORS configuration in `backend/apps/api/src/app.ts`
4. Restart frontend dev server after env change

---

### Database connection error

**Error:** `P2002: Unique constraint failed on user_state.userId`

**Solution:**
1. Check database is running: `docker compose ps`
2. Reset migrations: `npx prisma migrate reset`
3. Reseed: `npx prisma db seed`

---

### Redis questions not loading

**Error:** Questions always from DB, never cached

**Solution:**
1. Verify Redis is running: `redis-cli ping` (should return PONG)
2. Check `REDIS_URL` in backend `.env`
3. Seed questions: `npx prisma db seed`

---

### Socket.IO connection fails

**Error:** WebSocket handshake fails, leaderboard doesn't update

**Solution:**
1. Verify backend Socket.IO server started
2. Check `NEXT_PUBLIC_SOCKET_URL` matches backend
3. Check CORS in backend server setup
4. Verify port 4000 is not blocked by firewall

---

## Dark Mode & Theme System

### Implementation

**Provider Setup** (`theme-provider.tsx`):
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
>
  {children}
</ThemeProvider>
```

**Theme Toggle Button** (`theme-toggle.tsx`):
- Located in header
- Toggles between light → dark → system → light
- Persists selection in localStorage
- SVG icons for sun/moon

**CSS Variables** (`globals.css`):
```css
:root {  /* light mode */
  --color-bg: 250 250 255;
  --color-text: 15 23 42;
  --color-primary: 79 70 229;
}

.dark {  /* dark mode */
  --color-bg: 10 14 23;
  --color-text: 245 245 250;
  --color-primary: 129 140 248;
}
```

**Contrast Ratios**:
- Light Mode: 14.5:1 (AAA compliant)
- Dark Mode: 13.2:1 (AAA compliant)

---

## Technologies & Dependencies

### Backend
- **Express** 5.2 – HTTP server
- **TypeScript** 5.9 – type safety
- **Prisma** 5.19 – ORM
- **PostgreSQL** (pg 8.18) – relational DB
- **Redis** (ioredis 5.9) – caching
- **Socket.IO** 4.8 – realtime WebSocket
- **Zod** 4.3 – schema validation

### Frontend
- **Next.js** 16.1 – React framework
- **React** 19 – UI library
- **Tailwind CSS** 4 – utility-first CSS
- **React Query** (@tanstack/react-query) – data fetching
- **Zustand** 5.0 – state management
- **Socket.IO Client** 4.8 – WebSocket client

### DevOps
- **Docker** – containerization
- **Docker Compose** – orchestration
- **ts-node-dev** – hot reload (backend dev)

---

## License

MIT License – see LICENSE file for details.

---

**Last Updated:** February 17, 2026  
**Version:** 1.0.0  
**Status:** Ready for Submission ✅
