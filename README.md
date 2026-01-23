# 📓 Journalite - AI-Powered Digital Journal

A modern, secure, and intelligent journaling application with AI-powered mood analysis and advanced insights. Built with React frontend and Python analytics backend.

## 🌟 Features

### 📝 Smart Journaling
- **Rich Text Editor**: Beautiful and intuitive writing experience
- **Photo Attachments**: Add images to your journal entries
- **Calendar Integration**: Easy navigation through your journal history
- **Tags & Categories**: Organize your thoughts with custom tags
- **Search Functionality**: Find entries quickly with powerful search

### 🧠 AI-Powered Intelligence
- **Automatic Mood Detection**: AI analyzes your writing to detect emotions
- **Multi-Model Analysis**: Combines VADER sentiment, TextBlob, Transformers, and Gemini AI
- **Sentiment Tracking**: Monitor your emotional well-being over time
- **Keyword Extraction**: Identify important themes and patterns
- **Writing Insights**: Analyze your writing patterns and productivity

### 🔐 Security & Privacy
- **End-to-End Encryption**: Your journal entries are encrypted before storage
- **Firebase Authentication**: Secure user authentication and authorization
- **Field-Level Encryption**: Individual fields are encrypted for maximum security
- **Privacy-First Design**: Your data remains private and secure

### 📊 Advanced Analytics
- **Mood Trends**: Visualize your emotional journey over time
- **Word Clouds**: See your most used words and phrases
- **Writing Statistics**: Track your writing habits and productivity
- **Correlation Analysis**: Discover patterns between moods, tags, and activities
- **Export Options**: Export your data for personal use

## 🚀 Live Demo

- **Frontend**: [https://journalite-a1327.web.app](https://journalite-a1327.web.app)
- **Status**: Fully deployed and operational

## 🛠️ Technology Stack

### Frontend (React)
- **React 19** - Modern React framework
- **React Router** - Client-side routing
- **Bootstrap 5** - Responsive UI components
- **Firebase SDK** - Authentication and database
- **Recharts** - Data visualization
- **Crypto-JS** - Client-side encryption
- **Axios** - HTTP client
- **Formik & Yup** - Form handling and validation

### Backend (Python)
- **Flask** - Lightweight web framework
- **Firebase Admin** - Server-side Firebase integration
- **Google AI (Gemini)** - Advanced language model
- **Transformers** - Hugging Face ML models
- **NLTK & TextBlob** - Natural language processing
- **NumPy & Pandas** - Data analysis
- **Scikit-learn** - Machine learning utilities

### Infrastructure
- **Firebase Hosting** - Frontend deployment
- **Firestore** - NoSQL database
- **Firebase Storage** - File storage
- **Google Cloud Run** - Serverless backend deployment
- **Firebase App Hosting** - Modern hosting solution

## 📁 Project Structure

```
journalite/
├── src/                          # React frontend source
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── journal/            # Journal-related components
│   │   ├── insights/           # Analytics and insights
│   │   └── layout/             # Layout components
│   ├── context/                # React context providers
│   ├── services/               # API and service layer
│   └── styles/                 # CSS and styling
├── python-analytics/           # Python backend
│   ├── services/              # Core business logic
│   │   ├── analytics_engine.py # Main analytics engine
│   │   ├── firebase_service.py # Firebase integration
│   │   └── mood_detector.py    # AI mood detection
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── public/                     # Static assets
├── build/                      # Production build
└── firebase.json              # Firebase configuration
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9+
- Firebase project setup
- Google AI API key (for Gemini)

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
   ```bash
   # Copy environment template
   cp .env.production.example .env.local
   
   # Edit .env.local with your configuration
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_GOOGLE_AI_API_KEY=your-api-key
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
   - Download Firebase service account key
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

5. **Start the Flask server**
   ```bash
   python app.py
   ```
   Backend will run on [http://localhost:5000](http://localhost:5000)

## 📋 Available Scripts

### Frontend Scripts
- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Backend Scripts
- `python app.py` - Start Flask development server
- `pip install -r requirements.txt` - Install dependencies
- `python -m pytest` - Run backend tests

## 🚀 Deployment

### Frontend (Firebase Hosting)
```bash
npm run build
firebase deploy --only hosting
```

### Backend (Google Cloud Run)
```bash
cd python-analytics
./deploy-cloud-run.sh
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_GOOGLE_AI_API_KEY=your-api-key
REACT_APP_PYTHON_API_URL=your-backend-url
REACT_APP_ENABLE_AI_FEATURES=true
```

#### Backend
```bash
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_AI_API_KEY=your-api-key
FLASK_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
