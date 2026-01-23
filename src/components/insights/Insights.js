import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { journalService } from '../../services/journalService';
import { analyticsService } from '../../services/analyticsService';
import { JournalButton, JournalAlert } from '../ui/JournalComponents'; // eslint-disable-line no-unused-vars
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

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchEntriesAndAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchEntriesAndAnalyze = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Clear cached analytics for fresh data
      if (currentUser?.uid) {
        analyticsService.clearCache(currentUser.uid);
      }

      // Fetch all journal entries
      const response = await journalService.getUserEntries(currentUser.uid);
      if (response.success && response.data) {
        setEntries(response.data);

        if (response.data.length > 0) {
          await performAnalysis(response.data);
        } else {
          setError('No journal entries found. Start writing to see insights!');
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

  const performAnalysis = async (entriesData) => {
    try {
      setAnalyzing(true);

      // Decrypt entries for analysis
      const decryptedEntries = entriesData.map((entry) => {
        try {
          const receivedEntry = fieldEncryptionService.decryptJournalEntry(entry, currentUser.uid);
          return {
            id: entry.id,
            title: receivedEntry.title || '',
            content: receivedEntry.content || '',
            mood: entry.mood,
            createdAt: entry.createdAt,
            tags: entry.tags || []
          };
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

      // Use unified analytics service for comprehensive insights
      const result = await analyticsService.generateComprehensiveInsights(
        currentUser.uid,
        decryptedEntries
      );

      if (result.success) {
        setInsights(result.insights);
        setLastAnalyzed(new Date());
      } else {
        setError('Analysis failed. Some insights may not be available.');
      }
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      setError('AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
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
