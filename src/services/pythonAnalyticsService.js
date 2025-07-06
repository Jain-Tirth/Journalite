/**
 * Python Analytics Service
 * Connects React frontend to Python analytics backend
 */

const PYTHON_API_BASE_URL = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8080';

class PythonAnalyticsService {
  constructor() {
    this.baseURL = PYTHON_API_BASE_URL;
  }

  /**
   * Make API request to Python backend
   */
  async makeRequest(endpoint, data = null, method = 'POST') {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error(`Python API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Check if Python backend is available
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Python backend health check failed:', error);
      return false;
    }
  }

  /**
   * Analyze mood from text using AI
   */
  async analyzeMood(text) {
    try {
      console.log('🤖 Analyzing mood with Python AI...');
      
      const result = await this.makeRequest('/analyze-mood', { text });
      
      console.log('✅ Mood analysis complete:', result);
      return {
        success: true,
        mood: result.mood,
        confidence: result.confidence,
        emotions: result.emotions,
        sentimentScore: result.sentiment_score,
        keywords: result.keywords
      };
    } catch (error) {
      console.error('❌ Mood analysis failed:', error);
      return {
        success: false,
        error: error.message,
        mood: 'neutral',
        confidence: 0.5
      };
    }
  }

  /**
   * Generate comprehensive insights
   */
  async generateInsights(userId, entries) {
    try {
      console.log('📊 Generating comprehensive insights with Python...');
      
      const result = await this.makeRequest('/generate-insights', {
        user_id: userId,
        entries: this.formatEntriesForPython(entries)
      });
      
      console.log('✅ Insights generation complete');
      return {
        success: true,
        insights: result.insights
      };
    } catch (error) {
      console.error('❌ Insights generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get emotion distribution analysis
   */
  async getEmotionDistribution(entries) {
    try {
      const result = await this.makeRequest('/emotion-distribution', {
        entries: this.formatEntriesForPython(entries)
      });
      
      return {
        success: true,
        distribution: result.distribution
      };
    } catch (error) {
      console.error('❌ Emotion distribution analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get sentiment analysis over time
   */
  async getSentimentAnalysis(entries) {
    try {
      const result = await this.makeRequest('/sentiment-analysis', {
        entries: this.formatEntriesForPython(entries)
      });
      
      return {
        success: true,
        sentimentData: result.sentiment_data
      };
    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate word cloud data
   */
  async getWordCloudData(entries) {
    try {
      const result = await this.makeRequest('/word-cloud', {
        entries: this.formatEntriesForPython(entries)
      });
      
      return {
        success: true,
        wordData: result.word_data
      };
    } catch (error) {
      console.error('❌ Word cloud generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze writing patterns
   */
  async getWritingPatterns(entries) {
    try {
      const result = await this.makeRequest('/writing-patterns', {
        entries: this.formatEntriesForPython(entries)
      });
      
      return {
        success: true,
        patterns: result.patterns
      };
    } catch (error) {
      console.error('❌ Writing patterns analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze mood correlations
   */
  async getMoodCorrelations(entries) {
    try {
      const result = await this.makeRequest('/mood-correlations', {
        entries: this.formatEntriesForPython(entries)
      });
      
      return {
        success: true,
        correlations: result.correlations
      };
    } catch (error) {
      console.error('❌ Mood correlations analysis failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Auto-detect moods for existing entries
   */
  async autoDetectMoods(userId) {
    try {
      console.log('🤖 Auto-detecting moods for existing entries...');
      
      const result = await this.makeRequest('/auto-detect-mood', {
        user_id: userId
      });
      
      console.log('✅ Auto mood detection complete:', result);
      return {
        success: true,
        updatedEntries: result.updated_entries,
        message: result.message
      };
    } catch (error) {
      console.error('❌ Auto mood detection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format entries for Python backend
   */
  formatEntriesForPython(entries) {
    const formattedEntries = entries.map(entry => {
      const formatted = {
        id: entry.id,
        content: entry.content || '',
        title: entry.title || '',
        mood: entry.mood || 'neutral',
        tags: entry.tags || [],
        created_at: entry.createdAt?.toDate?.() || entry.createdAt || new Date(),
        user_id: entry.userId
      };
      
      // Debug logging to check data types
      if (typeof formatted.content !== 'string') {
        console.warn('⚠️ Non-string content detected:', {
          id: formatted.id,
          contentType: typeof formatted.content,
          contentValue: formatted.content
        });
        formatted.content = String(formatted.content || '');
      }
      
      return formatted;
    });
    
    console.log('📤 Sending to Python backend:', {
      count: formattedEntries.length,
      sample: formattedEntries[0] ? {
        id: formattedEntries[0].id,
        contentType: typeof formattedEntries[0].content,
        contentLength: formattedEntries[0].content?.length || 0,
        hasContent: Boolean(formattedEntries[0].content)
      } : 'No entries'
    });
    
    return formattedEntries;
  }

  /**
   * Batch process entries for mood detection
   */
  async batchAnalyzeMoods(entries) {
    try {
      console.log('🤖 Batch analyzing moods for', entries.length, 'entries...');
      
      const results = [];
      const batchSize = 10; // Process in batches to avoid overwhelming the API
      
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        const batchPromises = batch.map(entry => 
          this.analyzeMood(entry.content || entry.title || '')
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches
        if (i + batchSize < entries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('✅ Batch mood analysis complete');
      return results;
    } catch (error) {
      console.error('❌ Batch mood analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get analytics with caching
   */
  async getCachedAnalytics(userId, entries, forceRefresh = false) {
    try {
      // Check cache first (if not forcing refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem(`analytics_${userId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          
          // Use cache if less than 30 minutes old
          if (cacheAge < 30 * 60 * 1000) {
            console.log('📦 Using cached analytics data');
            return { success: true, insights: data, fromCache: true };
          }
        }
      }
      
      // Generate fresh analytics
      const result = await this.generateInsights(userId, entries);
      
      if (result.success) {
        // Cache the results
        localStorage.setItem(`analytics_${userId}`, JSON.stringify({
          data: result.insights,
          timestamp: Date.now()
        }));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cached analytics failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const pythonAnalyticsService = new PythonAnalyticsService();
