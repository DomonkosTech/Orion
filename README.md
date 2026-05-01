# Orion — AI-Powered Job Search & Recruitment Platform

Orion connects job seekers and companies with AI-driven job matching and a built-in Applicant Tracking System (ATS).

## Prerequisites

- **Node.js** 22.x (the project uses npm 10.x)
- **Python** 3.10+ (for the OrionAI recommendation engine)
- A **Supabase** project (used as the database and realtime backend)

## Installation

```bash
# 1. Clone and install dependencies
git clone <repo-url> && cd Orion
npm install

# 2. Create a Python virtual environment for the AI service
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS / Linux
pip install -r requirements.txt

# 3. Set up your environment variables
cp .env.example .env
# Fill in your Supabase URL, keys, and JWT secret in .env

# 4. Start both the frontend and backend
npm run dev        # Vite dev server on :5173
npm run server     # Express API on :4000
```

## Basic Usage

```tsx
// src/main.tsx — the entry point
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

The app supports three languages (English, German, Hungarian) and three role modes:
- **Guest** — browse the landing page, register, or log in
- **User** — search and apply for jobs, manage applications, upload resumes
- **Company** — post jobs, manage listings, track applicants through the ATS

## Troubleshooting

**"Encryption key loaded: undefined"** — Your `.env` file is missing or incomplete. Copy `.env.example` and fill in every field.

**CORS errors on the frontend** — Make sure `npm run server` is running on port 4000.

**Python script not found** — Run `npm run OrionAI` directly to check if `.venv` is set up correctly.

## Full Documentation

For architecture diagrams, database schema, API reference, and deployment guides, see the [Orion Documentation](./docs/Orion_documentation.pdf) (PDF, 60+ pages).
