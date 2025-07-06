from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import json
from datetime import datetime
import random

# Simple imports without heavy dependencies
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("python-dotenv not installed, using environment variables directly")

try:
    from textblob import TextBlob
    TEXTBLOB_AVAILABLE = True
except ImportError:
    TEXTBLOB_AVAILABLE = False
    print("TextBlob not available, using simple sentiment analysis")

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple mood detection function
def simple_mood_detection(text):
    """Simple mood detection using basic keyword analysis"""
    text_lower = text.lower()

    # Define mood keywords
    mood_keywords = {
        'happy': ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'awesome'],
        'sad': ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'hurt'],
        'angry': ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'rage', 'hate'],
        'anxious': ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared'],
        'excited': ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic'],
        'calm': ['calm', 'peaceful', 'relaxed', 'zen', 'tranquil', 'serene'],
        'grateful': ['grateful', 'thankful', 'blessed', 'appreciate', 'lucky']
    }

    mood_scores = {}
    for mood, keywords in mood_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        if score > 0:
            mood_scores[mood] = score

    if mood_scores:
        primary_mood = max(mood_scores, key=mood_scores.get)
        confidence = min(mood_scores[primary_mood] / 10.0, 1.0)
    else:
        primary_mood = 'neutral'
        confidence = 0.5

    # Simple sentiment score
    sentiment_score = 0.0
    if TEXTBLOB_AVAILABLE:
        try:
            blob = TextBlob(text)
            sentiment_score = blob.sentiment.polarity
        except:
            pass

    return {
        'primary_mood': primary_mood,
        'confidence': confidence,
        'emotions': mood_scores,
        'sentiment_score': sentiment_score,
        'keywords': list(mood_scores.keys())
    }

@app.route('/', methods=['GET'])
def welcome():
    """Welcome endpoint"""
    return jsonify({
        'message': 'Welcome to Journalite Analytics API! 🎉',
        'status': 'running',
        'service': 'Journalite Analytics API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/health',
            'analyze_mood': '/analyze-mood (POST)',
            'generate_insights': '/generate-insights (POST)',
            'emotion_distribution': '/emotion-distribution (POST)',
            'sentiment_analysis': '/sentiment-analysis (POST)',
            'word_cloud': '/word-cloud (POST)',
            'writing_patterns': '/writing-patterns (POST)',
            'mood_correlations': '/mood-correlations (POST)',
            'auto_detect_mood': '/auto-detect-mood (POST)'
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Journalite Analytics API is running',
        'version': '1.0.0'
    })

@app.route('/analyze-mood', methods=['POST'])
def analyze_mood():
    """Analyze mood from journal entry text"""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'error': 'Text is required'}), 400

        # Detect mood using simple analysis
        mood_result = simple_mood_detection(text)

        return jsonify({
            'success': True,
            'mood': mood_result['primary_mood'],
            'confidence': mood_result['confidence'],
            'emotions': mood_result['emotions'],
            'sentiment_score': mood_result['sentiment_score'],
            'keywords': mood_result['keywords']
        })

    except Exception as e:
        logger.error(f"Error analyzing mood: {str(e)}")
        return jsonify({'error': 'Failed to analyze mood'}), 500

def simple_analytics(entries):
    """Generate simple analytics from entries"""
    if not entries:
        return {}

    # Count moods
    mood_counts = {}
    total_words = 0

    for entry in entries:
        content = entry.get('content', '')
        mood = entry.get('mood', 'neutral')

        mood_counts[mood] = mood_counts.get(mood, 0) + 1
        total_words += len(content.split())

    # Create emotion distribution
    total_entries = len(entries)
    emotion_distribution = []
    for mood, count in mood_counts.items():
        percentage = (count / total_entries) * 100
        emotion_distribution.append({
            'name': mood.title(),
            'value': round(percentage, 1),
            'count': count,
            'emoji': get_emotion_emoji(mood)
        })

    return {
        'emotion_distribution': emotion_distribution,
        'sentiment_analysis': {'distribution': [], 'over_time': []},
        'word_cloud': [],
        'writing_patterns': {'stats': {'total_entries': total_entries, 'total_words': total_words}},
        'mood_correlations': {}
    }

def get_emotion_emoji(emotion):
    """Get emoji for emotion"""
    emoji_map = {
        'happy': '😊', 'sad': '😢', 'angry': '😠', 'anxious': '😟',
        'excited': '🤩', 'calm': '😌', 'neutral': '😐', 'grateful': '🙏'
    }
    return emoji_map.get(emotion.lower(), '😐')

@app.route('/generate-insights', methods=['POST'])
def generate_insights():
    """Generate comprehensive insights from journal entries"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        entries = data.get('entries', [])

        if not user_id or not entries:
            return jsonify({'error': 'User ID and entries are required'}), 400

        # Generate simple analytics
        insights = simple_analytics(entries)

        return jsonify({
            'success': True,
            'insights': insights
        })

    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        return jsonify({'error': 'Failed to generate insights'}), 500

@app.route('/emotion-distribution', methods=['POST'])
def emotion_distribution():
    """Get emotion distribution analysis"""
    try:
        data = request.get_json()
        entries = data.get('entries', [])

        analytics = simple_analytics(entries)
        distribution = analytics.get('emotion_distribution', [])

        return jsonify({
            'success': True,
            'distribution': distribution
        })

    except Exception as e:
        logger.error(f"Error analyzing emotion distribution: {str(e)}")
        return jsonify({'error': 'Failed to analyze emotions'}), 500

@app.route('/sentiment-analysis', methods=['POST'])
def sentiment_analysis():
    """Get sentiment analysis over time"""
    try:
        data = request.get_json()
        entries = data.get('entries', [])

        # Simple sentiment analysis
        sentiment_data = {'distribution': [], 'over_time': []}

        return jsonify({
            'success': True,
            'sentiment_data': sentiment_data
        })

    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return jsonify({'error': 'Failed to analyze sentiment'}), 500

@app.route('/word-cloud', methods=['POST'])
def word_cloud():
    """Generate word cloud data"""
    try:
        data = request.get_json()
        entries = data.get('entries', [])

        # Simple word frequency
        word_data = []

        return jsonify({
            'success': True,
            'word_data': word_data
        })

    except Exception as e:
        logger.error(f"Error generating word cloud: {str(e)}")
        return jsonify({'error': 'Failed to generate word cloud'}), 500

@app.route('/writing-patterns', methods=['POST'])
def writing_patterns():
    """Analyze writing patterns"""
    try:
        data = request.get_json()
        entries = data.get('entries', [])

        analytics = simple_analytics(entries)
        patterns = analytics.get('writing_patterns', {})

        return jsonify({
            'success': True,
            'patterns': patterns
        })

    except Exception as e:
        logger.error(f"Error analyzing writing patterns: {str(e)}")
        return jsonify({'error': 'Failed to analyze patterns'}), 500

@app.route('/mood-correlations', methods=['POST'])
def mood_correlations():
    """Analyze mood correlations"""
    try:
        data = request.get_json()
        entries = data.get('entries', [])

        # Simple correlations
        correlations = {}

        return jsonify({
            'success': True,
            'correlations': correlations
        })

    except Exception as e:
        logger.error(f"Error analyzing correlations: {str(e)}")
        return jsonify({'error': 'Failed to analyze correlations'}), 500

@app.route('/auto-detect-mood', methods=['POST'])
def auto_detect_mood():
    """Auto-detect mood for existing entries"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Simple response for now
        return jsonify({
            'success': True,
            'updated_entries': 0,
            'message': "Auto mood detection not available in simple mode"
        })

    except Exception as e:
        logger.error(f"Error auto-detecting moods: {str(e)}")
        return jsonify({'error': 'Failed to auto-detect moods'}), 500

if __name__ == '__main__':
    # Simple startup
    logger.info("Starting Journalite Analytics API...")
    logger.info("Simple mode - basic functionality only")

    # Get port from environment variable for Cloud Run
    import os
    port = int(os.environ.get('PORT', 8080))

    # Run the app
    app.run(debug=False, host='0.0.0.0', port=port)
