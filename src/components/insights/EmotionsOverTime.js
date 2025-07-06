import React, { useState } from 'react';
import { Card, Spinner, ButtonGroup, Button } from 'react-bootstrap';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const EmotionsOverTime = ({ data, loading }) => {
  const [viewMode, setViewMode] = useState('stacked'); // 'stacked' or 'percentage'

  // Sample data for demonstration
  const sampleData = [
    { date: '2025-01-01', happy: 3, sad: 1, angry: 0, anxious: 1, excited: 2, calm: 1 },
    { date: '2025-01-02', happy: 2, sad: 2, angry: 1, anxious: 0, excited: 1, calm: 2 },
    { date: '2025-01-03', happy: 4, sad: 0, angry: 0, anxious: 1, excited: 3, calm: 1 },
    { date: '2025-01-04', happy: 1, sad: 3, angry: 2, anxious: 2, excited: 0, calm: 0 },
    { date: '2025-01-05', happy: 3, sad: 1, angry: 0, anxious: 0, excited: 2, calm: 3 },
    { date: '2025-01-06', happy: 5, sad: 0, angry: 0, anxious: 1, excited: 4, calm: 2 },
    { date: '2025-01-07', happy: 2, sad: 1, angry: 1, anxious: 1, excited: 1, calm: 2 }
  ];

  const chartData = data || sampleData;

  // Convert to percentage data for percentage view
  const percentageData = chartData.map(item => {
    const total = Object.keys(item).reduce((sum, key) => {
      if (key !== 'date') {
        return sum + (item[key] || 0);
      }
      return sum;
    }, 0);

    const percentageItem = { date: item.date };
    Object.keys(item).forEach(key => {
      if (key !== 'date') {
        percentageItem[key] = total > 0 ? ((item[key] || 0) / total * 100) : 0;
      }
    });
    return percentageItem;
  });

  const displayData = viewMode === 'percentage' ? percentageData : chartData;

  const emotionColors = {
    happy: '#10B981',
    sad: '#EF4444',
    angry: '#DC2626',
    anxious: '#8B5CF6',
    excited: '#F59E0B',
    calm: '#3B82F6',
    neutral: '#6B7280',
    grateful: '#059669',
    frustrated: '#B91C1C',
    content: '#0EA5E9',
    tired: '#64748B',
    stressed: '#F97316'
  };

  const emotionEmojis = {
    happy: '😊',
    sad: '😢',
    angry: '😠',
    anxious: '😟',
    excited: '🤩',
    calm: '😌',
    neutral: '😐',
    grateful: '🙏',
    frustrated: '😤',
    content: '😊',
    tired: '😴',
    stressed: '😰'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString();
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-2"><strong>{date}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} className="mb-1" style={{ color: entry.color }}>
              {emotionEmojis[entry.dataKey]} {entry.dataKey}: {entry.value.toFixed(viewMode === 'percentage' ? 1 : 0)}{viewMode === 'percentage' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="d-flex flex-wrap justify-content-center mt-3">
        {payload.map((entry, index) => (
          <div key={index} className="d-flex align-items-center me-3 mb-2">
            <div 
              className="rounded-circle me-2"
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: entry.color 
              }}
            />
            <span className="small">
              {emotionEmojis[entry.value]} {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Get the emotions that have data
  const availableEmotions = Object.keys(emotionColors).filter(emotion => 
    chartData.some(item => item[emotion] > 0)
  );

  return (
    <Card className="insight-card">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bi bi-graph-up-arrow text-primary me-2"></i>
          <h5 className="mb-0">Emotions Over Time</h5>
        </div>
        <div className="d-flex align-items-center">
          {loading && <Spinner animation="border" size="sm" className="me-3" />}
          <ButtonGroup size="sm">
            <Button 
              variant={viewMode === 'stacked' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('stacked')}
            >
              Count
            </Button>
            <Button 
              variant={viewMode === 'percentage' ? 'primary' : 'outline-primary'}
              onClick={() => setViewMode('percentage')}
            >
              Percentage
            </Button>
          </ButtonGroup>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="text-center">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Analyzing emotion patterns...</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={displayData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  stackOffset={viewMode === 'percentage' ? 'expand' : 'none'}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => viewMode === 'percentage' ? `${(value * 100).toFixed(0)}%` : value}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                  
                  {availableEmotions.map((emotion, index) => (
                    <Area
                      key={emotion}
                      type="monotone"
                      dataKey={emotion}
                      stackId="1"
                      stroke={emotionColors[emotion]}
                      fill={emotionColors[emotion]}
                      fillOpacity={0.7}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Insights Summary */}
            <div className="mt-3 p-3 bg-light rounded">
              <h6 className="text-primary mb-2">
                <i className="bi bi-lightbulb me-1"></i>
                Emotion Trends
              </h6>
              <div className="small text-muted">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1">
                      • Most consistent emotion: <strong>
                        {availableEmotions.reduce((most, emotion) => {
                          const consistency = chartData.filter(item => item[emotion] > 0).length;
                          const mostConsistency = chartData.filter(item => item[most] > 0).length;
                          return consistency > mostConsistency ? emotion : most;
                        }, availableEmotions[0])}
                      </strong>
                    </p>
                    <p className="mb-1">
                      • Peak emotion day: <strong>
                        {chartData.reduce((peak, item) => {
                          const total = Object.keys(item).reduce((sum, key) => 
                            key !== 'date' ? sum + (item[key] || 0) : sum, 0
                          );
                          const peakTotal = Object.keys(peak).reduce((sum, key) => 
                            key !== 'date' ? sum + (peak[key] || 0) : sum, 0
                          );
                          return total > peakTotal ? item : peak;
                        }, chartData[0])?.date}
                      </strong>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1">
                      • Emotional range: <strong>{availableEmotions.length} emotions</strong>
                    </p>
                    <p className="mb-0">
                      • Trend: <strong>
                        {chartData.length > 1 && 
                          Object.keys(chartData[chartData.length - 1]).reduce((sum, key) => 
                            key !== 'date' ? sum + (chartData[chartData.length - 1][key] || 0) : sum, 0
                          ) > 
                          Object.keys(chartData[0]).reduce((sum, key) => 
                            key !== 'date' ? sum + (chartData[0][key] || 0) : sum, 0
                          ) ? '📈 Increasing activity' : '📉 Decreasing activity'
                        }
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmotionsOverTime;
