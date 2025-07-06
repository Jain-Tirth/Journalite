/*AI-Powered Mood and Sentiment Analysis Service
Replaces hardcoded keyword arrays with intelligent AI analysis*/

import { GoogleGenerativeAI } from '@google/generative-ai';

class AIMoodAnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  /* AI-powered mood detection from text*/
  async analyzeMood(text) {
    try {
      const prompt = `Analyze the emotional tone and mood of the following journal entry with deep contextual understanding using advanced AI emotional intelligence.

Text: "${text}"

Please respond with ONLY a JSON object in this exact format:
{
  "mood": "one of or mixture of these: happy, sad, angry, anxious, excited, calm, grateful, neutral, frustrated, hopeful, lonely, confident, overwhelmed, peaceful, energetic, melancholy, optimistic, stressed, content, disappointed",
  "confidence": 0.85,
  "emotions": {
    "primary": "happy",
    "secondary": ["grateful", "excited"],
    "intensity": "moderate"
  },
  "sentiment": {
    "polarity": 0.7,
    "subjectivity": 0.6
  },
  "reasoning": "Brief explanation of why this mood was detected"
}

Guidelines for analysis:
1. Do NOT rely solely on keywords—interpret the *overall emotional narrative*.
2. Consider the situation described, emotional implications, and possible underlying thoughts or fears.
3. Detect nuanced or implied emotions such as jealousy, insecurity, or grief, even if not explicitly stated.
4. Evaluate the *psychological state* of the user as expressed across the entire journal entry.
5. Choose the most accurate mood classification that reflects the dominant feeling the user is going through.
Choose the most appropriate mood based on deep understanding of the emotional content.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const moodData = JSON.parse(response.text());
        return {
          success: true,
          mood: moodData.mood,
          confidence: moodData.confidence,
          emotions: moodData.emotions,
          sentiment: moodData.sentiment,
          keywords: moodData.keywords,
          reasoning: moodData.reasoning
        };
      } catch (parseError) {
        console.warn('⚠️ AI response parsing failed, using fallback');
        return this.fallbackMoodAnalysis(text);
      }
    } catch (error) {
      console.error('❌ AI mood analysis failed:', error);
      return this.fallbackMoodAnalysis(text);
    }
  }

  /**
   * AI-powered sentiment analysis for words/phrases
   */
  async analyzeSentiment(words) {
    try {
      const prompt = `Analyze the sentiment of these words/phrases from journal entries:

Words: ${JSON.stringify(words)}

For each word, determine if it's positive, negative, or neutral based on emotional context and psychological impact.

Respond with ONLY a JSON object:
{
  "word1": {
    "sentiment": "positive|negative|neutral",
    "intensity": 0.8,
    "emotional_category": "joy|sadness|anger|fear|surprise|disgust|neutral",
    "psychological_impact": "uplifting|concerning|neutral"
  },
  "word2": { ... }
}

Consider:
1. Contextual meaning beyond dictionary definitions
2. Emotional connotations and associations
3. Psychological impact on mental state
4. Cultural and social implications
5. Intensity of emotional charge`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const sentimentData = JSON.parse(response.text());
        return {
          success: true,
          sentiments: sentimentData
        };
      } catch (parseError) {
        console.warn('⚠️ AI sentiment parsing failed, using fallback');
        return this.fallbackSentimentAnalysis(words);
      }
    } catch (error) {
      console.error('❌ AI sentiment analysis failed:', error);
      return this.fallbackSentimentAnalysis(words);
    }
  }

  /**
   * AI-powered emotion distribution analysis
   */
  async analyzeEmotionDistribution(entries) {
    try {
      // Extract text content from entries
      const entryTexts = entries.map(entry => ({
        id: entry.id,
        text: `${entry.title || ''} ${entry.content || ''}`.trim(),
        date: entry.createdAt
      }));

      const prompt = `Analyze the emotional distribution across these journal entries:

Entries: ${JSON.stringify(entryTexts.slice(0, 20))} ${entryTexts.length > 20 ? '... and ' + (entryTexts.length - 20) + ' more entries' : ''}

Provide a comprehensive emotional analysis in JSON format:
{
  "emotion_distribution": [
    {
      "name": "Happy",
      "value": 35,
      "count": 7,
      "emoji": "😊",
      "intensity": "moderate",
      "trend": "increasing"
    }
  ],
  "dominant_emotions": ["happy", "grateful", "excited"],
  "emotional_complexity": "high|moderate|low",
  "emotional_stability": "stable|fluctuating|concerning",
  "insights": [
    "User shows consistent positive emotional patterns",
    "Strong presence of gratitude indicates good mental health"
  ]
}

Analyze for:
1. Primary emotional themes
2. Emotional intensity and depth
3. Psychological patterns and trends
4. Mental health indicators
5. Emotional growth and development`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const analysis = JSON.parse(response.text());
        return {
          success: true,
          distribution: analysis.emotion_distribution,
          insights: analysis
        };
      } catch (parseError) {
        console.warn('⚠️ AI emotion analysis parsing failed');
        return this.fallbackEmotionDistribution(entries);
      }
    } catch (error) {
      console.error('❌ AI emotion distribution analysis failed:', error);
      return this.fallbackEmotionDistribution(entries);
    }
  }

  /**
   * AI-powered word cloud with intelligent sentiment
   */
  async generateIntelligentWordCloud(entries) {
    try {
      // Extract all text
      const allText = entries.map(entry => `${entry.title || ''} ${entry.content || ''}`).join(' ');
      
      const prompt = `Analyze this journal text and create an intelligent word cloud with sentiment analysis:

Text: "${allText.substring(0, 2000)}${allText.length > 2000 ? '...' : ''}"

Extract the most meaningful words and phrases, then analyze their emotional significance.

Respond with JSON:
{
  "words": [
    {
      "text": "grateful",
      "frequency": 8,
      "sentiment": "positive",
      "emotional_weight": 0.9,
      "psychological_significance": "high",
      "color": "#10B981",
      "size": 24,
      "category": "emotion"
    }
  ],
  "themes": ["gratitude", "growth", "relationships"],
  "emotional_tone": "predominantly positive",
  "psychological_insights": ["Strong self-awareness", "Positive coping mechanisms"]
}

Focus on:
1. Emotionally significant words
2. Psychological indicators
3. Personal growth themes
4. Relationship and social words
5. Achievement and goal-related terms

Exclude common stop words and focus on meaningful content.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      try {
        const wordCloudData = JSON.parse(response.text());
        return {
          success: true,
          words: wordCloudData.words,
          insights: wordCloudData
        };
      } catch (parseError) {
        console.warn('⚠️ AI word cloud parsing failed');
        return this.fallbackWordCloud(entries);
      }
    } catch (error) {
      console.error('❌ AI word cloud generation failed:', error);
      return this.fallbackWordCloud(entries);
    }
  }

  /**
   * Fallback mood analysis using simple heuristics
   */
  fallbackMoodAnalysis(text) {
    const positiveWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'grateful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'tired', 'upset'];
    
    const textLower = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
    
    let mood = 'neutral';
    let confidence = 0.5;
    
    if (positiveCount > negativeCount) {
      mood = 'happy';
      confidence = Math.min(0.8, 0.5 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      mood = 'sad';
      confidence = Math.min(0.8, 0.5 + (negativeCount * 0.1));
    }
    
    return {
      success: true,
      mood,
      confidence,
      emotions: { primary: mood, secondary: [], intensity: 'moderate' },
      sentiment: { polarity: positiveCount > negativeCount ? 0.5 : -0.5, subjectivity: 0.5 },
      keywords: [...positiveWords, ...negativeWords].filter(word => textLower.includes(word)),
      reasoning: 'Fallback analysis based on keyword matching'
    };
  }

  /**
   * Fallback sentiment analysis
   */
  fallbackSentimentAnalysis(words) {
    const sentiments = {};
    const positiveWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'grateful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'tired', 'upset'];
    
    words.forEach(word => {
      const wordLower = word.toLowerCase();
      if (positiveWords.includes(wordLower)) {
        sentiments[word] = { sentiment: 'positive', intensity: 0.7, emotional_category: 'joy', psychological_impact: 'uplifting' };
      } else if (negativeWords.includes(wordLower)) {
        sentiments[word] = { sentiment: 'negative', intensity: 0.7, emotional_category: 'sadness', psychological_impact: 'concerning' };
      } else {
        sentiments[word] = { sentiment: 'neutral', intensity: 0.3, emotional_category: 'neutral', psychological_impact: 'neutral' };
      }
    });
    
    return { success: true, sentiments };
  }

  /**
   * Fallback emotion distribution
   */
  fallbackEmotionDistribution(entries) {
    const emotionCounts = {};
    entries.forEach(entry => {
      if (entry.mood) {
        emotionCounts[entry.mood] = (emotionCounts[entry.mood] || 0) + 1;
      }
    });
    
    const total = entries.length;
    const distribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: Math.round((count / total) * 100),
      count,
      emoji: this.getEmotionEmoji(emotion),
      intensity: 'moderate',
      trend: 'stable'
    }));
    
    return {
      success: true,
      distribution,
      insights: {
        dominant_emotions: distribution.slice(0, 3).map(d => d.name.toLowerCase()),
        emotional_complexity: 'moderate',
        emotional_stability: 'stable'
      }
    };
  }

  /**
   * Fallback word cloud
   */
  fallbackWordCloud(entries) {
    const wordCounts = {};
    const allText = entries.map(entry => `${entry.title || ''} ${entry.content || ''}`).join(' ').toLowerCase();
    const words = allText.split(/\s+/).filter(word => word.length > 3);
    
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const wordData = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .map(([text, frequency]) => ({
        text,
        frequency,
        sentiment: 'neutral',
        emotional_weight: 0.5,
        psychological_significance: 'medium',
        color: '#6B7280',
        size: Math.max(12, Math.min(36, frequency * 2 + 12)),
        category: 'general'
      }));
    
    return {
      success: true,
      words: wordData,
      insights: { themes: ['general'], emotional_tone: 'neutral' }
    };
  }

  /**
   * Get emoji for emotion
   */
  getEmotionEmoji(emotion) {
    const emojiMap = {
      happy: '😊', sad: '😢', angry: '😠', anxious: '😟', excited: '🤩',
      calm: '😌', neutral: '😐', grateful: '🙏', frustrated: '😤',
      hopeful: '🌟', lonely: '😔', confident: '😎', overwhelmed: '😵',
      peaceful: '☮️', energetic: '⚡', melancholy: '🌧️', optimistic: '🌈',
      stressed: '😰', content: '😌', disappointed: '😞'
    };
    return emojiMap[emotion?.toLowerCase()] || '😐';
  }
}

export const aiMoodAnalysisService = new AIMoodAnalysisService();
