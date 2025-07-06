import React, { useState } from 'react';
import { Card, Spinner, ButtonGroup, Button, Badge } from 'react-bootstrap';

const WordCloud = ({ data, loading }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'positive', 'negative'

  // Sample word cloud data (fallback)
  const sampleWords = [
    { text: 'grateful', size: 48, frequency: 25, sentiment: 'positive', color: '#10B981' },
    { text: 'happy', size: 42, frequency: 22, sentiment: 'positive', color: '#059669' },
    { text: 'work', size: 38, frequency: 18, sentiment: 'neutral', color: '#6B7280' },
    { text: 'family', size: 36, frequency: 16, sentiment: 'positive', color: '#10B981' },
    { text: 'stressed', size: 34, frequency: 14, sentiment: 'negative', color: '#EF4444' },
    { text: 'love', size: 32, frequency: 13, sentiment: 'positive', color: '#059669' },
    { text: 'tired', size: 30, frequency: 12, sentiment: 'negative', color: '#F87171' },
    { text: 'excited', size: 28, frequency: 11, sentiment: 'positive', color: '#10B981' },
    { text: 'anxious', size: 26, frequency: 10, sentiment: 'negative', color: '#EF4444' },
    { text: 'peaceful', size: 24, frequency: 9, sentiment: 'positive', color: '#059669' },
    { text: 'challenging', size: 22, frequency: 8, sentiment: 'neutral', color: '#6B7280' },
    { text: 'hopeful', size: 20, frequency: 7, sentiment: 'positive', color: '#10B981' },
    { text: 'overwhelmed', size: 18, frequency: 6, sentiment: 'negative', color: '#F87171' },
    { text: 'creative', size: 16, frequency: 5, sentiment: 'positive', color: '#059669' },
    { text: 'frustrated', size: 14, frequency: 4, sentiment: 'negative', color: '#EF4444' },
    { text: 'inspired', size: 12, frequency: 3, sentiment: 'positive', color: '#10B981' }
  ];

  // Use real data if available, otherwise use sample data
  const words = (data && data.length > 0) ? data : sampleWords;

  console.log('🎨 WordCloud received data:', data ? `${data.length} words` : 'no data, using sample');

  // Filter words based on sentiment
  const filteredWords = words.filter(word => {
    if (filterType === 'positive') return word.sentiment === 'positive';
    if (filterType === 'negative') return word.sentiment === 'negative';
    return true;
  });

  // Calculate word positions for cloud layout
  const getWordPosition = (index, total) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 50 + (index % 3) * 30;
    const centerX = 50;
    const centerY = 50;
    
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const WordCloudVisualization = ({ words }) => {
    return (
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{ height: '400px', overflow: 'hidden' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 400">
          {words.map((word, index) => {
            const position = getWordPosition(index, words.length);
            const x = (position.x / 100) * 800;
            const y = (position.y / 100) * 400;

            return (
              <text
                key={`${word.text}-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.max(14, word.size || 20)}
                fill={word.color}
                fontWeight="600"
                className="word-cloud-text"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.fontSize = `${Math.max(14, word.size || 20) + 6}px`;
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.fontSize = `${Math.max(14, word.size || 20)}px`;
                  e.target.style.opacity = '1';
                }}
              >
                {word.text}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const WordList = ({ words }) => {
    return (
      <div className="mt-3">
        <h6 className="text-secondary mb-3">Word Frequency</h6>
        <div className="row">
          {words.slice(0, 12).map((word, index) => (
            <div key={word.text} className="col-md-6 col-lg-4 mb-2">
              <div className="d-flex justify-content-between align-items-center">
                <span 
                  className="small fw-medium"
                  style={{ color: word.color }}
                >
                  {word.text}
                </span>
                <Badge 
                  bg={word.sentiment === 'positive' ? 'success' : 
                      word.sentiment === 'negative' ? 'danger' : 'secondary'}
                  className="ms-2"
                >
                  {word.frequency}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getSentimentStats = () => {
    const positive = words.filter(w => w.sentiment === 'positive').length;
    const negative = words.filter(w => w.sentiment === 'negative').length;
    const neutral = words.filter(w => w.sentiment === 'neutral').length;
    
    return { positive, negative, neutral, total: words.length };
  };

  const stats = getSentimentStats();

  return (
    <Card className="h-100 insight-card">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bi bi-cloud text-primary me-2"></i>
          <h5 className="mb-0">Word Cloud</h5>
        </div>
        <div className="d-flex align-items-center">
          {loading && <Spinner animation="border" size="sm" className="me-3" />}
          <ButtonGroup size="sm">
            <Button 
              variant={filterType === 'all' ? 'primary' : 'outline-primary'}
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button 
              variant={filterType === 'positive' ? 'success' : 'outline-success'}
              onClick={() => setFilterType('positive')}
            >
              Positive
            </Button>
            <Button 
              variant={filterType === 'negative' ? 'danger' : 'outline-danger'}
              onClick={() => setFilterType('negative')}
            >
              Negative
            </Button>
          </ButtonGroup>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Analyzing your words...</p>
            </div>
          </div>
        ) : words.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <i className="bi bi-cloud text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">No Words to Display</h5>
              <p className="text-muted">Start writing journal entries to see your word cloud!</p>
            </div>
          </div>
        ) : (
          <>
            {/* Word Cloud Visualization */}
            <WordCloudVisualization words={filteredWords.slice(0, 25)} />

            {/* Word List */}
            <WordList words={filteredWords} />

            {/* Insights Summary */}
            <div className="mt-3 p-3 bg-light rounded">
              <h6 className="text-primary mb-2">
                <i className="bi bi-lightbulb me-1"></i>
                Word Analysis
              </h6>
              <div className="small text-muted">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      • Most used word: <strong style={{ color: words[0]?.color }}>
                        {words[0]?.text}
                      </strong> ({words[0]?.frequency} times)
                    </p>
                    <p className="mb-1">
                      • Vocabulary richness: <strong>{stats.total} unique words</strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      • Positive words: <strong className="text-success">{stats.positive}</strong>
                    </p>
                    <p className="mb-0">
                      • Negative words: <strong className="text-danger">{stats.negative}</strong>
                    </p>
                  </div>
                </div>
                {stats.total > 0 && (
                  <div className="mt-2">
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${(stats.positive / stats.total) * 100}%` }}
                      ></div>
                      <div
                        className="progress-bar bg-secondary"
                        style={{ width: `${(stats.neutral / stats.total) * 100}%` }}
                      ></div>
                      <div
                        className="progress-bar bg-danger"
                        style={{ width: `${(stats.negative / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-success">Positive: {((stats.positive / stats.total) * 100).toFixed(1)}%</small>
                      <small className="text-secondary">Neutral: {((stats.neutral / stats.total) * 100).toFixed(1)}%</small>
                      <small className="text-danger">Negative: {((stats.negative / stats.total) * 100).toFixed(1)}%</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default WordCloud;
