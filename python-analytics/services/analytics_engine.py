import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import Counter, defaultdict
import re
from wordcloud import Wordcloud
import matplotlib.pyplot as plt
import seaborn as sns
from textblob import TextBlob
import plotly.graph_objects as go
import plotly.express as px
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import logging
import nltk
nltk.download('stopwords')

logger = logging.getLogger(__name__)

class AnalyticsEngine:
    def __init__(self):
      self.stop_words = set(nltk.corpus.stopwords.words('english'))
  
    def initialize_models(self):
        """Initialize any ML models needed for analytics"""
        logger.info("Analytics engine models initialized")
    
    def generate_comprehensive_insights(self, entries):
        """Generate comprehensive insights from journal entries"""
        try:
            # Convert entries to DataFrame for easier analysis
            df = self._entries_to_dataframe(entries)
            
            if df.empty:
                return self._empty_insights()
            
            insights = {
                'emotion_distribution': self.analyze_emotion_distribution(entries),
                'sentiment_analysis': self.analyze_sentiment_over_time(entries),
                'word_cloud': self.generate_word_cloud_data(entries),
                'writing_patterns': self.analyze_writing_patterns(entries),
                'mood_correlations': self.analyze_mood_correlations(entries),
                'advanced_analytics': self._generate_advanced_analytics(df),
                'ai_insights': self._generate_ai_insights(df)
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating comprehensive insights: {e}")
            return self._empty_insights()
    
    def analyze_emotion_distribution(self, entries):
        """Analyze emotion distribution with advanced statistics"""
        try:
            df = self._entries_to_dataframe(entries)
            
            if df.empty or 'mood' not in df.columns:
                return []
            
            # Count emotions
            emotion_counts = df['mood'].value_counts()
            total_entries = len(df)
            
            # Calculate statistics
            distribution = []
            for emotion, count in emotion_counts.items():
                percentage = (count / total_entries) * 100
                
                distribution.append({
                    'name': emotion.title(),
                    'value': round(percentage, 1),
                    'count': int(count),
                    'emoji': self._get_emotion_emoji(emotion),
                    'trend': self._calculate_emotion_trend(df, emotion)
                })
            
            # Sort by percentage
            distribution.sort(key=lambda x: x['value'], reverse=True)
            
            return distribution
            
        except Exception as e:
            logger.error(f"Error analyzing emotion distribution: {e}")
            return []
    
    def analyze_sentiment_over_time(self, entries):
        """Advanced sentiment analysis over time"""
        try:
            df = self._entries_to_dataframe(entries)
            
            if df.empty:
                return {'distribution': [], 'over_time': []}
            
            # Calculate sentiment scores for each entry
            sentiment_scores = []
            for _, row in df.iterrows():
                blob = TextBlob(row['content'])
                sentiment_scores.append(blob.sentiment.polarity)
            
            df['sentiment_score'] = sentiment_scores
            
            # Create sentiment distribution
            distribution = self._create_sentiment_distribution(sentiment_scores)
            
            # Create time series data
            df['date'] = pd.to_datetime(df['created_at']).dt.date
            daily_sentiment = df.groupby('date')['sentiment_score'].mean().reset_index()
            
            over_time = []
            for _, row in daily_sentiment.iterrows():
                over_time.append({
                    'date': row['date'].isoformat(),
                    'score': round(row['sentiment_score'], 3),
                    'label': self._sentiment_label(row['sentiment_score'])
                })
            
            return {
                'distribution': distribution,
                'over_time': over_time,
                'average_sentiment': round(np.mean(sentiment_scores), 3),
                'sentiment_volatility': round(np.std(sentiment_scores), 3)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {'distribution': [], 'over_time': []}
    
    def generate_word_cloud_data(self, entries):
        """Generate advanced word cloud data with sentiment analysis"""
        try:
            # Combine all text
            all_text = ' '.join([entry.get('content', '') for entry in entries])
                
            # Clean and tokenize
            words = self._extract_meaningful_words(all_text)
            
            # Count word frequencies
            word_freq = Counter(words)
            
            # Get top words
            top_words = word_freq.most_common(50)
            
            # Analyze sentiment for each word
            word_data = []
            for word, frequency in top_words:
                # Analyze sentiment of sentences containing this word
                sentiment = self._analyze_word_sentiment(word, entries)
                
                word_data.append({
                    'text': word,
                    'frequency': frequency,
                    'size': min(60, 12 + (frequency * 2)),
                    'sentiment': sentiment['category'],
                    'sentiment_score': sentiment['score'],
                    'color': self._get_sentiment_color(sentiment['score']),
                    'contexts': sentiment['contexts'][:3]  # Top 3 contexts
                })
            
            return word_data
            
        except Exception as e:
            logger.error(f"Error generating word cloud: {e}")
            return []
    
    def analyze_writing_patterns(self, entries):
        """Comprehensive writing pattern analysis"""
        try:
            df = self._entries_to_dataframe(entries)
            
            if df.empty:
                return {}
            
            # Convert timestamps
            df['datetime'] = pd.to_datetime(df['created_at'])
            df['hour'] = df['datetime'].dt.hour
            df['day_of_week'] = df['datetime'].dt.day_name()
            df['date'] = df['datetime'].dt.date
            
            # Calculate word counts
            df['word_count'] = df['content'].apply(lambda x: len(x.split()))
            
            # Time analysis
            time_distribution = self._analyze_time_patterns(df)
            
            # Length analysis
            length_distribution = self._analyze_length_patterns(df)
            
            # Weekly patterns
            weekly_pattern = df['day_of_week'].value_counts().to_dict()
            
            # Writing streaks
            writing_streak = self._calculate_writing_streak(df)
            
            # Productivity analysis
            productivity = self._analyze_productivity(df)
            
            stats = {
                'total_entries': len(df),
                'total_words': int(df['word_count'].sum()),
                'average_length': round(df['word_count'].mean(), 1),
                'longest_entry': int(df['word_count'].max()),
                'shortest_entry': int(df['word_count'].min()),
                'writing_streak': writing_streak,
                'most_productive_day': max(weekly_pattern, key=weekly_pattern.get),
                'favorite_time': self._get_favorite_writing_time(df),
                'consistency_score': self._calculate_consistency_score(df)
            }
            
            return {
                'time_distribution': time_distribution,
                'length_distribution': length_distribution,
                'weekly_pattern': weekly_pattern,
                'stats': stats,
                'productivity': productivity
            }
            
        except Exception as e:
            logger.error(f"Error analyzing writing patterns: {e}")
            return {}
    
    def analyze_mood_correlations(self, entries):
        """Advanced mood correlation analysis"""
        try:
            df = self._entries_to_dataframe(entries)
            
            if df.empty:
                return {}
            
            # Mood-tag correlations
            mood_tag_correlations = self._analyze_mood_tag_correlations(df)
            
            # Mood-length correlations
            mood_length_correlations = self._analyze_mood_length_correlations(df)
            
            # Time-mood correlations
            time_mood_correlations = self._analyze_time_mood_correlations(df)
            
            # Weather-mood correlations (if weather data available)
            weather_correlations = self._analyze_weather_correlations(df)
            
            return {
                'mood_tag_correlations': mood_tag_correlations,
                'mood_length_correlations': mood_length_correlations,
                'time_mood_correlations': time_mood_correlations,
                'weather_correlations': weather_correlations,
                'correlation_insights': self._generate_correlation_insights(df)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing mood correlations: {e}")
            return {}
    
    def _entries_to_dataframe(self, entries):
        """Convert entries to pandas DataFrame"""
        if not entries:
            return pd.DataFrame()
        
        data = []
        for entry in entries:
            data.append({
                'id': entry.get('id', ''),
                'content': entry.get('content', ''),
                'title': entry.get('title', ''),
                'mood': entry.get('mood', 'neutral'),
                'tags': entry.get('tags', []),
                'created_at': entry.get('createdAt', entry.get('created_at', datetime.now()))
            })
        
        return pd.DataFrame(data)
    
    def _extract_meaningful_words(self, text):
        """Extract meaningful words from text"""
        # Convert to lowercase and remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        
        # Split into words
        words = text.split()
        
        # Filter out stop words and short words
        meaningful_words = [
            word for word in words 
            if len(word) > 3 and word not in self.stop_words
        ]
        
        return meaningful_words
    
    def _analyze_word_sentiment(self, word, entries):
        """Analyze sentiment of a specific word in context"""
        contexts = []
        sentiment_scores = []
        
        for entry in entries:
            content = entry.get('content', '').lower()
            if word in content:
                # Find sentences containing the word
                sentences = content.split('.')
                for sentence in sentences:
                    if word in sentence:
                        blob = TextBlob(sentence)
                        sentiment_scores.append(blob.sentiment.polarity)
                        contexts.append(sentence.strip())
        
        if sentiment_scores:
            avg_sentiment = np.mean(sentiment_scores)
            category = 'positive' if avg_sentiment > 0.1 else 'negative' if avg_sentiment < -0.1 else 'neutral'
        else:
            avg_sentiment = 0
            category = 'neutral'
        
        return {
            'score': avg_sentiment,
            'category': category,
            'contexts': contexts
        }
    
    def _get_sentiment_color(self, score):
        """Get color based on sentiment score"""
        if score > 0.1:
            return '#10B981'  # Green for positive
        elif score < -0.1:
            return '#EF4444'  # Red for negative
        else:
            return '#6B7280'  # Gray for neutral
    
    def _get_emotion_emoji(self, emotion):
        """Get emoji for emotion"""
        emoji_map = {
            'happy': '😊', 'sad': '😢', 'angry': '😠', 'anxious': '😟',
            'excited': '🤩', 'calm': '😌', 'neutral': '😐', 'grateful': '🙏',
            'frustrated': '😤', 'content': '😊', 'tired': '😴', 'stressed': '😰'
        }
        return emoji_map.get(emotion.lower(), '😐')
    
    def _empty_insights(self):
        """Return empty insights structure"""
        return {
            'emotion_distribution': [],
            'sentiment_analysis': {'distribution': [], 'over_time': []},
            'word_cloud': [],
            'writing_patterns': {},
            'mood_correlations': {},
            'advanced_analytics': {},
            'ai_insights': {}
        }

    def _calculate_emotion_trend(self, df, emotion):
        """Calculate trend for specific emotion"""
        try:
            df['date'] = pd.to_datetime(df['created_at']).dt.date
            emotion_by_date = df[df['mood'] == emotion].groupby('date').size()

            if len(emotion_by_date) < 2:
                return 'stable'

            # Simple trend calculation
            recent_avg = emotion_by_date.tail(3).mean()
            older_avg = emotion_by_date.head(3).mean()

            if recent_avg > older_avg * 1.2:
                return 'increasing'
            elif recent_avg < older_avg * 0.8:
                return 'decreasing'
            else:
                return 'stable'
        except:
            return 'stable'

    def _create_sentiment_distribution(self, sentiment_scores):
        """Create sentiment distribution data"""
        distribution = [
            {'sentiment': 'Very Positive', 'value': 0, 'color': '#10B981'},
            {'sentiment': 'Positive', 'value': 0, 'color': '#34D399'},
            {'sentiment': 'Neutral', 'value': 0, 'color': '#6B7280'},
            {'sentiment': 'Negative', 'value': 0, 'color': '#F87171'},
            {'sentiment': 'Very Negative', 'value': 0, 'color': '#EF4444'}
        ]

        for score in sentiment_scores:
            if score >= 0.6:
                distribution[0]['value'] += 1
            elif score >= 0.2:
                distribution[1]['value'] += 1
            elif score >= -0.2:
                distribution[2]['value'] += 1
            elif score >= -0.6:
                distribution[3]['value'] += 1
            else:
                distribution[4]['value'] += 1

        total = len(sentiment_scores)
        for item in distribution:
            item['value'] = round((item['value'] / total) * 100, 1) if total > 0 else 0

        return distribution

    def _sentiment_label(self, score):
        """Get sentiment label from score"""
        if score >= 0.6:
            return 'Very Positive'
        elif score >= 0.2:
            return 'Positive'
        elif score >= -0.2:
            return 'Neutral'
        elif score >= -0.6:
            return 'Negative'
        else:
            return 'Very Negative'

    def _analyze_time_patterns(self, df):
        """Analyze writing time patterns"""
        time_dist = {'morning': 0, 'afternoon': 0, 'evening': 0, 'night': 0}

        for hour in df['hour']:
            if 6 <= hour < 12:
                time_dist['morning'] += 1
            elif 12 <= hour < 18:
                time_dist['afternoon'] += 1
            elif 18 <= hour < 22:
                time_dist['evening'] += 1
            else:
                time_dist['night'] += 1

        total = len(df)
        return [
            {
                'time': time.title(),
                'count': count,
                'percentage': round((count / total) * 100, 1) if total > 0 else 0
            }
            for time, count in time_dist.items()
        ]

    def _analyze_length_patterns(self, df):
        """Analyze entry length patterns"""
        length_dist = {'0-100': 0, '100-300': 0, '300-500': 0, '500+': 0}

        for word_count in df['word_count']:
            if word_count <= 100:
                length_dist['0-100'] += 1
            elif word_count <= 300:
                length_dist['100-300'] += 1
            elif word_count <= 500:
                length_dist['300-500'] += 1
            else:
                length_dist['500+'] += 1

        total = len(df)
        return [
            {
                'range': f"{range_key} words",
                'count': count,
                'percentage': round((count / total) * 100, 1) if total > 0 else 0
            }
            for range_key, count in length_dist.items()
        ]

    def _calculate_writing_streak(self, df):
        """Calculate current writing streak"""
        try:
            df['date'] = pd.to_datetime(df['created_at']).dt.date
            unique_dates = sorted(df['date'].unique(), reverse=True)

            if not unique_dates:
                return 0

            streak = 1
            current_date = unique_dates[0]

            for i in range(1, len(unique_dates)):
                expected_date = current_date - timedelta(days=i)
                if unique_dates[i] == expected_date:
                    streak += 1
                else:
                    break

            return streak
        except:
            return 0

    def _analyze_productivity(self, df):
        """Analyze writing productivity"""
        try:
            df['date'] = pd.to_datetime(df['created_at']).dt.date
            daily_stats = df.groupby('date').agg({
                'word_count': ['sum', 'count', 'mean']
            }).round(1)

            return {
                'most_productive_day': daily_stats['word_count']['sum'].idxmax().isoformat(),
                'average_daily_words': round(daily_stats['word_count']['sum'].mean(), 1),
                'average_entries_per_day': round(daily_stats['word_count']['count'].mean(), 1),
                'productivity_trend': self._calculate_productivity_trend(daily_stats)
            }
        except:
            return {}

    def _calculate_productivity_trend(self, daily_stats):
        """Calculate productivity trend"""
        try:
            recent_avg = daily_stats['word_count']['sum'].tail(7).mean()
            older_avg = daily_stats['word_count']['sum'].head(7).mean()

            if recent_avg > older_avg * 1.1:
                return 'increasing'
            elif recent_avg < older_avg * 0.9:
                return 'decreasing'
            else:
                return 'stable'
        except:
            return 'stable'
