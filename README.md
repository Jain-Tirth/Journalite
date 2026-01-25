#  Journalite - AI-Powered Digital Journal

A modern, secure, and intelligent journaling application with AI-powered mood analysis and comprehensive insights. Built with React 19 frontend, Google Gemini AI integration, and Python analytics backend with end-to-end encryption.

##  Features

###  Smart Journaling
- **Rich Text Editor**: Beautiful and intuitive writing experience
- **Photo Attachments**: Add images to your journal entries
- **Calendar Integration**: Easy navigation through your journal history
- **Tags & Categories**: Organize your thoughts with custom tags
- **Search Functionality**: Find entries quickly with powerful search

###  AI-Powered Intelligence
- **Automatic Mood Detection**: Google Gemini AI analyzes your writing to detect emotions
- **Unified Analytics Service**: Single service architecture for all analytics (AI → Python → Heuristics fallback)
- **Sentiment Tracking**: Monitor your emotional well-being over time with interactive charts
- **Emotion Distribution**: Comprehensive breakdown of your emotional states
- **Writing Insights**: Analyze writing patterns, productivity, and habits
- **Smart Suggestions**: AI-powered journaling suggestions based on your data
- **Word Cloud Generation**: AI-powered keyword extraction and visualization
- **Mood Correlations**: Discover patterns between moods, tags, time of day, and entry length

###  Security & Privacy
- **End-to-End Encryption**: Journal entries are encrypted client-side before storage
- **Field-Level Encryption**: Individual fields (title and content) are encrypted using AES
- **User-Specific Keys**: Encryption keys derived from user UID ensuring only you can read your data
- **Firebase Authentication**: Secure user authentication and authorization
- **Privacy-First Design**: Admin users cannot access encrypted content
- **Secure Storage**: Firebase Firestore with security rules
- **Protected Routes**: Authentication-required access to journal features

###  Advanced Analytics
- **Emotion Distribution**: Interactive pie charts showing emotional breakdown
- **Sentiment Over Time**: Track sentiment trends with area charts
- **Emotions Over Time**: Multi-emotion tracking with stacked/percentage views
- **Word Clouds**: AI-generated word clouds from your journal entries
- **Writing Patterns**: Comprehensive statistics including:
  - Average words per entry
  - Total entries and total words
  - Most active day and hour
  - Longest and shortest entries
  - Weekly writing patterns
  - Time of day analysis
  - Entry length distribution
- **Mood Correlations**: Analyze relationships between:
  - Moods and tags
  - Moods and entry length
  - Moods and time of day
- **Comprehensive Dashboard**: All insights in one unified view
- **Real-time Analysis**: Instant mood detection as you write
- **Data Caching**: Smart caching for improved performance

##  Live Demo

- **Frontend**: [https://journalite-a1327.web.app](https://journalite-a1327.web.app)
- **Status**: Fully deployed and operational

##  Technology Stack

### Frontend (React)
- **React 19** - Latest React framework with modern hooks
- **React Router v6** - Client-side routing
- **Bootstrap 5** - Responsive UI components
- **Firebase SDK v11** - Authentication, Firestore, and Storage
- **Recharts** - Beautiful data visualization charts
- **CryptoJS** - AES encryption for client-side security
- **Google Generative AI SDK** - Gemini AI integration
- **Axios** - HTTP client for API requests
- **React Context API** - State management for auth and theme

### Backend (Python)
- **Flask** - Lightweight web framework for analytics API
- **Firebase Admin SDK** - Server-side Firebase integration
- **Google Generative AI (Gemini 2.0)** - Advanced language model for mood analysis
- **Transformers** - Hugging Face ML models for NLP
- **NLTK & TextBlob** - Natural language processing tools
- **NumPy & Pandas** - Data analysis and manipulation
- **Scikit-learn** - Machine learning utilities
- **Flask-CORS** - Cross-origin resource sharing

### Infrastructure
- **Firebase Hosting** - Frontend deployment
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Firebase App Hosting** - Modern hosting solution

##  Project Structure

```
journalite/
├── src/                          # React frontend source
│   ├── components/              # React components
│   │   ├── auth/               # Login, Register, Profile, ProtectedRoute
│   │   ├── journal/            # JournalList, JournalDetail, JournalEntryForm
│   │   ├── insights/           # Analytics components
│   │   │   ├── Insights.js     # Main insights dashboard
│   │   │   ├── EmotionDistribution.js
│   │   │   ├── SentimentAnalysis.js
│   │   │   ├── EmotionsOverTime.js
│   │   │   ├── WordCloud.js
│   │   │   ├── WritingPatterns.js
│   │   │   └── MoodCorrelations.js
│   │   ├── layout/             # Navbar, ThemeToggle, Unauthorized
│   │   └── ui/                 # JournalComponents (reusable UI)
│   ├── context/                # React context providers
│   │   ├── AuthContext.js      # Authentication state
│   │   └── ThemeContext.js     # Theme management
│   ├── services/               # API and service layer
│   │   ├── analyticsService.js # Unified analytics service 
│   │   ├── journalService.js   # Journal CRUD operations
│   │   ├── fieldEncryption.js  # AES encryption/decryption
│   │   ├── firebase.js         # Firebase configuration
│   │   └── firebaseAuth.js     # Auth helpers
│   ├── styles/                 # CSS and styling
│   │   ├── theme.css           # Main theme
│   │   └── journaling-theme.css # Journal-specific styles
│   └── utils/                  # Utility functions
├── python-analytics/           # Python backend
│   ├── services/              # Core business logic
│   │   ├── analytics_engine.py # Main analytics engine
│   │   ├── firebase_service.py # Firebase integration
│   │   └── mood_detector.py    # AI mood detection
│   ├── app.py                 # Flask application entry point
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Container configuration
├── public/                     # Static assets
│   ├── index.html            # HTML template
│   └── manifest.json         # PWA manifest
├── build/                      # Production build output
├── firebase.json              # Firebase configuration
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
└── package.json              # Node.js dependencies
```

## 🚦 Getting Started

### Prerequisites
- Node.js v18 or higher
- Python 3.9+ (3.13 recommended)
- Firebase project with Firestore and Storage enabled
- Google AI API key for Gemini 2.0
- Git for version control

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd journalite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Create a `.env.local` file in the root directory
   - Add your Firebase and Google AI configuration:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   REACT_APP_GOOGLE_AI_API_KEY=your-gemini-api-key
   REACT_APP_PYTHON_API_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

### Backend Setup

1. **Navigate to Python backend**
   ```bash
   cd python-analytics
   ```

2. **Create virtual environment**
   ```bash
   python -m venv myenv
   # Windows
   myenv\Scripts\activate
   # macOS/Linux
   source myenv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Firebase credentials**
   - Download Firebase service account key from Firebase Console
   - Place it in `python-analytics/` directory
   - Set environment variable:
   ```bash
   # Windows PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"
   
   # Windows Command Prompt
   set GOOGLE_APPLICATION_CREDENTIALS=path\to\serviceAccountKey.json
   
   # macOS/Linux
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
   ```

5. **Set Google AI API Key**
   ```bash
   # Windows PowerShell
   $env:GOOGLE_AI_API_KEY="your-gemini-api-key"
   
   # macOS/Linux
   export GOOGLE_AI_API_KEY="your-gemini-api-key"
   ```

5. **Start the Flask server**
   ```bash
   python app.py
   ```
   Backend will run on [http://localhost:5000](http://localhost:5000)

##  Architecture

### Analytics Flow
```
User Input → Insights Component → analyticsService.js
                                         ↓
                         ┌───────────────┴───────────────┐
                         │                               │
                    Gemini AI                    Python Backend
                  (Primary Method)              (Fallback Option)
                         │                               │
                         └───────────────┬───────────────┘
                                         ↓
                              Client Heuristics
                            (Last Resort Fallback)
                                         ↓
                              Return Analytics Data
```

### Key Features
- **Unified Service Architecture**: Single `analyticsService.js` handles all analytics
- **Intelligent Fallbacks**: AI → Python → Heuristics for reliability
- **Client-Side Encryption**: Title and content encrypted before Firebase storage
- **Real-Time Analysis**: Mood detection as you type
- **Smart Caching**: localStorage caching with TTL for performance
- **Comprehensive Insights**: 6 different visualization types

##  Available Scripts

### Frontend Scripts
- `npm start` - Start development server (http://localhost:3000)
- `npm test` - Run test suite with Jest
- `npm run build` - Create optimized production build
- `npm run eject` - Eject from Create React App (irreversible)

### Backend Scripts
- `python app.py` - Start Flask development server (port 5000)
- `pip install -r requirements.txt` - Install Python dependencies
- `pip install -r requirements-cloud.txt` - Install cloud deployment dependencies
- `./deploy-cloud-run.sh` - Deploy to Google Cloud Run (Linux/Mac)
- `deploy.bat` - Deploy to Google Cloud Run (Windows)

##  Deployment

### Frontend (Firebase Hosting)
```bash
npm run build
firebase deploy --only hosting
```

##  Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Google AI (Gemini)
REACT_APP_GOOGLE_AI_API_KEY=your-gemini-api-key

# Python Backend URL (optional - for fallback analytics)
REACT_APP_PYTHON_API_URL=http://localhost:5000
```

#### Backend (Environment Variables)
```bash
# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json

# Google AI API
GOOGLE_AI_API_KEY=your-gemini-api-key

# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py
PORT=5000
```

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
