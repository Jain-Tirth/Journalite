import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { journalService } from '../../services/journalService';
import { pythonAnalyticsService } from '../../services/pythonAnalyticsService';
import { aiMoodAnalysisService } from '../../services/aiMoodAnalysisService';
import{aiService } from '../../services/aiService';
import { JournalButton, JournalAlert } from '../ui/JournalComponents';
import EmotionDistribution from './EmotionDistribution';
import SentimentAnalysis from './SentimentAnalysis';
import EmotionsOverTime from './EmotionsOverTime';
import WordCloud from './WordCloud';
import WritingPatterns from './WritingPatterns';
import MoodCorrelations from './MoodCorrelations';
import { fieldEncryptionService } from '../../services/fieldEncryption';

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
      const analysisData = entriesData.map((entry, index) => {
        try {
          const receivedEntry = fieldEncryptionService.decryptJournalEntry(entry, currentUser.uid);

          const decryptedEntry = {
            id: entry.id,
            title: receivedEntry.title || '',
            content: receivedEntry.content || '',
            mood: entry.mood,
            createdAt: entry.createdAt,
            tags: entry.tags || []
          };
          return decryptedEntry;
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

      // Generate AI-powered analytics with graceful fallbacks
      const [
        emotionDistributionResult,
        wordCloudResult,
        emotionsOverTime,
        moodCorrelations,
        sentimentAnalysis,
        writingPatterns
      ] = await Promise.all([
        aiMoodAnalysisService.analyzeEmotionDistribution(analysisData)
          .catch(err => {
            console.warn('⚠️ AI emotion distribution failed, using fallback:', err.message);
            return { success: false };
          }),
        aiMoodAnalysisService.generateIntelligentWordCloud(analysisData)
          .catch(err => {
            console.warn('⚠️ AI word cloud failed, using fallback:', err.message);
            return { success: false };
          }),
        generateEmotionsOverTime(analysisData),
        generateMoodCorrelations(analysisData),
        generateAISentimentAnalysis(analysisData),
        aiService.analyzeWritingPatterns(analysisData)
      ]);

      const emotionDistribution = emotionDistributionResult?.success ?
        emotionDistributionResult.distribution :
        generateSimpleEmotionDistribution(analysisData);

      const wordCloud = wordCloudResult?.success ?
        wordCloudResult.words :
        aiService.generateWordCloud(analysisData, emotionDistribution);

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
      emoji: aiService.getEmotionEmoji(emotion)
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

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="journal-loading text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h4 className="mt-4" style={{ color: 'var(--text-primary)' }}>Loading Your Journal Insights</h4>
        </div>
      </Container>
    );
  }

  if (error && entries.length === 0) {
    return (
      <Container className="mt-4">
        <JournalAlert type="warning" className="text-center">
          <h4>No Data Available</h4>
          <p>{error}</p>
          <JournalButton
            as="a"
            href="/journal/new"
            icon={<i className="bi bi-plus-circle"></i>}
          >
            Write Your First Entry
          </JournalButton>
        </JournalAlert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 journal-fade-in">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 style={{
                color: 'var(--text-primary)',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <i className="bi bi-graph-up" style={{ color: 'var(--primary)' }}></i>
                Journal Insights
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
                AI-powered analysis of your {entries.length} journal entries
                {lastAnalyzed && (
                  <span className="ms-2">
                    • Last analyzed: {lastAnalyzed.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
            <div>
              {analyzing && (
                <div className="d-flex align-items-center" style={{ color: 'var(--primary)' }}>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Analyzing...
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <JournalAlert type="warning" className="mb-4">
          {error}
        </JournalAlert>
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
