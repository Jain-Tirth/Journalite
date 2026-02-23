# Journalite

> An AI-powered digital journal with end-to-end encryption, mood analytics, and rich writing insights.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://journalite-a1327.web.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## Overview

Journalite is a modern journaling platform that combines a rich writing experience with AI-driven mood analysis and comprehensive analytics. All journal data is encrypted client-side before storage, ensuring complete privacy — even from administrators.

## Key Features

| Category | Highlights |
|---|---|
| **Journaling** | Rich text editor, photo attachments, calendar navigation, tags & search |
| **AI Analytics** | Automatic mood detection (Groq · llama-3.3-70b), sentiment tracking, emotion distribution, word clouds |
| **Privacy** | AES field-level encryption, user-derived keys, Firebase Auth, Firestore security rules |
| **Insights Dashboard** | Sentiment trends, writing patterns, mood correlations, time-of-day analysis |

## Architecture

```
User Input → React Frontend → analyticsService.js
                                      │
                      ┌────────────────┼────────────────┐
                      ▼                ▼                 ▼
                   Groq AI      Python Backend     Client Heuristics
                 (primary)        (fallback)        (last resort)
```

- **Unified analytics service** with intelligent three-tier fallback
- **Client-side AES encryption** — title and content encrypted before Firestore storage
- **Smart caching** — `localStorage` with TTL for fast repeat loads

## Tech Stack

### Frontend
React 19 · React Router v6 · Bootstrap 5 · Firebase SDK v11 · Recharts · CryptoJS · Groq SDK

### Backend
Flask · Firebase Admin SDK · Groq AI · Hugging Face Transformers · NLTK · NumPy · Pandas · Scikit-learn

### Infrastructure
Firebase Hosting · Firestore · Firebase Storage · Firebase App Hosting

## Getting Started

### Prerequisites

- **Node.js** 16+ & npm
- **Firebase CLI** — `npm i -g firebase-tools`
- *(Optional)* Python 3.8+ for the analytics backend

### 1. Clone & Install

```bash
git clone <repository-url>
cd journalite
cd frontend && npm install
```

### 2. Configure Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication**, **Firestore**, and **Storage**.
3. Copy your config into `frontend/src/services/firebase.js`.

### 3. Environment Variables

**Frontend** — create `frontend/.env`:

```env
REACT_APP_GROQ_API_KEY=<your-groq-api-key>
REACT_APP_PYTHON_API_URL=http://localhost:5000
```

**Backend** *(optional)* — set in your shell:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
export GROQ_API_KEY="<your-groq-api-key>"
```

### 4. Run

```bash
# Frontend (http://localhost:3000)
cd frontend && npm start

# Backend (http://localhost:5000) — optional
cd python-analytics
python -m venv myenv && source myenv/bin/activate   # or myenv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

## Deployment

```bash
# Full deploy
npm run deploy

# Hosting only
firebase deploy --only hosting

# Firestore rules & indexes
npm run deploy:firestore
```

## Project Structure

```
journalite/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── context/      # Auth & theme providers
│   │   ├── services/     # API integrations & analytics
│   │   ├── styles/       # CSS & themes
│   │   └── utils/        # Helpers & encryption
│   └── public/           # Static assets
├── backend/              # Firebase config & security rules
├── python-analytics/     # Flask analytics service
├── firebase.json         # Firebase project config
└── package.json          # Workspace root
```

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/my-feature`
3. Commit your changes — `git commit -m "Add my feature"`
4. Push & open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
