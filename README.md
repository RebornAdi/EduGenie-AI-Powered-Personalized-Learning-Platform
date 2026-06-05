# EduGenie: AI-Powered Personalized Learning Platform

A full-stack EdTech platform that analyzes student performance, generates personalized quizzes, creates adaptive study plans, and provides an AI-powered tutor.

## Features

- **User Authentication** — JWT-based registration and login
- **Study Materials** — PDF upload with subject categorization
- **AI Tutor** — RAG-powered chat using uploaded notes (Gemini + ChromaDB)
- **Quiz Generator** — Auto-generated MCQ and True/False questions
- **Analytics Dashboard** — Performance trends, topic mastery, quiz accuracy
- **Study Planner** — AI-generated daily study schedules
- **Performance Prediction** — ML-based exam score forecasting

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, React Router, Axios, Recharts |
| Backend | FastAPI, SQLAlchemy, JWT |
| Database | SQLite |
| AI/ML | Gemini API, Sentence Transformers, ChromaDB, Scikit-learn |

## Prerequisites

- Node.js 18+
- Python 3.11+
- [Gemini API Key](https://aistudio.google.com/apikey)

## Quick Start

### 1. Install Everything

```bash
npm run setup
```

This installs frontend dependencies, creates `backend/.venv`, installs Python dependencies, and creates `backend/.env` if it does not exist.

### 2. Configure Environment

```bash
backend/.env
```

Set your `GEMINI_API_KEY` when you want AI features. The local database uses SQLite by default at `backend/edugenie.db`.

### 3. Run The App

```bash
npm run dev
```

API docs: http://localhost:8000/docs
App: http://localhost:5173

You can also run each side separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # AI, RAG, ML services
│   │   ├── models/       # SQLAlchemy models
│   │   └── schemas/      # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/        # Dashboard, Tutor, Quiz, etc.
│       ├── components/   # Layout, shared UI
│       └── api/          # Axios API client
├── scripts/              # npm-powered setup and dev runners
└── package.json
```

## API Modules

| Module | Endpoints |
|--------|-----------|
| Auth | `/api/auth/register`, `/api/auth/login` |
| Materials | `/api/materials/subjects`, `/api/materials/notes/upload` |
| AI Tutor | `/api/tutor/chat` |
| Quiz | `/api/quiz/generate`, `/api/quiz/{id}/submit` |
| Analytics | `/api/analytics/dashboard`, `/api/analytics/prediction` |
| Planner | `/api/planner/generate`, `/api/planner/plans` |

## Deployment

- **Frontend**: Vercel
- **Backend**: Render / Railway
- **Database**: SQLite for local development; use a managed database if you outgrow local storage.

## License

MIT
