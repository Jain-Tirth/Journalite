import React, { useState } from 'react';
import { Card, Spinner, ButtonGroup, Button, Badge } from 'react-bootstrap';

const WordCloud = ({ data, loading }) => {
  const [filterType, setFilterType] = useState('all'); // 'all', 'positive', 'negative'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const words = Array.isArray(data) ? data : [];
  console.log('WordCloud received data:', words.length > 0 ? `${words.length} words` : 'no data');

  const positiveLexicon = new Set([
    'happy', 'joy', 'love', 'excited', 'great', 'amazing', 'wonderful', 'grateful', 'success', 'achieved',
    'calm', 'peaceful', 'optimistic', 'confident', 'content', 'hopeful', 'proud', 'energized'
  ]);
  const negativeLexicon = new Set([
    'sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'tired', 'upset', 'failed', 'difficult',
    'lonely', 'overwhelmed', 'disappointed', 'hurt', 'fear'
  ]);

  const normalizeSentiment = (word) => {
    const raw = typeof word?.sentiment === 'string' ? word.sentiment.toLowerCase() : '';
    if (raw === 'positive' || raw === 'negative' || raw === 'neutral') return raw;

    const lowerText = (word?.text || '').toLowerCase();
    if (positiveLexicon.has(lowerText)) return 'positive';
    if (negativeLexicon.has(lowerText)) return 'negative';
    return 'neutral';
  };

  const normalizedWords = words.map(word => {
    const sentiment = normalizeSentiment(word);
    const color = word.color || (sentiment === 'positive' ? '#10B981' : sentiment === 'negative' ? '#EF4444' : '#6B7280');
    return {
      ...word,
      sentiment,
      color,
      size: word.size || 18
    };
  });

  // Filter words based on sentiment
  const filteredWords = normalizedWords.filter(word => {
    if (filterType === 'positive') return word.sentiment === 'positive';
    if (filterType === 'negative') return word.sentiment === 'negative';
    return true;
  });

  const getWordPosition = (index, total) => {
    const turn = 0.5 + index / Math.max(total, 1);
    const angle = turn * 6 * Math.PI;
    const radius = 10 + index * (90 / Math.max(total, 1));
    const centerX = 50;
    const centerY = 50;

    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  };

  const WordCloudVisualization = ({ words }) => {
    const sortedWords = [...words]
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

    const maxFrequency = Math.max(...sortedWords.map(word => word.frequency || 1), 1);
    const minFrequency = Math.min(...sortedWords.map(word => word.frequency || 1), 1);

    const getScaledSize = (frequency, baseSize) => {
      if (maxFrequency === minFrequency) return baseSize + 8;
      const scale = (frequency - minFrequency) / (maxFrequency - minFrequency);
      return baseSize + 8 + scale * 16;
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const viewBoxWidth = 800;
    const viewBoxHeight = 400;
    const paddingX = 70;
    const paddingY = 50;

    return (
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          height: '400px',
          overflow: 'hidden',
          borderRadius: '16px',
          background: 'radial-gradient(circle at 20% 20%, rgba(var(--bs-primary-rgb), 0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(var(--bs-success-rgb), 0.18), transparent 55%), var(--bg-secondary)'
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="wordGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.35)" />
            </filter>
          </defs>
          {sortedWords.map((word, index) => {
            const position = getWordPosition(index, sortedWords.length);
            const fontSize = Math.min(34, getScaledSize(word.frequency || 1, Math.max(12, word.size || 16)));
            const rotation = (index % 5 === 0 ? -8 : index % 7 === 0 ? 8 : 0);
            const x = clamp((position.x / 100) * viewBoxWidth, paddingX, viewBoxWidth - paddingX);
            const y = clamp((position.y / 100) * viewBoxHeight, paddingY, viewBoxHeight - paddingY);
            const isHovered = hoveredIndex === index;

            return (
              <text
                key={`${word.text}-${index}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fill={word.color}
                fontWeight={isHovered ? '700' : fontSize > 28 ? '700' : '600'}
                className="word-cloud-text"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  textShadow: isHovered ? '0 2px 10px rgba(0, 0, 0, 0.45)' : '0 1px 6px rgba(0, 0, 0, 0.35)',
                  opacity: isHovered ? 0.95 : 1,
                  letterSpacing: isHovered ? '0.4px' : '0'
                }}
                transform={`rotate(${rotation}, ${x}, ${y})`}
                onMouseEnter={(e) => {
                  setHoveredIndex(index);
                }}
                onMouseLeave={(e) => {
                  setHoveredIndex(null);
                }}
                filter={isHovered ? 'url(#wordGlow)' : undefined}
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
    const positive = normalizedWords.filter(w => w.sentiment === 'positive').length;
    const negative = normalizedWords.filter(w => w.sentiment === 'negative').length;
    const neutral = normalizedWords.filter(w => w.sentiment === 'neutral').length;
    
    return { positive, negative, neutral, total: normalizedWords.length };
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
        ) : normalizedWords.length === 0 ? (
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
            {filteredWords.length === 0 ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                  <i className="bi bi-cloud text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">No {filterType} words detected</h5>
                  <p className="text-muted">Try switching filters to view other words.</p>
                </div>
              </div>
            ) : (
              <WordCloudVisualization words={filteredWords.slice(0, 25)} />
            )}

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
                      • Most used word: <strong style={{ color: normalizedWords[0]?.color }}>
                        {normalizedWords[0]?.text}
                      </strong> ({normalizedWords[0]?.frequency} times)
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
