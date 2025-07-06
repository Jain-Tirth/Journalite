import React, { useState } from 'react';
import { Card, Spinner, ButtonGroup, Button, Badge, Row, Col } from 'react-bootstrap';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MoodCorrelations = ({ data, loading }) => {
  const [activeTab, setActiveTab] = useState('tags'); // 'tags', 'length', 'time'

  // Sample correlation data
  const sampleData = {
    moodTagCorrelations: {
      happy: { work: 8, family: 12, vacation: 6, achievement: 9 },
      sad: { work: 5, loss: 4, stress: 3, health: 2 },
      excited: { travel: 7, project: 5, celebration: 8, opportunity: 4 },
      calm: { meditation: 6, nature: 9, reading: 4, weekend: 7 },
      anxious: { deadline: 6, presentation: 4, change: 5, uncertainty: 3 }
    },
    moodLengthCorrelations: [
      { mood: 'happy', avgLength: 320, entries: 25 },
      { mood: 'sad', avgLength: 450, entries: 12 },
      { mood: 'excited', avgLength: 280, entries: 18 },
      { mood: 'calm', avgLength: 380, entries: 15 },
      { mood: 'anxious', avgLength: 520, entries: 10 }
    ],
    timeOfDayMoods: {
      morning: { happy: 12, calm: 8, excited: 6, neutral: 4 },
      afternoon: { happy: 8, stressed: 6, focused: 5, tired: 3 },
      evening: { calm: 10, reflective: 8, grateful: 6, content: 4 },
      night: { anxious: 5, sad: 4, thoughtful: 6, peaceful: 3 }
    }
  };

  const correlations = data || sampleData;

  const moodColors = {
    happy: '#10B981',
    sad: '#EF4444',
    excited: '#F59E0B',
    calm: '#3B82F6',
    anxious: '#8B5CF6',
    angry: '#DC2626',
    grateful: '#059669',
    stressed: '#F97316',
    content: '#0EA5E9',
    neutral: '#6B7280'
  };

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    calm: '😌',
    anxious: '😟',
    angry: '😠',
    grateful: '🙏',
    stressed: '😰',
    content: '😊',
    neutral: '😐'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1"><strong>{label}</strong></p>
          <p className="mb-0" style={{ color: payload[0].color }}>
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderMoodTagCorrelations = () => {
    return (
      <div>
        <h6 className="text-secondary mb-3">Mood-Tag Correlations</h6>
        {Object.entries(correlations.moodTagCorrelations).map(([mood, tags]) => (
          <div key={mood} className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <span className="me-2 fs-5">{moodEmojis[mood]}</span>
              <strong className="text-capitalize" style={{ color: moodColors[mood] }}>
                {mood}
              </strong>
            </div>
            <div className="d-flex flex-wrap">
              {Object.entries(tags).map(([tag, count]) => (
                <Badge 
                  key={tag}
                  bg="light" 
                  text="dark" 
                  className="me-2 mb-1"
                  style={{ fontSize: '0.8rem' }}
                >
                  #{tag} ({count})
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMoodLengthCorrelations = () => {
    return (
      <div>
        <h6 className="text-secondary mb-3">Mood vs Entry Length</h6>
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="entries" 
                name="Number of Entries"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                dataKey="avgLength" 
                name="Average Length"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-sm">
                        <p className="mb-1">
                          <span className="me-2">{moodEmojis[data.mood]}</span>
                          <strong className="text-capitalize">{data.mood}</strong>
                        </p>
                        <p className="mb-1">Entries: {data.entries}</p>
                        <p className="mb-0">Avg Length: {data.avgLength} words</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                data={correlations.moodLengthCorrelations} 
                fill="#3B82F6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-3">
          {correlations.moodLengthCorrelations.map((item, index) => (
            <div key={item.mood} className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <span className="me-2">{moodEmojis[item.mood]}</span>
                <span className="text-capitalize fw-medium" style={{ color: moodColors[item.mood] }}>
                  {item.mood}
                </span>
              </div>
              <div className="text-end">
                <div className="small text-muted">{item.avgLength} words avg</div>
                <div className="small text-muted">{item.entries} entries</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeOfDayMoods = () => {
    const timeData = Object.entries(correlations.timeOfDayMoods).map(([time, moods]) => ({
      time: time.charAt(0).toUpperCase() + time.slice(1),
      ...moods
    }));

    return (
      <div>
        <h6 className="text-secondary mb-3">Moods by Time of Day</h6>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(correlations.timeOfDayMoods.morning).map((mood, index) => (
                <Bar 
                  key={mood}
                  dataKey={mood} 
                  stackId="a"
                  fill={moodColors[mood] || '#6B7280'}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3">
          <Row>
            {Object.entries(correlations.timeOfDayMoods).map(([time, moods]) => (
              <Col key={time} md={6} lg={3} className="mb-3">
                <div className="p-3 bg-light rounded">
                  <h6 className="text-capitalize mb-2">{time}</h6>
                  {Object.entries(moods).map(([mood, count]) => (
                    <div key={mood} className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small">
                        {moodEmojis[mood]} {mood}
                      </span>
                      <Badge bg="secondary" className="small">{count}</Badge>
                    </div>
                  ))}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    );
  };

  return (
    <Card className="insight-card">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bi bi-diagram-3 text-primary me-2"></i>
          <h5 className="mb-0">Mood Correlations</h5>
        </div>
        <div className="d-flex align-items-center">
          {loading && <Spinner animation="border" size="sm" className="me-3" />}
          <ButtonGroup size="sm">
            <Button 
              variant={activeTab === 'tags' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('tags')}
            >
              Tags
            </Button>
            <Button 
              variant={activeTab === 'length' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('length')}
            >
              Length
            </Button>
            <Button 
              variant={activeTab === 'time' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('time')}
            >
              Time
            </Button>
          </ButtonGroup>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="text-center">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Analyzing correlations...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'tags' && renderMoodTagCorrelations()}
            {activeTab === 'length' && renderMoodLengthCorrelations()}
            {activeTab === 'time' && renderTimeOfDayMoods()}

            {/* Insights Summary */}
            <div className="mt-4 p-3 bg-light rounded">
              <h6 className="text-primary mb-2">
                <i className="bi bi-lightbulb me-1"></i>
                Correlation Insights
              </h6>
              <div className="small text-muted">
                {activeTab === 'tags' && (
                  <p className="mb-0">
                    • <strong>Happy</strong> moods are most associated with family and work achievements
                    • <strong>Calm</strong> moods correlate strongly with nature and meditation
                    • <strong>Anxious</strong> moods often relate to deadlines and uncertainty
                  </p>
                )}
                {activeTab === 'length' && (
                  <p className="mb-0">
                    • <strong>Sad</strong> entries tend to be longer (avg: {correlations.moodLengthCorrelations.find(m => m.mood === 'sad')?.avgLength} words)
                    • <strong>Excited</strong> entries are typically shorter and more concise
                    • Emotional intensity often correlates with entry length
                  </p>
                )}
                {activeTab === 'time' && (
                  <p className="mb-0">
                    • <strong>Morning</strong> entries are predominantly happy and calm
                    • <strong>Evening</strong> writing shows more reflection and gratitude
                    • <strong>Night</strong> entries tend to be more introspective
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default MoodCorrelations;
