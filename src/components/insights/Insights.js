import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { journalService } from '../../services/journalService';
import { pythonAnalyticsService } from '../../services/pythonAnalyticsService';
import { aiMoodAnalysisService } from '../../services/aiMoodAnalysisService';
import EmotionDistribution from './EmotionDistribution';
import SentimentAnalysis from './SentimentAnalysis';
import EmotionsOverTime from './EmotionsOverTime';
import WordCloud from './WordCloud';
import WritingPatterns from './WritingPatterns';
import MoodCorrelations from './MoodCorrelations';
import {fieldEncryptionService} from '../../services/fieldEncryption';

const Insights = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState({
    emotionDistribution: null,
    sentimentAnalysis: null,
    emotionsOverTime: null,
    wordCloud: null,
    writingPatterns: null,
    moodCorrelations: null
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState(null);
  const [pythonBackendAvailable, setPythonBackendAvailable] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      checkPythonBackend();
      fetchEntriesAndAnalyze(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const checkPythonBackend = async () => {
    try {
      const isAvailable = await pythonAnalyticsService.healthCheck();
      setPythonBackendAvailable(isAvailable);
    } catch (error) {
      setPythonBackendAvailable(false);
    }
  };

  const fetchEntriesAndAnalyze = async () => {
    try {
      setLoading(true);
      setError('');
      // Clear any cached analytics to ensure fresh data
      if (currentUser?.uid) {
        localStorage.removeItem(`analytics_${currentUser.uid}`);
      }

      // Fetch all journal entries
      const response = await journalService.getUserEntries(currentUser.uid);
      if (response.success && response.data) {
        setEntries(response.data);

        if (response.data.length > 0) {
          console.log(response.data.length);
          await performAIAnalysis(response.data);
        } else {
          setError('No journal entries found. Start writing to see insights!');
          // Reset insights when no entries
          setInsights({
            emotionDistribution: null,
            sentimentAnalysis: null,
            emotionsOverTime: null,
            wordCloud: null,
            writingPatterns: null,
            moodCorrelations: null
          });
        }
      } else {
        setError('Failed to fetch journal entries.');
      }
    } catch (err) {
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const performAIAnalysis = async (entriesData) => {
    try {
      setAnalyzing(true);
      if (pythonBackendAvailable) {
        // Use Python backend for superior analytics
        const result = await pythonAnalyticsService.getCachedAnalytics(
          currentUser.uid,
          entriesData,
          false // Don't force refresh unless explicitly requested
        );

        if (result.success) {
          setInsights(result.insights);
          setLastAnalyzed(new Date());
          return;
        }
      }
      // Prepare data for analysis
      console.log('🔍 Preparing analysis data...');
      console.log('Raw entries count:', entriesData.length);
      
      const analysisData = entriesData.map((entry, index) => {
        try {
          const decryptedEntry = fieldEncryptionService.decryptJournalEntry(entry, currentUser.uid);
          
          const prepared = {
            id: entry.id,
            title: decryptedEntry.title || '',
            content: decryptedEntry.content || '',
            mood: entry.mood,
            createdAt: entry.createdAt,
            tags: entry.tags || []
          };
          
          // Debug log for first few entries
          if (index < 3) {
            console.log(`Entry ${index + 1}:`, {
              id: prepared.id,
              titleLength: prepared.title?.length || 0,
              contentLength: prepared.content?.length || 0,
              titleType: typeof prepared.title,
              contentType: typeof prepared.content
            });
          }
          
          return prepared;
        } catch (decryptError) {
          console.error(`❌ Failed to decrypt entry ${entry.id}:`, decryptError);
          return {
            id: entry.id,
            title: '[Decryption Failed]',
            content: '[Decryption Failed]',
            mood: entry.mood,
            createdAt: entry.createdAt,
            tags: entry.tags || []
          };
        }
      });
      
      console.log('✅ Analysis data prepared:', analysisData.length, 'entries');
      console.log('📤 Sending to AI services...');

      // Generate AI-powered analytics
      console.log('🤖 Starting AI analysis...');
      const [
        emotionDistributionResult,
        wordCloudResult,
        emotionsOverTime,
        moodCorrelations,
        sentimentAnalysis,
        writingPatterns
      ] = await Promise.all([
        (async () => {
          console.log('📊 Calling analyzeEmotionDistribution...');
          const result = await aiMoodAnalysisService.analyzeEmotionDistribution(analysisData);
          console.log('📊 Emotion distribution result:', result);
          return result;
        })(),
        (async () => {
          console.log('☁️ Calling generateIntelligentWordCloud...');
          const result = await aiMoodAnalysisService.generateIntelligentWordCloud(analysisData);
          console.log('☁️ Word cloud result:', result);
          return result;
        })(),
        generateEmotionsOverTime(analysisData),
        generateMoodCorrelations(analysisData),
        generateAISentimentAnalysis(analysisData),
        generateSimpleWritingPatterns(analysisData)
      ]);

      const emotionDistribution = emotionDistributionResult.success ?
        emotionDistributionResult.distribution :
        generateSimpleEmotionDistribution(analysisData);

      const wordCloud = wordCloudResult.success ?
        wordCloudResult.words :
        generateSimpleWordCloud(analysisData);

      const fallbackInsights = {
        emotionDistribution: emotionDistribution,
        sentimentAnalysis: sentimentAnalysis,
        emotionsOverTime: emotionsOverTime,
        wordCloud: wordCloud,
        writingPatterns: writingPatterns,
        moodCorrelations: moodCorrelations
      };
      
      setInsights(fallbackInsights);
      setLastAnalyzed(new Date());
    } catch (err) {
      setError('AI analysis failed. Some insights may not be available.');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateEmotionsOverTime = (entriesData) => {
    // Group entries by date and calculate emotion trends
    const emotionsByDate = {};
    
    entriesData.forEach(entry => {
      const date = entry.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || 
                   new Date().toISOString().split('T')[0];
      
      if (!emotionsByDate[date]) {
        emotionsByDate[date] = {
          happy: 0,
          sad: 0,
          angry: 0,
          anxious: 0,
          excited: 0,
          calm: 0,
          total: 0
        };
      }
      
      if (entry.mood) {
        emotionsByDate[date][entry.mood] = (emotionsByDate[date][entry.mood] || 0) + 1;
        emotionsByDate[date].total += 1;
      }
    });

    // Convert to chart data
    return Object.entries(emotionsByDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, emotions]) => ({
        date,
        ...emotions
      }));
  };

  const generateMoodCorrelations = (entriesData) => {
    // Analyze correlations between moods, tags, and writing length
    const correlations = {
      moodTagCorrelations: {},
      moodLengthCorrelations: {},
      timeOfDayMoods: {}
    };

    entriesData.forEach(entry => {
      if (entry.mood) {
        // Mood-tag correlations
        if (entry.tags && entry.tags.length > 0) {
          entry.tags.forEach(tag => {
            if (!correlations.moodTagCorrelations[entry.mood]) {
              correlations.moodTagCorrelations[entry.mood] = {};
            }
            correlations.moodTagCorrelations[entry.mood][tag] =
              (correlations.moodTagCorrelations[entry.mood][tag] || 0) + 1;
          });
        }

        // Mood-length correlations
        const wordCount = entry.content.split(' ').length;
        if (!correlations.moodLengthCorrelations[entry.mood]) {
          correlations.moodLengthCorrelations[entry.mood] = [];
        }
        correlations.moodLengthCorrelations[entry.mood].push(wordCount);

        // Time of day moods
        const hour = entry.createdAt?.toDate?.()?.getHours() || new Date().getHours();
        const timeOfDay = hour < 6 ? 'night' :
                         hour < 12 ? 'morning' :
                         hour < 18 ? 'afternoon' : 'evening';

        if (!correlations.timeOfDayMoods[timeOfDay]) {
          correlations.timeOfDayMoods[timeOfDay] = {};
        }
        correlations.timeOfDayMoods[timeOfDay][entry.mood] =
          (correlations.timeOfDayMoods[timeOfDay][entry.mood] || 0) + 1;
      }
    });

    return correlations;
  };

  const generateSimpleEmotionDistribution = (entriesData) => {
    // Count emotions from entries
    const emotionCounts = {};
    let totalEntries = 0;

    entriesData.forEach(entry => {
      if (entry.mood) {
        emotionCounts[entry.mood] = (emotionCounts[entry.mood] || 0) + 1;
        totalEntries++;
      }
    });

    // Convert to percentage distribution
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: Math.round((count / totalEntries) * 100),
      count: count,
      emoji: getEmotionEmoji(emotion)
    }));
  };

  // AI-powered sentiment analysis
  const generateAISentimentAnalysis = async (entriesData) => {
    try {
      // Use AI to analyze sentiment for each entry
      const sentimentPromises = entriesData.slice(0, 10).map(async (entry) => {
        const text = `${entry.title || ''} ${entry.content || ''}`.trim();
        if (!text) return null;

        try {
          const moodResult = await aiMoodAnalysisService.analyzeMood(text);
          return {
            date: entry.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || new Date().toISOString().split('T')[0],
            sentiment: moodResult.sentiment?.polarity || 0,
            mood: entry.mood,
            aiMood: moodResult.mood,
            confidence: moodResult.confidence
          };
        } catch (error) {
          return null;
        }
      });

      const sentimentResults = (await Promise.all(sentimentPromises)).filter(Boolean);

      if (sentimentResults.length === 0) {
        return generateSimpleSentimentAnalysis(entriesData);
      }

      // Group by date and average sentiment
      const sentimentByDate = {};
      sentimentResults.forEach(item => {
        if (!sentimentByDate[item.date]) {
          sentimentByDate[item.date] = { total: 0, count: 0 };
        }
        sentimentByDate[item.date].total += item.sentiment;
        sentimentByDate[item.date].count += 1;
      });

      const overTime = Object.entries(sentimentByDate)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([date, data]) => ({
          date,
          sentiment: data.total / data.count
        }));

      return {
        distribution: [
          { name: 'Positive', value: sentimentResults.filter(s => s.sentiment > 0.1).length },
          { name: 'Neutral', value: sentimentResults.filter(s => s.sentiment >= -0.1 && s.sentiment <= 0.1).length },
          { name: 'Negative', value: sentimentResults.filter(s => s.sentiment < -0.1).length }
        ],
        over_time: overTime,
        ai_powered: true
      };
    } catch (error) {
      return generateSimpleSentimentAnalysis(entriesData);
    }
  };

  const generateSimpleSentimentAnalysis = (entriesData) => {
    // Fallback sentiment analysis based on mood
    const sentimentMap = {
      happy: 1, excited: 0.8, grateful: 0.7, calm: 0.3, neutral: 0,
      anxious: -0.3, sad: -0.7, angry: -0.9, frustrated: -0.6, stressed: -0.5
    };

    const sentimentData = entriesData.map(entry => {
      const date = entry.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] ||
                   new Date().toISOString().split('T')[0];
      const sentiment = sentimentMap[entry.mood] || 0;

      return { date, sentiment, mood: entry.mood };
    });

    // Group by date and average sentiment
    const sentimentByDate = {};
    sentimentData.forEach(item => {
      if (!sentimentByDate[item.date]) {
        sentimentByDate[item.date] = { total: 0, count: 0 };
      }
      sentimentByDate[item.date].total += item.sentiment;
      sentimentByDate[item.date].count += 1;
    });

    const overTime = Object.entries(sentimentByDate)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, data]) => ({
        date,
        sentiment: data.total / data.count
      }));

    return {
      distribution: [
        { name: 'Positive', value: sentimentData.filter(s => s.sentiment > 0).length },
        { name: 'Neutral', value: sentimentData.filter(s => s.sentiment === 0).length },
        { name: 'Negative', value: sentimentData.filter(s => s.sentiment < 0).length }
      ],
      over_time: overTime
    };
  };

  const generateSimpleWordCloud = (entriesData) => {
    // Fallback word cloud generation
    const wordCounts = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'that', 'this', 'just', 'like', 'get', 'got', 'go', 'went', 'going', 'really', 'very', 'much', 'so', 'now', 'today', 'yesterday', 'tomorrow']);

    entriesData.forEach(entry => {
      const text = `${entry.content} ${entry.title}`.toLowerCase();
      const words = text
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word));

      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    // Convert to word cloud format
    const wordCloudData = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .map(([text, frequency]) => {
        // Calculate size based on frequency (12-48px range)
        const maxFreq = Math.max(...Object.values(wordCounts));
        const size = Math.max(12, Math.min(48, (frequency / maxFreq) * 36 + 12));

        return {
          text,
          value: frequency,
          frequency,
          size,
          sentiment: 'neutral',
          color: '#6B7280'
        };
      });

    return wordCloudData;
  };

  const generateSimpleWritingPatterns = (entriesData) => {
    if (!entriesData || entriesData.length === 0) {
      return {
        stats: {
          total_entries: 0,
          total_words: 0,
          avg_words_per_entry: 0,
          most_active_day: 'N/A',
          most_active_hour: 'N/A'
        },
        writingTimes: [],
        entryLengths: [],
        weeklyPattern: [],
        day_of_week: [],
        hour_distribution: []
      };
    }

    // Analyze writing patterns
    const totalEntries = entriesData.length;
    const totalWords = entriesData.reduce((sum, entry) => sum + (entry.content?.split(' ').length || 0), 0);
    const avgWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;

    // Writing frequency by day of week
    const dayOfWeekCounts = {};
    const hourCounts = {};
    const timePeriodCounts = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
    const lengthRanges = { '0-100': 0, '100-300': 0, '300-500': 0, '500+': 0 };

    entriesData.forEach(entry => {
      const date = entry.createdAt?.toDate?.() || new Date();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours();
      const wordCount = entry.content?.split(' ').length || 0;

      // Day of week
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1;

      // Hour
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;

      // Time periods
      if (hour >= 5 && hour < 12) timePeriodCounts.Morning++;
      else if (hour >= 12 && hour < 17) timePeriodCounts.Afternoon++;
      else if (hour >= 17 && hour < 22) timePeriodCounts.Evening++;
      else timePeriodCounts.Night++;

      // Entry lengths
      if (wordCount <= 100) lengthRanges['0-100']++;
      else if (wordCount <= 300) lengthRanges['100-300']++;
      else if (wordCount <= 500) lengthRanges['300-500']++;
      else lengthRanges['500+']++;
    });

    // Convert to chart-friendly format
    const writingTimes = Object.entries(timePeriodCounts).map(([time, count]) => ({
      time,
      count,
      percentage: Math.round((count / totalEntries) * 100)
    }));

    const entryLengths = Object.entries(lengthRanges).map(([range, count]) => ({
      range: range === '0-100' ? '0-100 words' :
             range === '100-300' ? '100-300 words' :
             range === '300-500' ? '300-500 words' : '500+ words',
      count,
      percentage: Math.round((count / totalEntries) * 100)
    }));

    const weeklyPattern = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      .map(day => ({
        day: day.substring(0, 3),
        count: dayOfWeekCounts[day] || 0
      }));

    return {
      stats: {
        total_entries: totalEntries,
        total_words: totalWords,
        avg_words_per_entry: avgWordsPerEntry,
        most_active_day: Object.entries(dayOfWeekCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
        most_active_hour: Object.entries(hourCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      },
      writingTimes,
      entryLengths,
      weeklyPattern,
      day_of_week: Object.entries(dayOfWeekCounts).map(([day, count]) => ({ day, count })),
      hour_distribution: Object.entries(hourCounts).map(([hour, count]) => ({ hour: parseInt(hour), count }))
    };
  };

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      anxious: '😟',
      excited: '🤩',
      calm: '😌',
      neutral: '😐',
      grateful: '🙏'
    };
    return emojiMap[emotion] || '😐';
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center py-5">
          <Spinner animation="border" size="lg" />
          <h4 className="mt-3">Loading Your Journal Insights</h4>
          <p className="text-muted">Analyzing your journal entries with AI...</p>
        </div>
      </Container>
    );
  }

  if (error && entries.length === 0) {
    return (
      <Container className="mt-4">
        <Alert variant="warning" className="text-center">
          <h4>No Data Available</h4>
          <p>{error}</p>
          <Button variant="primary" href="/journal/new">
            Write Your First Entry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <i className="bi bi-graph-up me-2"></i>
                Journal Insights
              </h2>
              <p className="text-muted">
                AI-powered analysis of your {entries.length} journal entries
                {lastAnalyzed && (
                  <span className="ms-2">
                    • Last analyzed: {lastAnalyzed.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <div>
                {analyzing &&
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Analyzing...
                  </>
                }
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="warning" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Insights Grid */}
      <Row className="g-4">
        {/* Emotion Distribution */}
        <Col lg={6}>
          <EmotionDistribution 
            data={insights.emotionDistribution} 
            loading={analyzing}
          />
        </Col>

        {/* Sentiment Analysis */}
        <Col lg={6}>
          <SentimentAnalysis 
            data={insights.sentimentAnalysis} 
            loading={analyzing}
          />
        </Col>

        {/* Emotions Over Time */}
        <Col lg={12}>
          <EmotionsOverTime 
            data={insights.emotionsOverTime} 
            loading={analyzing}
          />
        </Col>

        {/* Writing Patterns */}
        <Col lg={12}>
          <WritingPatterns
            data={insights.writingPatterns}
            loading={analyzing}
          />
        </Col>

        {/* Word Cloud - Full Width */}
        <Col lg={12}>
          <WordCloud
            data={insights.wordCloud}
            loading={analyzing}
          />
        </Col>

        {/* Mood Correlations */}
        <Col lg={12}>
          <MoodCorrelations
            data={insights.moodCorrelations}
            loading={analyzing}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Insights;
