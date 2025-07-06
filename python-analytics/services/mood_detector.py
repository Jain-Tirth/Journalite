import os
import re
import numpy as np
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import google.generativeai as genai
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import logging

logger = logging.getLogger(__name__)


class MoodDetector:
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        self.emotion_classifier = None
        self.gemini_model = None

        # Emotion keywords mapping
        self.emotion_keywords = {
            "happy": [
                "happy",
                "joy",
                "excited",
                "cheerful",
                "delighted",
                "pleased",
                "content",
                "satisfied",
                "glad",
                "elated",
            ],
            "sad": [
                "sad",
                "depressed",
                "heartbroken",
                "lonely",
                "rejected",
                "crying",
                "cheated",
            ],
            "angry": ["angry", "mad", "rage", "betrayed", "cheated"],
            "anxious": ["worried", "scared", "insecure", "paranoid"],
            "excited": ["excited","thrilled","enthusiastic","eager","pumped","energetic","animated","exhilarated","ecstatic",],
            "calm": [
                "calm",
                "peaceful",
                "relaxed",
                "serene",
                "tranquil",
                "composed",
                "zen",
                "balanced",
                "centered",
                "still",
            ],
            "grateful": [
                "grateful",
                "thankful",
                "appreciative",
                "blessed",
                "fortunate",
                "lucky",
                "indebted",
                "obliged",
            ],
            "confused": [
                "confused",
                "puzzled",
                "bewildered",
                "perplexed",
                "uncertain",
                "unclear",
                "lost",
                "mixed up",
            ],
            "surprised": [
                "surprised",
                "shocked",
                "amazed",
                "astonished",
                "stunned",
                "startled",
                "bewildered",
                "flabbergasted",
            ],
            "tired": [
                "tired",
                "exhausted",
                "weary",
                "fatigued",
                "drained",
                "worn out",
                "sleepy",
                "lethargic",
                "spent",
            ],
            "heartbroken": ["sad", "betrayed", "broken", "hurt", "grief"],
            "cheater" : ["betrayed", "deceived", "heartbroken"],
        }

    def initialize_models(self):
        """Initialize AI models"""
        try:
            # Initialize Gemini AI
            if os.getenv("GOOGLE_API_KEY"):
                genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
                self.gemini_model = genai.GenerativeModel("gemini-pro")
                logger.info("Gemini AI model initialized")

            # Initialize emotion classification model
            try:
                model_name = "bhadresh-savani/distilbert-base-uncased-emotion"

                self.emotion_classifier = pipeline(
                    "text-classification",
                    model=model_name,
                    tokenizer=model_name,
                    return_all_scores=True,
                )
                logger.info("Emotion classification model initialized")
            except Exception as e:
                logger.warning(f"Could not load emotion model: {e}")

        except Exception as e:
            logger.error(f"Error initializing models: {e}")

    def detect_mood(self, text):
        """Detect mood from text using multiple AI approaches"""
        try:
            # Clean and preprocess text
            cleaned_text = self._preprocess_text(text)

            # Get sentiment scores
            sentiment_scores = self._analyze_sentiment(cleaned_text)

            # Get emotion predictions
            emotion_scores = self._classify_emotions(cleaned_text)

            # Get keyword-based emotions
            keyword_emotions = self._detect_keyword_emotions(cleaned_text)

            # Use Gemini AI for advanced mood detection
            gemini_mood = self._gemini_mood_detection(cleaned_text)

            # Combine all approaches for final mood
            final_mood = self._combine_mood_predictions(
                sentiment_scores, emotion_scores, keyword_emotions, gemini_mood
            )

            return {
                "primary_mood": final_mood["mood"],
                "confidence": final_mood["confidence"],
                "emotions": emotion_scores,
                "sentiment_score": sentiment_scores["compound"],
                "keywords": self._extract_mood_keywords(cleaned_text),
                "detailed_analysis": {
                    "sentiment": sentiment_scores,
                    "keyword_emotions": keyword_emotions,
                    "gemini_analysis": gemini_mood,
                },
            }

        except Exception as e:
            logger.error(f"Error detecting mood: {e}")
            return self._fallback_mood_detection(text)

    def _preprocess_text(self, text):
        """Clean and preprocess text"""
        # Remove URLs, mentions, hashtags
        text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
        text = re.sub(r"@\w+|#\w+", "", text)

        # Remove extra whitespace
        text = " ".join(text.split())

        return text.lower().strip()

    def _analyze_sentiment(self, text):
        """Analyze sentiment using VADER and TextBlob"""
        # VADER sentiment
        vader_scores = self.vader_analyzer.polarity_scores(text)

        # TextBlob sentiment
        blob = TextBlob(text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity

        return {
            "compound": vader_scores["compound"],
            "positive": vader_scores["pos"],
            "negative": vader_scores["neg"],
            "neutral": vader_scores["neu"],
            "polarity": textblob_polarity,
            "subjectivity": textblob_subjectivity,
        }

    def _classify_emotions(self, text):
        """Classify emotions using transformer model"""
        if not self.emotion_classifier:
            return {}

        try:
            # Truncate text if too long
            if len(text) > 512:
                text = text[:512]

            results = self.emotion_classifier(text)

            # Convert to dictionary
            emotions = {}
            for result in results[0]:
                emotions[result["label"].lower()] = result["score"]

            return emotions

        except Exception as e:
            logger.error(f"Error in emotion classification: {e}")
            return {}

    def _detect_keyword_emotions(self, text):
        """Detect emotions based on keywords"""
        emotion_scores = {}
        words = text.split()

        for emotion, keywords in self.emotion_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword in text:
                    score += 1

            # Normalize by text length
            if len(words) > 0:
                emotion_scores[emotion] = score / len(words)
            else:
                emotion_scores[emotion] = 0

        return emotion_scores

    def _gemini_mood_detection(self, text):
        """Use Gemini AI for advanced mood detection"""
        if not self.gemini_model:
            return None

        try:
            prompt = f"""
            Analyze the emotional tone and mood of this journal entry. 
            Provide a detailed analysis including:
            1. Primary mood (happy, sad, angry, anxious, excited, calm, grateful, confused, surprised, tired, heartbroekn, cheated)
            2. Confidence level (0-1)
            3. Secondary emotions present
            4. Emotional intensity (low, medium, high)
            5. Key emotional indicators in the text
            
            Text: "{text}"
            
            Respond in JSON format:
            {{
                "primary_mood": "mood_name",
                "confidence": 0.85,
                "secondary_emotions": ["emotion1", "emotion2"],
                "intensity": "medium",
                "indicators": ["phrase1", "phrase2"]
            }}
            """

            response = self.gemini_model.generate_content(prompt)

            # Try to parse JSON response
            import json

            try:
                return json.loads(response.text)
            except:
                # Fallback parsing
                return self._parse_gemini_response(response.text)

        except Exception as e:
            logger.error(f"Error in Gemini mood detection: {e}")
            return None

    def _parse_gemini_response(self, response_text):
        """Parse Gemini response if JSON parsing fails"""
        try:
            # Extract mood using regex
            mood_match = re.search(r'"primary_mood":\s*"([^"]+)"', response_text)
            confidence_match = re.search(r'"confidence":\s*([0-9.]+)', response_text)

            return {
                "primary_mood": mood_match.group(1) if mood_match else "neutral",
                "confidence": (
                    float(confidence_match.group(1)) if confidence_match else 0.5
                ),
                "secondary_emotions": [],
                "intensity": "medium",
                "indicators": [],
            }
        except:
            return None

    def _combine_mood_predictions(self, sentiment, emotions, keywords, gemini):
        """Combine all mood predictions into final result"""
        mood_scores = {}

        # Weight different approaches
        weights = {
            "sentiment": 0.3,
            "emotions": 0.4,
            "keywords": 0.2,
            "gemini": 0.1 if gemini else 0,
        }

        # Adjust weights if Gemini is available
        if gemini:
            weights["gemini"] = 0.3
            weights["emotions"] = 0.3
            weights["sentiment"] = 0.2

        # Map sentiment to moods
        if sentiment["compound"] > 0.5:
            mood_scores["happy"] = sentiment["compound"] * weights["sentiment"]
        elif sentiment["compound"] < -0.5:
            mood_scores["sad"] = abs(sentiment["compound"]) * weights["sentiment"]
        else:
            mood_scores["neutral"] = (1 - abs(sentiment["compound"])) * weights[
                "sentiment"
            ]

        # Add emotion scores
        for emotion, score in emotions.items():
            if emotion in mood_scores:
                mood_scores[emotion] += score * weights["emotions"]
            else:
                mood_scores[emotion] = score * weights["emotions"]

        # Add keyword scores
        for emotion, score in keywords.items():
            if emotion in mood_scores:
                mood_scores[emotion] += score * weights["keywords"]
            else:
                mood_scores[emotion] = score * weights["keywords"]

        # Add Gemini prediction
        if gemini and gemini.get("primary_mood"):
            gemini_mood = gemini["primary_mood"].lower()
            gemini_confidence = gemini.get("confidence", 0.5)

            if gemini_mood in mood_scores:
                mood_scores[gemini_mood] += gemini_confidence * weights["gemini"]
            else:
                mood_scores[gemini_mood] = gemini_confidence * weights["gemini"]

        # Find the mood with highest score
        if mood_scores:
            primary_mood = max(mood_scores, key=mood_scores.get)
            confidence = min(mood_scores[primary_mood], 1.0)
        else:
            primary_mood = "neutral"
            confidence = 0.5

        return {
            "mood": primary_mood,
            "confidence": confidence,
            "all_scores": mood_scores,
        }

    def _extract_mood_keywords(self, text):
        """Extract keywords that indicate mood"""
        keywords = []
        words = text.split()

        for emotion, emotion_keywords in self.emotion_keywords.items():
            for keyword in emotion_keywords:
                if keyword in text:
                    keywords.append(keyword)

        return list(set(keywords))

    def _fallback_mood_detection(self, text):
        """Fallback mood detection using simple methods"""
        try:
            # Simple sentiment analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity

            if polarity > 0.3:
                mood = "happy"
                confidence = min(polarity, 1.0)
            elif polarity < -0.3:
                mood = "sad"
                confidence = min(abs(polarity), 1.0)
            else:
                mood = "neutral"
                confidence = 0.5

            return {
                "primary_mood": mood,
                "confidence": confidence,
                "emotions": {},
                "sentiment_score": polarity,
                "keywords": [],
                "detailed_analysis": {},
            }

        except Exception as e:
            logger.error(f"Fallback mood detection failed: {e}")
            return {
                "primary_mood": "neutral",
                "confidence": 0.5,
                "emotions": {},
                "sentiment_score": 0.0,
                "keywords": [],
                "detailed_analysis": {},
            }
