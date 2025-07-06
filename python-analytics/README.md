# 🐍 Journalite Python Analytics Backend

Advanced AI-powered analytics engine for Journalite journal application using Python, machine learning, and multiple AI models.

## 🌟 Features

### 🤖 AI-Powered Mood Detection
- **Multi-Model Approach**: Combines VADER sentiment, TextBlob, Transformers, and Gemini AI
- **Automatic Mood Classification**: Detects emotions from journal text without user input
- **Confidence Scoring**: Provides confidence levels for mood predictions
- **Keyword Extraction**: Identifies emotional keywords and phrases

### 📊 Advanced Analytics
- **Emotion Distribution**: Comprehensive emotion analysis with trends
- **Sentiment Analysis**: Time-series sentiment tracking with volatility metrics
- **Word Cloud Generation**: Intelligent word frequency with sentiment coloring
- **Writing Pattern Analysis**: Time-based writing habits and productivity metrics
- **Mood Correlations**: Advanced correlation analysis between moods, tags, and patterns

### 🚀 Performance Features
- **Caching System**: Redis-like caching for faster analytics
- **Batch Processing**: Efficient processing of multiple entries
- **Real-time Analysis**: Live mood detection as users type
- **Fallback Systems**: Graceful degradation when AI services are unavailable

## 🛠️ Technology Stack

- **Framework**: Flask (Python web framework)
- **AI/ML Libraries**:
  - `transformers` - Hugging Face transformer models
  - `google-generativeai` - Gemini AI integration
  - `textblob` - Natural language processing
  - `vaderSentiment` - Sentiment analysis
  - `spacy` - Advanced NLP
- **Data Analysis**:
  - `pandas` - Data manipulation
  - `numpy` - Numerical computing
  - `scikit-learn` - Machine learning
  - `plotly` - Interactive visualizations
- **Database**: Firebase Admin SDK
- **Other**: NLTK, WordCloud, Matplotlib, Seaborn

## 🚀 Quick Setup

### 1. Automatic Setup (Recommended)
```bash
cd python-analytics
python setup.py
```

### 2. Manual Setup

#### Prerequisites
- Python 3.8 or higher
- pip package manager

#### Installation Steps

1. **Clone and Navigate**
```bash
cd python-analytics
```

2. **Create Virtual Environment**
```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Download ML Models**
```bash
python -m spacy download en_core_web_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('vader_lexicon')"
```

5. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

6. **Run the Application**
```bash
python app.py
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Google AI API Key for Gemini
GOOGLE_API_KEY=your_google_api_key_here

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# Analytics Configuration
CACHE_TIMEOUT=3600
MAX_ENTRIES_PER_REQUEST=1000
```

### Firebase Setup

1. **Service Account Key**: 
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Add the JSON content to `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

2. **Firestore Database**:
   - Ensure Firestore is enabled in your Firebase project
   - Set up proper security rules for journal entries

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Mood Analysis
```http
POST /analyze-mood
Content-Type: application/json

{
  "text": "I had a wonderful day today!"
}
```

### Comprehensive Insights
```http
POST /generate-insights
Content-Type: application/json

{
  "user_id": "user123",
  "entries": [...]
}
```

### Individual Analytics
- `POST /emotion-distribution` - Emotion distribution analysis
- `POST /sentiment-analysis` - Sentiment over time
- `POST /word-cloud` - Word cloud generation
- `POST /writing-patterns` - Writing pattern analysis
- `POST /mood-correlations` - Mood correlation analysis

### Batch Operations
```http
POST /auto-detect-mood
Content-Type: application/json

{
  "user_id": "user123"
}
```

## 🧠 AI Models Used

### 1. Emotion Classification
- **Model**: `j-hartmann/emotion-english-distilroberta-base`
- **Purpose**: Multi-class emotion detection
- **Emotions**: Joy, Sadness, Anger, Fear, Surprise, Disgust, etc.

### 2. Sentiment Analysis
- **VADER**: Rule-based sentiment analysis
- **TextBlob**: Statistical sentiment analysis
- **Combined Approach**: Weighted ensemble for accuracy

### 3. Gemini AI Integration
- **Model**: `gemini-pro`
- **Purpose**: Advanced mood detection and context understanding
- **Features**: Natural language understanding, confidence scoring

### 4. NLP Processing
- **spaCy**: Named entity recognition, POS tagging
- **NLTK**: Tokenization, stopword removal
- **Custom Processing**: Domain-specific emotion keywords

## 📊 Analytics Features

### Emotion Distribution
- Pie chart visualization
- Trend analysis over time
- Confidence intervals
- Emoji representations

### Sentiment Analysis
- Time-series sentiment tracking
- Distribution histograms
- Volatility metrics
- Trend identification

### Word Cloud
- Frequency-based sizing
- Sentiment-based coloring
- Context-aware filtering
- Interactive exploration

### Writing Patterns
- Time-of-day analysis
- Day-of-week patterns
- Entry length distribution
- Productivity metrics
- Writing streak tracking

### Mood Correlations
- Mood-tag relationships
- Time-mood correlations
- Length-mood analysis
- Weather correlations (if available)

## 🔧 Development

### Running in Development Mode
```bash
export FLASK_ENV=development
export FLASK_DEBUG=True
python app.py
```

### Testing
```bash
# Run basic functionality test
python -c "
from services.mood_detector import MoodDetector
detector = MoodDetector()
result = detector.detect_mood('I am feeling great today!')
print(result)
"
```

### Adding New Features

1. **New Analytics**: Add methods to `AnalyticsEngine` class
2. **New AI Models**: Extend `MoodDetector` with additional models
3. **New Endpoints**: Add routes to `app.py`

## 🚀 Deployment

### Production Setup
1. Set `FLASK_ENV=production`
2. Use a production WSGI server (Gunicorn, uWSGI)
3. Set up proper logging
4. Configure caching (Redis)
5. Set up monitoring

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## 🔍 Monitoring & Logging

- **Health Checks**: `/health` endpoint for monitoring
- **Request Logging**: All API requests are logged
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Processing time tracking

## 🤝 Integration with React Frontend

The Python backend integrates seamlessly with the React frontend through:

1. **REST API**: JSON-based communication
2. **CORS Support**: Cross-origin requests enabled
3. **Error Handling**: Graceful fallbacks
4. **Caching**: Client-side and server-side caching
5. **Real-time Updates**: WebSocket support (optional)

## 📈 Performance Optimization

- **Batch Processing**: Process multiple entries efficiently
- **Model Caching**: Cache loaded ML models
- **Result Caching**: Cache analytics results
- **Async Processing**: Non-blocking operations
- **Memory Management**: Efficient memory usage

## 🔒 Security

- **API Key Management**: Secure environment variable storage
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Secure cross-origin requests
- **Firebase Security**: Proper authentication and authorization

## 📚 Documentation

- **API Documentation**: Swagger/OpenAPI specs
- **Code Documentation**: Comprehensive docstrings
- **Examples**: Usage examples for all features
- **Troubleshooting**: Common issues and solutions

## 🐛 Troubleshooting

### Common Issues

1. **Model Download Failures**
   ```bash
   pip install --upgrade transformers
   python -m spacy download en_core_web_sm --force
   ```

2. **Firebase Connection Issues**
   - Verify service account key
   - Check Firestore permissions
   - Ensure project ID is correct

3. **Memory Issues**
   - Reduce batch sizes
   - Use model quantization
   - Implement model unloading

### Getting Help

- Check logs in `logs/` directory
- Enable debug mode for detailed error messages
- Review Firebase console for database issues
- Test individual components separately

## 🎯 Future Enhancements

- **Real-time Analytics**: WebSocket-based live updates
- **Advanced ML Models**: Custom trained models for journaling
- **Multi-language Support**: Support for multiple languages
- **Voice Analysis**: Mood detection from voice recordings
- **Image Analysis**: Emotion detection from uploaded photos
- **Predictive Analytics**: Mood prediction and recommendations
