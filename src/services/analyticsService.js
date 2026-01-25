/**
 * Unified Analytics Service for Journalite
 * 
 * This service consolidates all analytics functionality:
 *  AI-powered analysis using Google Gemini
 * Architecture Decision:
 * We use Gemini AI as the primary analytics engine because it provides:
 * - Superior contextual understanding
 * - No need for separate Python deployment
 * - Faster response times
 * - Lower infrastructure costs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class AnalyticsService {
  constructor() {
    // Initialize Gemini AI
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.isAIAvailable = !!this.apiKey;
    
    if (this.isAIAvailable) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      } catch (error) {
        console.error('❌ Error initializing Gemini AI:', error);
        this.isAIAvailable = false;
      }
    }

    // Python backend configuration (optional)
    this.pythonBaseURL = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8080';
    this.pythonAvailable = false;
    this.checkPythonBackend();

    // Cache configuration
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Check if Python backend is available
   */
  async checkPythonBackend() {
    try {
      const response = await fetch(`${this.pythonBaseURL}/health`, {
        timeout: 2000 // Quick timeout
      });
      this.pythonAvailable = response.ok;
    } catch (error) {
      this.pythonAvailable = false;
    }
  }

  /**
   * ============================================
   * MOOD ANALYSIS
   * ============================================
   */

  /**
   * Analyze mood from journal entry text
   * Uses AI with intelligent fallback
   */
  async analyzeMood(text) {
    if (!text || text.trim().length === 0) {
      return this.getDefaultMoodResult();
    }

    // Try AI first (primary method)
    if (this.isAIAvailable) {
      try {
        return await this.analyzeMoodWithAI(text);
      } catch (error) {
        console.warn('⚠️ AI mood analysis failed, trying fallback:', error.message);
      }
    }

    // Last resort: client-side heuristics
    return this.analyzeMoodWithHeuristics(text);
  }

  /**
   * AI-powered mood analysis using Gemini
   */
  async analyzeMoodWithAI(text) {
    const prompt = `Analyze the emotional tone and mood of this journal entry with deep contextual understanding.

Text: "${text}"

Respond with ONLY a JSON object in this exact format:
{
  "mood": "happy|sad|angry|anxious|excited|calm|grateful|neutral|frustrated|hopeful|lonely|confident|overwhelmed|peaceful|energetic|melancholy|optimistic|stressed|content|disappointed",
  "confidence": 0.85,
  "emotions": {
    "primary": "happy",
    "secondary": ["grateful", "excited"],
    "intensity": "high|moderate|low"
  },
  "sentiment": {
    "polarity": 0.7,
    "subjectivity": 0.6
  },
  "keywords": ["achievement", "progress", "grateful"],
  "reasoning": "Brief explanation of the detected mood"
}

Guidelines:
1. Interpret the overall emotional narrative, not just keywords
2. Consider situational context and emotional implications
3. Detect nuanced emotions like jealousy, insecurity, or grief
4. Evaluate the psychological state across the entire entry`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    try {
      const cleanedText = response.text().replace(/```json\n?|\n?```/g, '').trim();
      const moodData = JSON.parse(cleanedText);
      
      return {
        success: true,
        mood: moodData.mood,
        confidence: moodData.confidence,
        emotions: moodData.emotions,
        sentiment: moodData.sentiment,
        keywords: moodData.keywords || [],
        reasoning: moodData.reasoning,
        source: 'ai'
      };
    } catch (parseError) {
      console.error('❌ AI response parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  }

  // /**
  //  * Client-side heuristic mood analysis
  //  */
  // analyzeMoodWithHeuristics(text) {
  //   const moodKeywords = {
  //     happy: ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'grateful', 'blessed'],
  //     sad: ['sad', 'depressed', 'down', 'upset', 'crying', 'tears', 'lonely', 'hurt', 'miss'],
  //     angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'rage', 'hate', 'irritated'],
  //     anxious: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'fear', 'scared', 'overwhelmed'],
  //     excited: ['excited', 'thrilled', 'pumped', 'energetic', 'enthusiastic', 'can\'t wait'],
  //     calm: ['calm', 'peaceful', 'relaxed', 'zen', 'tranquil', 'serene', 'content'],
  //     grateful: ['grateful', 'thankful', 'blessed', 'appreciate', 'lucky', 'fortunate']
  //   };

  //   const textLower = text.toLowerCase();
  //   const moodScores = {};
  //   let totalScore = 0;

  //   // Calculate mood scores
  //   for (const [mood, keywords] of Object.entries(moodKeywords)) {
  //     const score = keywords.filter(keyword => textLower.includes(keyword)).length;
  //     if (score > 0) {
  //       moodScores[mood] = score;
  //       totalScore += score;
  //     }
  //   }

  //   // Determine primary mood
  //   let primaryMood = 'neutral';
  //   let confidence = 0.5;
  //   let detectedKeywords = [];

  //   if (totalScore > 0) {
  //     primaryMood = Object.keys(moodScores).reduce((a, b) => 
  //       moodScores[a] > moodScores[b] ? a : b
  //     );
  //     confidence = Math.min(0.8, 0.5 + (moodScores[primaryMood] * 0.1));
  //     detectedKeywords = Object.keys(moodScores);
  //   }

  //   // Calculate sentiment polarity
  //   const positiveWords = ['happy', 'joy', 'excited', 'great', 'amazing', 'wonderful', 'love', 'grateful'];
  //   const negativeWords = ['sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'upset'];
    
  //   const positiveCount = positiveWords.filter(w => textLower.includes(w)).length;
  //   const negativeCount = negativeWords.filter(w => textLower.includes(w)).length;
    
  //   const polarity = totalScore > 0 
  //     ? (positiveCount - negativeCount) / totalScore 
  //     : 0;

  //   return {
  //     success: true,
  //     mood: primaryMood,
  //     confidence,
  //     emotions: {
  //       primary: primaryMood,
  //       secondary: Object.keys(moodScores).filter(m => m !== primaryMood).slice(0, 2),
  //       intensity: confidence > 0.7 ? 'high' : confidence > 0.5 ? 'moderate' : 'low'
  //     },
  //     sentiment: {
  //       polarity,
  //       subjectivity: 0.5
  //     },
  //     keywords: detectedKeywords,
  //     reasoning: 'Detected based on keyword analysis',
  //     source: 'heuristics'
  //   };
  // }

  getDefaultMoodResult() {
    return {
      success: true,
      mood: 'neutral',
      confidence: 0.5,
      emotions: { primary: 'neutral', secondary: [], intensity: 'low' },
      sentiment: { polarity: 0, subjectivity: 0 },
      keywords: [],
      reasoning: 'No text provided',
      source: 'default'
    };
  }

  /**
   * ============================================
   * EMOTION DISTRIBUTION ANALYSIS
   * ============================================
   */

  async analyzeEmotionDistribution(entries) {
    if (!entries || entries.length === 0) {
      return { success: true, distribution: [], insights: {} };
    }

    // Try AI analysis first
    if (this.isAIAvailable) {
      try {
        return await this.analyzeEmotionDistributionWithAI(entries);
      } catch (error) {
        console.warn('⚠️ AI emotion distribution failed:', error.message);
      }
    }

    // Fallback to simple counting
    return this.analyzeEmotionDistributionSimple(entries);
  }

  async analyzeEmotionDistributionWithAI(entries) {
    const entryTexts = entries.slice(0, 20).map(entry => ({
      id: entry.id,
      text: `${entry.title || ''} ${entry.content || ''}`.trim(),
      date: entry.createdAt,
      mood: entry.mood
    })).filter(e => e.text.length > 0);

    const prompt = `Analyze the emotional distribution across these ${entries.length} journal entries.

Sample entries: ${JSON.stringify(entryTexts)}

Respond with ONLY valid JSON (no markdown):
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
  "dominant_emotions": ["happy", "grateful"],
  "emotional_complexity": "high|moderate|low",
  "emotional_stability": "stable|fluctuating|concerning",
  "insights": [
    "Consistent positive emotional patterns",
    "Strong presence of gratitude"
  ]
}

Analyze for emotional themes, intensity, patterns, and mental health indicators.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    try {
      const cleanedText = response.text().replace(/```json\n?|\n?```/g, '').trim();
      const analysis = JSON.parse(cleanedText);
      
      return {
        success: true,
        distribution: analysis.emotion_distribution,
        insights: analysis,
        source: 'ai'
      };
    } catch (parseError) {
      console.error('❌ AI emotion distribution parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  }

  analyzeEmotionDistributionSimple(entries) {
    const emotionCounts = {};
    const total = entries.length;

    entries.forEach(entry => {
      const mood = entry.mood || 'neutral';
      emotionCounts[mood] = (emotionCounts[mood] || 0) + 1;
    });

    const distribution = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: Math.round((count / total) * 100),
        count,
        emoji: this.getEmotionEmoji(emotion),
        intensity: 'moderate',
        trend: 'stable'
      }))
      .sort((a, b) => b.value - a.value);

    return {
      success: true,
      distribution,
      insights: {
        dominant_emotions: distribution.slice(0, 3).map(d => d.name.toLowerCase()),
        emotional_complexity: 'moderate',
        emotional_stability: 'stable'
      },
      source: 'simple'
    };
  }

  /**
   * ============================================
   * WORD CLOUD GENERATION
   * ============================================
   */

  async generateWordCloud(entries) {
    if (!entries || entries.length === 0) {
      return { success: true, words: [], insights: {} };
    }

    // Try AI analysis
    if (this.isAIAvailable) {
      try {
        return await this.generateWordCloudWithAI(entries);
      } catch (error) {
        console.warn('⚠️ AI word cloud failed:', error.message);
      }
    }

    // Fallback to simple word frequency
    return this.generateWordCloudSimple(entries);
  }

  async generateWordCloudWithAI(entries) {
    const allText = entries
      .map(entry => `${entry.title || ''} ${entry.content || ''}`.trim())
      .filter(text => text.length > 0)
      .join(' ')
      .substring(0, 3000);

    const prompt = `Analyze this journal text and create an intelligent word cloud with sentiment analysis:

Text: "${allText}"

Extract meaningful words and analyze their emotional significance.

Respond with JSON (no markdown):
{
  "words": [
    {
      "text": "grateful",
      "frequency": 8,
      "sentiment": "positive",
      "emotional_weight": 0.9,
      "color": "#10B981",
      "size": 24,
      "category": "emotion"
    }
  ],
  "themes": ["gratitude", "growth"],
  "emotional_tone": "predominantly positive",
  "insights": ["Strong self-awareness"]
}

Focus on emotionally significant words, psychological indicators, and personal growth themes.
Exclude common stop words.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    
    try {
      const cleanedText = response.text().replace(/```json\n?|\n?```/g, '').trim();
      const wordCloudData = JSON.parse(cleanedText);
      
      return {
        success: true,
        words: wordCloudData.words,
        insights: wordCloudData,
        source: 'ai'
      };
    } catch (parseError) {
      console.error('❌ AI word cloud parsing failed:', parseError);
      throw new Error('Failed to parse AI response');
    }
  }

  generateWordCloudSimple(entries) {
    const wordFrequency = {};
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her',
      'its', 'our', 'their', 'this', 'that', 'these', 'those'
    ]);

    // Extract words
    entries.forEach(entry => {
      const text = `${entry.title || ''} ${entry.content || ''}`.toLowerCase();
      const words = text.match(/\b[a-z]{3,}\b/g) || [];
      
      words.forEach(word => {
        if (!stopWords.has(word)) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });

    // Convert to array and sort
    const sortedWords = Object.entries(wordFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([text, frequency]) => {
        const sentiment = this.getWordSentiment(text);
        return {
          text,
          frequency,
          sentiment,
          color: sentiment === 'positive' ? '#10B981' : 
                 sentiment === 'negative' ? '#EF4444' : '#6B7280',
          size: 14 + Math.min(frequency * 2, 20)
        };
      });

    return {
      success: true,
      words: sortedWords,
      insights: { themes: [], emotional_tone: 'mixed' },
      source: 'simple'
    };
  }

  getWordSentiment(word) {
    const positiveWords = ['happy', 'joy', 'love', 'excited', 'great', 'amazing', 'wonderful', 'grateful', 'success', 'achieved'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'tired', 'upset', 'failed', 'difficult'];
    
    if (positiveWords.includes(word)) return 'positive';
    if (negativeWords.includes(word)) return 'negative';
    return 'neutral';
  }

  /**
   * ============================================
   * SENTIMENT ANALYSIS OVER TIME
   * ============================================
   */

  generateSentimentOverTime(entries) {
    if (!entries || entries.length === 0) {
      return [];
    }

    const sentimentByDate = {};

    // Only track dates that have actual entries
    entries.forEach(entry => {
      const date = entry.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] ||
        new Date().toISOString().split('T')[0];

      if (!sentimentByDate[date]) {
        sentimentByDate[date] = { positive: 0, neutral: 0, negative: 0, total: 0 };
      }

      const mood = entry.mood || 'neutral';
      const positiveMoods = ['happy', 'excited', 'grateful', 'calm', 'confident', 'hopeful', 'optimistic', 'peaceful', 'content'];
      const negativeMoods = ['sad', 'angry', 'anxious', 'frustrated', 'lonely', 'overwhelmed', 'stressed', 'disappointed'];

      if (positiveMoods.includes(mood)) {
        sentimentByDate[date].positive++;
      } else if (negativeMoods.includes(mood)) {
        sentimentByDate[date].negative++;
      } else {
        sentimentByDate[date].neutral++;
      }
      sentimentByDate[date].total++;
    });

    // Convert to array with sentiment scores
    const sentimentData = Object.entries(sentimentByDate)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, data]) => {
        // Calculate sentiment score (-1 to 1)
        const score = (data.positive - data.negative) / data.total;
        
        return {
          date,
          score: parseFloat(score.toFixed(2)),
          positive: Math.round((data.positive / data.total) * 100),
          neutral: Math.round((data.neutral / data.total) * 100),
          negative: Math.round((data.negative / data.total) * 100)
        };
      });

    return sentimentData;
  }

  /**
   * ============================================
   * EMOTIONS OVER TIME
   * ============================================
   */

  generateEmotionsOverTime(entries) {
    if (!entries || entries.length === 0) {
      return [];
    }

    const emotionsByDate = {};
    const allEmotions = new Set();

    // Collect all unique moods and dates with entries
    entries.forEach(entry => {
      const date = entry.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] ||
        new Date().toISOString().split('T')[0];
      const mood = entry.mood || 'neutral';
      
      allEmotions.add(mood);
      
      if (!emotionsByDate[date]) {
        emotionsByDate[date] = {};
      }
      
      emotionsByDate[date][mood] = (emotionsByDate[date][mood] || 0) + 1;
    });

    console.log('📊 Emotions Over Time - Unique Dates:', Object.keys(emotionsByDate).length);
    console.log('📊 Dates:', Object.keys(emotionsByDate));
    console.log('📊 Total Entries:', entries.length);

    // Convert to array format with raw counts (not percentages)
    return Object.entries(emotionsByDate)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, emotions]) => {
        const result = { date };
        
        // Initialize all emotions to 0 for consistent charting
        allEmotions.forEach(emotion => {
          result[emotion] = emotions[emotion] || 0;
        });
        
        return result;
      });
  }

  /**
   * ============================================
   * WRITING PATTERNS
   * ============================================
   */

  analyzeWritingPatterns(entries) {
    if (!entries || entries.length === 0) {
      return {
        writingTimes: [],
        entryLengths: [],
        weeklyPattern: [],
        stats: {
          total_entries: 0,
          total_words: 0,
          avg_words_per_entry: 0,
          most_active_day: 'N/A',
          most_active_hour: '0'
        }
      };
    }

    const patterns = {
      totalEntries: entries.length,
      totalWords: 0,
      averageWordsPerEntry: 0,
      longestEntry: 0,
      shortestEntry: Infinity,
      entriesByDayOfWeek: {},
      entriesByTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      entryLengths: { '0-100': 0, '100-300': 0, '300-500': 0, '500+': 0 },
      entriesByHour: {} // Track by hour for most active hour
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    entries.forEach(entry => {
      const text = `${entry.title || ''} ${entry.content || ''}`;
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      patterns.totalWords += wordCount;

      if (wordCount > patterns.longestEntry) patterns.longestEntry = wordCount;
      if (wordCount < patterns.shortestEntry) patterns.shortestEntry = wordCount;

      // Categorize entry length
      if (wordCount <= 100) patterns.entryLengths['0-100']++;
      else if (wordCount <= 300) patterns.entryLengths['100-300']++;
      else if (wordCount <= 500) patterns.entryLengths['300-500']++;
      else patterns.entryLengths['500+']++;

      const date = entry.createdAt?.toDate?.() || new Date();
      const dayOfWeek = dayNames[date.getDay()];
      patterns.entriesByDayOfWeek[dayOfWeek] = (patterns.entriesByDayOfWeek[dayOfWeek] || 0) + 1;

      const hour = date.getHours();
      
      // Track entries by hour
      patterns.entriesByHour[hour] = (patterns.entriesByHour[hour] || 0) + 1;
      
      if (hour >= 5 && hour < 12) patterns.entriesByTimeOfDay.morning++;
      else if (hour >= 12 && hour < 17) patterns.entriesByTimeOfDay.afternoon++;
      else if (hour >= 17 && hour < 21) patterns.entriesByTimeOfDay.evening++;
      else patterns.entriesByTimeOfDay.night++;
    });

    patterns.averageWordsPerEntry = entries.length > 0 
      ? Math.round(patterns.totalWords / entries.length) 
      : 0;

    if (patterns.shortestEntry === Infinity) patterns.shortestEntry = 0;

    const mostProductiveDay = Object.entries(patterns.entriesByDayOfWeek)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Find most active hour
    const mostActiveHourEntry = Object.entries(patterns.entriesByHour)
      .sort(([, a], [, b]) => b - a)[0];
    
    const mostActiveHour = mostActiveHourEntry 
      ? `${mostActiveHourEntry[0]}:00` 
      : 'N/A';

    // Transform to component-expected format
    const total = entries.length;
    
    return {
      writingTimes: [
        { 
          time: 'Morning', 
          count: patterns.entriesByTimeOfDay.morning,
          percentage: Math.round((patterns.entriesByTimeOfDay.morning / total) * 100)
        },
        { 
          time: 'Afternoon', 
          count: patterns.entriesByTimeOfDay.afternoon,
          percentage: Math.round((patterns.entriesByTimeOfDay.afternoon / total) * 100)
        },
        { 
          time: 'Evening', 
          count: patterns.entriesByTimeOfDay.evening,
          percentage: Math.round((patterns.entriesByTimeOfDay.evening / total) * 100)
        },
        { 
          time: 'Night', 
          count: patterns.entriesByTimeOfDay.night,
          percentage: Math.round((patterns.entriesByTimeOfDay.night / total) * 100)
        }
      ],
      entryLengths: [
        { 
          range: '0-100 words', 
          count: patterns.entryLengths['0-100'],
          percentage: Math.round((patterns.entryLengths['0-100'] / total) * 100)
        },
        { 
          range: '100-300 words', 
          count: patterns.entryLengths['100-300'],
          percentage: Math.round((patterns.entryLengths['100-300'] / total) * 100)
        },
        { 
          range: '300-500 words', 
          count: patterns.entryLengths['300-500'],
          percentage: Math.round((patterns.entryLengths['300-500'] / total) * 100)
        },
        { 
          range: '500+ words', 
          count: patterns.entryLengths['500+'],
          percentage: Math.round((patterns.entryLengths['500+'] / total) * 100)
        }
      ],
      weeklyPattern: dayNames.map(day => ({
        day: day.substring(0, 3),
        count: patterns.entriesByDayOfWeek[day] || 0
      })),
      stats: {
        total_entries: patterns.totalEntries,
        total_words: patterns.totalWords,
        avg_words_per_entry: patterns.averageWordsPerEntry,
        most_active_day: mostProductiveDay,
        most_active_hour: mostActiveHour,
        longest_entry: patterns.longestEntry,
        shortest_entry: patterns.shortestEntry
      }
    };
  }

  /**
   * ============================================
   * MOOD CORRELATIONS
   * ============================================
   */

  generateMoodCorrelations(entries) {
    const correlations = {
      moodTagCorrelations: {},
      moodLengthCorrelations: [],
      timeOfDayMoods: {
        morning: {},
        afternoon: {},
        evening: {},
        night: {}
      },
      transitions: {},
      mostCommonTransition: null
    };

    // Sort entries by date for transitions
    const sortedEntries = [...entries].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA - dateB;
    });

    // Mood transitions
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const currentMood = sortedEntries[i].mood || 'neutral';
      const nextMood = sortedEntries[i + 1].mood || 'neutral';
      const key = `${currentMood}-${nextMood}`;
      
      correlations.transitions[key] = (correlations.transitions[key] || 0) + 1;
    }

    correlations.mostCommonTransition = Object.entries(correlations.transitions)
      .sort(([, a], [, b]) => b - a)[0] || null;

    // Mood-tag correlations
    entries.forEach(entry => {
      if (entry.mood) {
        if (!correlations.moodTagCorrelations[entry.mood]) {
          correlations.moodTagCorrelations[entry.mood] = {};
        }
        
        if (entry.tags && Array.isArray(entry.tags)) {
          entry.tags.forEach(tag => {
            correlations.moodTagCorrelations[entry.mood][tag] = 
              (correlations.moodTagCorrelations[entry.mood][tag] || 0) + 1;
          });
        }
      }
    });

    // Mood-length correlations
    const moodLengthData = {};
    entries.forEach(entry => {
      if (entry.mood) {
        const text = `${entry.title || ''} ${entry.content || ''}`;
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        
        if (!moodLengthData[entry.mood]) {
          moodLengthData[entry.mood] = { total: 0, count: 0 };
        }
        moodLengthData[entry.mood].total += wordCount;
        moodLengthData[entry.mood].count += 1;
      }
    });

    correlations.moodLengthCorrelations = Object.entries(moodLengthData).map(([mood, data]) => ({
      mood,
      avgLength: Math.round(data.total / data.count),
      entries: data.count
    }));

    // Time of day moods
    entries.forEach(entry => {
      if (entry.mood) {
        const date = entry.createdAt?.toDate?.() || new Date();
        const hour = date.getHours();
        
        let timeOfDay;
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';

        correlations.timeOfDayMoods[timeOfDay][entry.mood] = 
          (correlations.timeOfDayMoods[timeOfDay][entry.mood] || 0) + 1;
      }
    });

    return correlations;
  }

  /**
   * ============================================
   * COMPREHENSIVE INSIGHTS
   * ============================================
   */

  async generateComprehensiveInsights(userId, entries) {
    if (!entries || entries.length === 0) {
      return {
        success: true,
        insights: this.getEmptyInsights()
      };
    }

    try {
      // Generate all insights in parallel
      const [
        emotionDistribution,
        wordCloud,
        sentimentAnalysis,
        emotionsOverTime,
        writingPatterns,
        moodCorrelations
      ] = await Promise.all([
        this.analyzeEmotionDistribution(entries),
        this.generateWordCloud(entries),
        Promise.resolve(this.generateSentimentOverTime(entries)),
        Promise.resolve(this.generateEmotionsOverTime(entries)),
        Promise.resolve(this.analyzeWritingPatterns(entries)),
        Promise.resolve(this.generateMoodCorrelations(entries))
      ]);

      const insights = {
        emotionDistribution: emotionDistribution.distribution,
        sentimentAnalysis,
        emotionsOverTime,
        wordCloud: wordCloud.words,
        writingPatterns,
        moodCorrelations
      };

      // Cache the results
      this.cacheInsights(userId, insights);

      return { success: true, insights };
    } catch (error) {
      console.error('❌ Comprehensive insights generation failed:', error);
      return {
        success: false,
        error: error.message,
        insights: this.getEmptyInsights()
      };
    }
  }

  getEmptyInsights() {
    return {
      emotionDistribution: [],
      sentimentAnalysis: [],
      emotionsOverTime: [],
      wordCloud: [],
      writingPatterns: {
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0
      },
      moodCorrelations: {
        moodTagCorrelations: {},
        moodLengthCorrelations: [],
        timeOfDayMoods: {
          morning: {},
          afternoon: {},
          evening: {},
          night: {}
        },
        transitions: {},
        mostCommonTransition: null
      }
    };
  }

  /**
   * ============================================
   * CACHING
   * ============================================
   */

  getCachedInsights(userId) {
    try {
      const cached = localStorage.getItem(`analytics_${userId}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const cacheAge = Date.now() - timestamp;

      if (cacheAge < this.cacheTimeout) {
        console.log('📦 Using cached analytics');
        return data;
      }

      return null;
    } catch (error) {
      console.error('❌ Cache retrieval failed:', error);
      return null;
    }
  }

  cacheInsights(userId, insights) {
    try {
      localStorage.setItem(`analytics_${userId}`, JSON.stringify({
        data: insights,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('❌ Cache storage failed:', error);
    }
  }

  clearCache(userId) {
    try {
      localStorage.removeItem(`analytics_${userId}`);
    } catch (error) {
      console.error('❌ Cache clearing failed:', error);
    }
  }

  /**
   * ============================================
   * UTILITIES
   * ============================================
   */

  /**
   * Get AI-powered journaling suggestions and prompts
   */
  async getJournalingSuggestion(title, content) {
    if (!this.isAIAvailable) {
      return this.getFallbackSuggestion();
    }

    try {
      const prompt = `Based on this journal entry:
Title: "${title}"
Content: "${content}"

Provide a thoughtful suggestion, reflection question, or writing prompt to help the user explore their thoughts deeper. Keep it encouraging and insightful. Limit to 2-3 sentences.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ AI suggestion failed:', error);
      return this.getFallbackSuggestion();
    }
  }

  getFallbackSuggestion() {
    const suggestions = [
      "Consider reflecting on what you're grateful for today. Gratitude can shift perspectives.",
      "What emotions are you feeling right now? Try to name them and explore why.",
      "Think about a challenge you're facing. What would you tell a friend in the same situation?",
      "What's one small step you could take today toward a goal that matters to you?",
      "Reflect on a moment today that brought you joy, however small it might have been."
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

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

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
