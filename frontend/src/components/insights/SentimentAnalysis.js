import React from 'react';
import { Card, Spinner, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const SentimentAnalysis = ({ data, loading }) => {
  // Sample data for demonstration
  const sampleDistribution = [
    { sentiment: 'Very Positive', value: 15, color: '#10B981' },
    { sentiment: 'Positive', value: 35, color: '#34D399' },
    { sentiment: 'Neutral', value: 30, color: '#6B7280' },
    { sentiment: 'Negative', value: 15, color: '#F87171' },
    { sentiment: 'Very Negative', value: 5, color: '#EF4444' }
  ];

  const sampleOverTime = [
    { date: '2025-01-01', score: 0.7, label: 'Positive' },
    { date: '2025-01-02', score: 0.3, label: 'Neutral' },
    { date: '2025-01-03', score: 0.8, label: 'Very Positive' },
    { date: '2025-01-04', score: -0.2, label: 'Negative' },
    { date: '2025-01-05', score: 0.5, label: 'Positive' },
    { date: '2025-01-06', score: 0.9, label: 'Very Positive' },
    { date: '2025-01-07', score: 0.1, label: 'Neutral' }
  ];

  // Transform sentiment data for distribution chart
  const createDistributionData = (sentimentData) => {
    if (!sentimentData || sentimentData.length === 0) return sampleDistribution;
    
    const totals = sentimentData.reduce((acc, item) => {
      acc.veryPositive += item.score >= 0.6 ? 1 : 0;
      acc.positive += (item.score >= 0.2 && item.score < 0.6) ? 1 : 0;
      acc.neutral += (item.score >= -0.2 && item.score < 0.2) ? 1 : 0;
      acc.negative += (item.score >= -0.6 && item.score < -0.2) ? 1 : 0;
      acc.veryNegative += item.score < -0.6 ? 1 : 0;
      return acc;
    }, { veryPositive: 0, positive: 0, neutral: 0, negative: 0, veryNegative: 0 });
    
    const total = sentimentData.length;
    return [
      { sentiment: 'Very Positive', value: Math.round((totals.veryPositive / total) * 100), color: '#10B981' },
      { sentiment: 'Positive', value: Math.round((totals.positive / total) * 100), color: '#34D399' },
      { sentiment: 'Neutral', value: Math.round((totals.neutral / total) * 100), color: '#6B7280' },
      { sentiment: 'Negative', value: Math.round((totals.negative / total) * 100), color: '#F87171' },
      { sentiment: 'Very Negative', value: Math.round((totals.veryNegative / total) * 100), color: '#EF4444' }
    ];
  };

  const distributionData = Array.isArray(data) ? createDistributionData(data) : sampleDistribution;
  const overTimeData = Array.isArray(data) && data.length > 0 ? data : sampleOverTime;

  const getSentimentColor = (score) => {
    if (score >= 0.6) return '#10B981'; // Very Positive
    if (score >= 0.2) return '#34D399'; // Positive
    if (score >= -0.2) return '#6B7280'; // Neutral
    if (score >= -0.6) return '#F87171'; // Negative
    return '#EF4444'; // Very Negative
  };

  const getSentimentLabel = (score) => {
    if (score >= 0.6) return 'Very Positive';
    if (score >= 0.2) return 'Positive';
    if (score >= -0.2) return 'Neutral';
    if (score >= -0.6) return 'Negative';
    return 'Very Negative';
  };

  const averageSentiment = overTimeData.reduce((sum, item) => sum + item.score, 0) / overTimeData.length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1"><strong>{label}</strong></p>
          <p className="mb-0" style={{ color: data.color }}>
            Score: {data.value.toFixed(2)} ({getSentimentLabel(data.value)})
          </p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1"><strong>{data.sentiment}</strong></p>
          <p className="mb-0" style={{ color: data.color }}>
            {data.value}% of entries
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-100 insight-card">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <i className="bi bi-graph-up text-primary me-2"></i>
          <h5 className="mb-0">Sentiment Analysis</h5>
        </div>
        <div className="d-flex align-items-center">
          {loading && <Spinner animation="border" size="sm" className="me-2" />}
          <Badge 
            bg={averageSentiment >= 0.2 ? 'success' : averageSentiment >= -0.2 ? 'warning' : 'danger'}
          >
            Avg: {averageSentiment.toFixed(2)}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="text-center">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Analyzing sentiment...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Sentiment Distribution */}
            <div className="mb-4">
              <h6 className="text-secondary mb-3">Sentiment Score Distribution</h6>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="sentiment" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<BarTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    >
                      {distributionData.map((entry, index) => (
                        <Bar key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sentiment Over Time */}
            <div className="mb-3">
              <h6 className="text-secondary mb-3">Sentiments Over Time</h6>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overTimeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      domain={[-1, 1]} 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value.toFixed(1)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Summary */}
            <div className="p-3 bg-light rounded">
              <h6 className="text-primary mb-2">
                <i className="bi bi-lightbulb me-1"></i>
                AI Insights
              </h6>
              <div className="small text-muted">
                <p className="mb-1">
                  • Overall sentiment: <strong className={`text-${averageSentiment >= 0.2 ? 'success' : averageSentiment >= -0.2 ? 'warning' : 'danger'}`}>
                    {getSentimentLabel(averageSentiment)}
                  </strong> (Score: {averageSentiment.toFixed(2)})
                </p>
                <p className="mb-1">
                  • Most positive day: {overTimeData.reduce((max, item) => item.score > max.score ? item : max, overTimeData[0])?.date}
                </p>
                <p className="mb-0">
                  • Sentiment trend: {overTimeData[overTimeData.length - 1]?.score > overTimeData[0]?.score ? '📈 Improving' : '📉 Declining'}
                </p>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default SentimentAnalysis;
