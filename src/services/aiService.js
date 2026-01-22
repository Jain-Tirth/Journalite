import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Service for Task Manager
// This service integrates with Google Gemini AI API to provide intelligent features

class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.isApiAvailable = !!this.apiKey;

    if (this.isApiAvailable) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        // Try different model names in order of preference
        this.modelNames = 'gemini-2.5-flash-lite';

        this.model = null;
        this.currentModelName = null;

        // We'll initialize the model on first use to handle errors gracefully
      } catch (error) {
        console.error('❌ Error initializing Gemini AI:', error);
        this.isApiAvailable = false;
      }
    }
  }

  // Initialize model with fallback options
  async initializeModel() {
    if (!this.isApiAvailable || !this.genAI) {
      return false;
    }

    if (this.model && this.currentModelName) {
      return true; // Already initialized
    }

    for (const modelName of [this.modelNames]) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: modelName });

        // Test the model with a simple prompt
        const testResult = await this.model.generateContent('Hello');
        const testResponse = testResult.response;
        const testText = testResponse.text();

        if (testText && testText.trim().length > 0) {
          this.currentModelName = modelName;
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    console.error('❌ All model initialization attempts failed');
    this.isApiAvailable = false;
    return false;
  }

  // Call Google Gemini API using the official SDK
  async callGeminiAPI(prompt, context = '') {
    if (!this.isApiAvailable) {
      return this.getFallbackResponse(prompt);
    }

    // Initialize model if not already done
    if (!this.model) {
      const initialized = await this.initializeModel();
      if (!initialized) {
        return this.getFallbackResponse(prompt);
      }
    }

    try {
      const fullPrompt = context ?
        `${context}\n\n${prompt}\n\nPlease provide a helpful, concise response focused on productivity and task management.` :
        prompt;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini API');
      }

      return text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);

      // Try to reinitialize the model if there's an error
      this.model = null;
      this.currentModelName = null;

      return this.getFallbackResponse(prompt);
    }
  }

  // Fallback responses when API is not available
  getFallbackResponse(prompt) {
    const fallbackResponses = {
      'task suggestions': "I suggest breaking down large tasks into smaller, actionable steps. Consider setting specific deadlines and priorities for better organization.",
      'prioritization': "Focus on tasks with the nearest deadlines first, then consider the impact and effort required for each task.",
      'productivity': "Keep tracking your progress! Consistency is key to building productive habits. Consider time-blocking for better focus.",
      'motivation': "You're doing great! Every step forward is progress. Remember to take breaks and celebrate small wins. 💪",
      'breakdown': "Try breaking this task into 3-5 smaller steps: 1) Planning phase, 2) Research/preparation, 3) Execution, 4) Review, 5) Completion.",
      'default': "I'm here to help with your productivity! Try asking about task prioritization, time management, or breaking down complex tasks."
    };

    const lowerPrompt = prompt.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerPrompt.includes(key)) {
        return response;
      }
    }

    return fallbackResponses.default;
  }
  
  
  // Advanced AI Analysis Functions for Insights
  async analyzeEmotionDistribution(entries) {
    try {
      // Count emotions from entries
      const emotionCounts = {};
      let totalEntries = 0;

      entries.forEach(entry => {
        if (entry.mood) {
          emotionCounts[entry.mood] = (emotionCounts[entry.mood] || 0) + 1;
          totalEntries++;
        }
      });

      // Convert to percentage and format for chart
      const emotionData = Object.entries(emotionCounts).map(([emotion, count]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        value: Math.round((count / totalEntries) * 100),
        emoji: this.getEmotionEmoji(emotion)
      })).sort((a, b) => b.value - a.value);
      return emotionData;
    } catch (error) {
      console.error('❌ AI: Emotion distribution analysis failed:', error);
      return null;
    }
  }

  async analyzeSentimentOverTime(entries) {
    try {
      // Use Gemini AI for sentiment analysis
      const prompt = `Analyze the sentiment of these journal entries and provide sentiment scores (-1 to 1) for each entry:

${entries.slice(0, 10).map((entry, index) => `Entry ${index + 1}: "${entry.content.substring(0, 200)}..."`).join('\n')}

Return a JSON array with sentiment scores for each entry (from -1 very negative to 1 very positive).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let sentimentScores;

      try {
        sentimentScores = JSON.parse(response.text());
      } catch {
        // Fallback: simple sentiment analysis based on mood
        sentimentScores = entries.map(entry => {
          const mood = entry.mood?.toLowerCase();
          if (['happy', 'excited', 'grateful', 'calm', 'content'].includes(mood)) return 0.7;
          if (['sad', 'angry', 'frustrated', 'anxious'].includes(mood)) return -0.5;
          return 0;
        });
      }

      // Create distribution data
      const distribution = [
        { sentiment: 'Very Positive', value: 0, color: '#10B981' },
        { sentiment: 'Positive', value: 0, color: '#34D399' },
        { sentiment: 'Neutral', value: 0, color: '#6B7280' },
        { sentiment: 'Negative', value: 0, color: '#F87171' },
        { sentiment: 'Very Negative', value: 0, color: '#EF4444' }
      ];

      sentimentScores.forEach(score => {
        if (score >= 0.6) distribution[0].value++;
        else if (score >= 0.2) distribution[1].value++;
        else if (score >= -0.2) distribution[2].value++;
        else if (score >= -0.6) distribution[3].value++;
        else distribution[4].value++;
      });

      // Convert to percentages
      const total = sentimentScores.length;
      distribution.forEach(item => {
        item.value = Math.round((item.value / total) * 100);
      });

      // Create over time data
      const overTime = entries.map((entry, index) => ({
        date: entry.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
        score: sentimentScores[index] || 0
      }));
      return { distribution, overTime };
    } catch (error) {
      console.error('❌ AI: Sentiment analysis failed:', error);
      return null;
    }
  }

  async generateWordCloud(entries) {
    try {
      // Extract and count words
      const wordCounts = {};
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);

      entries.forEach(entry => {
        const words = entry.content.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.has(word));

        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      });

      // Get top words
      const topWords = Object.entries(wordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 30);

      // Simple sentiment classification for words
      const wordCloudData = topWords.map(([word, frequency]) => {
        let sentiment = 'neutral';
        let color = '#6B7280';

        if (['happy', 'love', 'great', 'amazing', 'wonderful', 'excited', 'grateful', 'peaceful', 'joy', 'beautiful', 'success', 'achievement'].includes(word)) {
          sentiment = 'positive';
          color = '#10B981';
        } else if (['sad', 'angry', 'frustrated', 'anxious', 'stressed', 'worried', 'difficult', 'problem', 'issue', 'challenge'].includes(word)) {
          sentiment = 'negative';
          color = '#EF4444';
        }

        return {
          text: word,
          size: Math.min(48, 12 + (frequency * 2)),
          frequency,
          sentiment,
          color
        };
      });
      return wordCloudData;
    } catch (error) {
      console.error('❌ AI: Word cloud generation failed:', error);
      return null;
    }
  }

  async analyzeWritingPatterns(entries) {
    try {
      // Analyze writing times
      const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
      const dayDistribution = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const lengthDistribution = { '0-100': 0, '100-300': 0, '300-500': 0, '500+': 0 };

      let totalWords = 0;
      let longestEntry = 0;
      let shortestEntry = Infinity;

      entries.forEach(entry => {
        // Time analysis
        const date = entry.createdAt?.toDate?.() || new Date();
        const hour = date.getHours();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        if (hour >= 6 && hour < 12) timeDistribution.morning++;
        else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
        else if (hour >= 18 && hour < 22) timeDistribution.evening++;
        else timeDistribution.night++;

        dayDistribution[dayName]++;

        // Length analysis
        const wordCount = entry.content.split(/\s+/).length;
        totalWords += wordCount;
        longestEntry = Math.max(longestEntry, wordCount);
        shortestEntry = Math.min(shortestEntry, wordCount);

        if (wordCount <= 100) lengthDistribution['0-100']++;
        else if (wordCount <= 300) lengthDistribution['100-300']++;
        else if (wordCount <= 500) lengthDistribution['300-500']++;
        else lengthDistribution['500+']++;
      });

      const totalEntries = entries.length;
      const averageLength = Math.round(totalWords / totalEntries);

      // Convert to chart format
      const writingTimes = Object.entries(timeDistribution).map(([time, count]) => ({
        time: time.charAt(0).toUpperCase() + time.slice(1),
        count,
        percentage: Math.round((count / totalEntries) * 100)
      }));

      const entryLengths = Object.entries(lengthDistribution).map(([range, count]) => ({
        range: range === '0-100' ? '0-100 words' :
          range === '100-300' ? '100-300 words' :
            range === '300-500' ? '300-500 words' : '500+ words',
        count,
        percentage: Math.round((count / totalEntries) * 100)
      }));

      const weeklyPattern = Object.entries(dayDistribution).map(([day, count]) => ({
        day, count
      }));

      // Calculate writing streak (simplified)
      const writingStreak = Math.min(7, totalEntries); // Simplified calculation

      const stats = {
        averageLength,
        totalWords,
        longestEntry,
        shortestEntry: shortestEntry === Infinity ? 0 : shortestEntry,
        writingStreak,
        favoriteTime: writingTimes.reduce((max, time) => time.count > max.count ? time : max, writingTimes[0]).time,
        favoriteDay: weeklyPattern.reduce((max, day) => day.count > max.count ? day : max, weeklyPattern[0]).day
      };
      return { writingTimes, entryLengths, weeklyPattern, stats };
    } catch (error) {
      console.error('❌ AI: Writing patterns analysis failed:', error);
      return null;
    }
  }

  getEmotionEmoji(emotion) {
    const emojiMap = {
      happy: '😊', sad: '😢', angry: '😠', anxious: '😟', excited: '🤩',
      calm: '😌', neutral: '😐', grateful: '🙏', frustrated: '😤',
      content: '😊', tired: '😴', stressed: '😰', surprised: '😲'
    };
    return emojiMap[emotion.toLowerCase()] || '😐';
  }
}

export const aiService = new AIService();
