import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer,Tooltip } from 'recharts';

const EmotionDistribution = ({ data, loading }) => {
  // Default emotion colors
  const emotionColors = {
    happy: '#10B981',
    joy: '#10B981',
    excited: '#F59E0B',
    calm: '#3B82F6',
    neutral: '#6B7280',
    sad: '#EF4444',
    angry: '#DC2626',
    anxious: '#8B5CF6',
    stressed: '#F97316',
    tired: '#64748B',
    surprised: '#EC4899',
    grateful: '#059669',
    frustrated: '#B91C1C',
    content: '#0EA5E9',
    overwhelmed: '#7C3AED'
  };

  const chartData = data ;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1">
            <span className="fs-4 me-2">{data.emoji}</span>
            <strong>{data.name}</strong>
          </p>
          <p className="mb-0 text-primary">
            {data.value}% of entries
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, emoji }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
      >
        <tspan x={x} dy="-0.5em">{emoji}</tspan>
        <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(0)}%`}</tspan>
      </text>
    );
  };

  const renderLegend = (props) => {
    const { payload } = props;
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
              {entry.payload.emoji} {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-100 insight-card">
      <Card.Header className="d-flex align-items-center">
        <i className="bi bi-emoji-smile text-primary me-2"></i>
        <h5 className="mb-0">Emotion Distribution</h5>
        {loading && <Spinner animation="border" size="sm" className="ms-auto" />}
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="text-center">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Analyzing emotions...</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={emotionColors[entry.name.toLowerCase()] || emotionColors.neutral}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Legend */}
            <div className="mt-3">
              <div className="d-flex flex-wrap justify-content-center">
                {chartData.map((entry, index) => (
                  <div key={index} className="d-flex align-items-center me-3 mb-2">
                    <div 
                      className="rounded-circle me-2"
                      style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: emotionColors[entry.name.toLowerCase()] || emotionColors.neutral
                      }}
                    />
                    <span className="small">
                      {entry.emoji} {entry.name} ({entry.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Summary */}
            <div className="mt-3 p-3 bg-light rounded">
              <h6 className="text-primary mb-2">
                <i className="bi bi-lightbulb me-1"></i>
                Key Insights
              </h6>
              {chartData.length > 0 && (
                <div className="small text-muted">
                  <p className="mb-1">
                    • Most frequent emotion: <strong>{chartData[0]?.emoji} {chartData[0]?.name}</strong> ({chartData[0]?.value}%)
                  </p>
                  <p className="mb-1">
                    • Emotional diversity: {chartData.length} different emotions tracked
                  </p>
                  <p className="mb-0">
                    • Positive emotions: {chartData.filter(e => 
                      ['happy', 'joy', 'excited', 'calm', 'grateful', 'content'].includes(e.name.toLowerCase())
                    ).reduce((sum, e) => sum + e.value, 0)}%
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmotionDistribution;
