# ✨ LingoSpark — Language Learning App

A fun, CEFR-aligned language learning app built on the **LSRW** (Listening → Speaking → Reading → Writing) methodology. Designed for learners aged 6+, starting with English (German & Spanish planned).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 13 (React) |
| Backend | Node.js + Express |
| Database | MySQL (via mysql2) |
| Auth | JWT (bcryptjs) |
| Speech | Web Speech API (beta) / Google Cloud STT (production) |

## Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+

### 1. Database Setup

```bash
# Start MySQL and create the database
mysql -u root -p < backend/db/schema.sql
mysql -u root -p < backend/db/seed.sql
```

Or use the init script:
```bash
cd backend
cp .env.example .env  # Edit with your MySQL credentials
npm install
npm run db:init
```

### 2. Start Backend

```bash
cd backend
npm install
npm start        # or: npm run dev (with auto-reload)
```

Backend runs at `http://localhost:3001`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

## Project Structure

```
lingospark/
├── backend/           # Express REST API
│   ├── db/            # Schema, seed data, init script
│   ├── routes/        # Auth, lessons, progress, assessments
│   ├── middleware/     # JWT authentication
│   ├── services/      # Speech provider abstraction
│   └── utils/         # MySQL connection pool
│
├── frontend/          # Next.js app
│   └── app/
│       ├── components/    # Navbar
│       ├── lib/           # API client utility
│       ├── login/         # Login page
│       ├── register/      # Registration page
│       ├── dashboard/     # User dashboard
│       └── learn/         # LSRW skill modules
│           ├── listening/
│           ├── speaking/
│           ├── reading/
│           └── writing/
│
└── README.md
```

## Features

- 🎧 **Listening** — Audio exercises with text-to-speech, pick-the-answer quizzes
- 🗣️ **Speaking** — Speech recognition with pronunciation feedback
- 📖 **Reading** — Comprehension, true/false, fill-the-blank, story passages
- ✍️ **Writing** — Typing exercises with letter-by-letter color feedback
- 📊 **Progress tracking** — Stars, XP, badges, per-skill progress bars
- 🏆 **Gamification** — Earn badges and get promoted from A1 → A2
- 👤 **User accounts** — Register, login, profile with JWT auth

## CEFR Levels

- **A1 (Beginner)**: Greetings, numbers, colors, family, animals — 20 lessons
- **A2 (Elementary)**: Daily routines, shopping, weather, directions, stories — 16 lessons

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register learner |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| GET | `/api/lessons` | List lessons (filter by level, skill) |
| GET | `/api/lessons/:id` | Lesson detail with content |
| POST | `/api/progress` | Save lesson attempt |
| GET | `/api/progress/summary` | Overall progress |
| POST | `/api/assessments/check` | Evaluate answers |
| POST | `/api/assessments/level-test` | CEFR level-up test |

## License

MIT
