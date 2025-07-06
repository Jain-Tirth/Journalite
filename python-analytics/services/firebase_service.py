import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from .mood_detector import MoodDetector
import logging

logger = logging.getLogger(__name__)

class FirebaseService:
    def __init__(self):
        self.db = None
        self.mood_detector = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase connection"""
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Initialize Firebase Admin SDK
                if os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'):
                    # Use service account key from environment
                    service_account_info = json.loads(os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'))
                    cred = credentials.Certificate(service_account_info)
                elif os.path.exists('firebase-service-account.json'):
                    # Use service account key file
                    cred = credentials.Certificate('firebase-service-account.json')
                else:
                    # Use default credentials (for Google Cloud environments)
                    cred = credentials.ApplicationDefault()
                
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            self.mood_detector = MoodDetector()
            self.mood_detector.initialize_models()
            
            logger.info("Firebase service initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Firebase: {e}")
            self.db = None
    
    def get_user_entries(self, user_id):
        """Get all journal entries for a user"""
        try:
            if not self.db:
                raise Exception("Firebase not initialized")
            
            entries_ref = self.db.collection('journal_entries')
            query = entries_ref.where('userId', '==', user_id).order_by('createdAt', direction=firestore.Query.DESCENDING)
            
            entries = []
            for doc in query.stream():
                entry_data = doc.to_dict()
                entry_data['id'] = doc.id
                entries.append(entry_data)
            
            logger.info(f"Retrieved {len(entries)} entries for user {user_id}")
            return entries
            
        except Exception as e:
            logger.error(f"Error getting user entries: {e}")
            return []
    
    def update_entry_mood(self, entry_id, mood_data):
        """Update an entry with detected mood"""
        try:
            if not self.db:
                raise Exception("Firebase not initialized")
            
            entry_ref = self.db.collection('journal_entries').document(entry_id)
            
            update_data = {
                'mood': mood_data['primary_mood'],
                'moodConfidence': mood_data['confidence'],
                'detectedEmotions': mood_data['emotions'],
                'sentimentScore': mood_data['sentiment_score'],
                'moodKeywords': mood_data['keywords'],
                'aiMoodDetection': True,
                'moodDetectedAt': firestore.SERVER_TIMESTAMP
            }
            
            entry_ref.update(update_data)
            logger.info(f"Updated entry {entry_id} with mood: {mood_data['primary_mood']}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating entry mood: {e}")
            return False
    
    def update_entries_with_mood_detection(self, user_id):
        """Auto-detect and update moods for all user entries"""
        try:
            # Get all entries for the user
            entries = self.get_user_entries(user_id)
            
            updated_count = 0
            failed_count = 0
            
            for entry in entries:
                try:
                    # Skip if mood already detected by AI
                    if entry.get('aiMoodDetection'):
                        continue
                    
                    # Detect mood from content
                    content = entry.get('content', '')
                    if not content:
                        continue
                    
                    mood_result = self.mood_detector.detect_mood(content)
                    
                    # Update the entry
                    if self.update_entry_mood(entry['id'], mood_result):
                        updated_count += 1
                    else:
                        failed_count += 1
                        
                except Exception as e:
                    logger.error(f"Error processing entry {entry.get('id', 'unknown')}: {e}")
                    failed_count += 1
            
            logger.info(f"Mood detection complete: {updated_count} updated, {failed_count} failed")
            
            return {
                'updated_count': updated_count,
                'failed_count': failed_count,
                'total_processed': len(entries)
            }
            
        except Exception as e:
            logger.error(f"Error in batch mood detection: {e}")
            return {
                'updated_count': 0,
                'failed_count': 0,
                'total_processed': 0,
                'error': str(e)
            }
    
    def get_user_analytics_cache(self, user_id):
        """Get cached analytics for a user"""
        try:
            if not self.db:
                return None
            
            cache_ref = self.db.collection('analytics_cache').document(user_id)
            cache_doc = cache_ref.get()
            
            if cache_doc.exists:
                cache_data = cache_doc.to_dict()
                # Check if cache is still valid (less than 1 hour old)
                cache_time = cache_data.get('generated_at')
                if cache_time:
                    from datetime import datetime, timedelta
                    if datetime.now() - cache_time.replace(tzinfo=None) < timedelta(hours=1):
                        return cache_data.get('insights')
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting analytics cache: {e}")
            return None
    
    def save_user_analytics_cache(self, user_id, insights):
        """Save analytics cache for a user"""
        try:
            if not self.db:
                return False
            
            cache_ref = self.db.collection('analytics_cache').document(user_id)
            
            cache_data = {
                'insights': insights,
                'generated_at': firestore.SERVER_TIMESTAMP,
                'user_id': user_id
            }
            
            cache_ref.set(cache_data)
            logger.info(f"Saved analytics cache for user {user_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error saving analytics cache: {e}")
            return False
    
    def log_analytics_request(self, user_id, request_type, processing_time):
        """Log analytics request for monitoring"""
        try:
            if not self.db:
                return
            
            log_ref = self.db.collection('analytics_logs')
            
            log_data = {
                'user_id': user_id,
                'request_type': request_type,
                'processing_time': processing_time,
                'timestamp': firestore.SERVER_TIMESTAMP
            }
            
            log_ref.add(log_data)
            
        except Exception as e:
            logger.error(f"Error logging analytics request: {e}")
    
    def get_user_preferences(self, user_id):
        """Get user preferences for analytics"""
        try:
            if not self.db:
                return {}
            
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                return user_data.get('analyticsPreferences', {})
            
            return {}
            
        except Exception as e:
            logger.error(f"Error getting user preferences: {e}")
            return {}
    
    def update_user_analytics_preferences(self, user_id, preferences):
        """Update user analytics preferences"""
        try:
            if not self.db:
                return False
            
            user_ref = self.db.collection('users').document(user_id)
            
            user_ref.update({
                'analyticsPreferences': preferences,
                'preferencesUpdatedAt': firestore.SERVER_TIMESTAMP
            })
            
            logger.info(f"Updated analytics preferences for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating user preferences: {e}")
            return False
