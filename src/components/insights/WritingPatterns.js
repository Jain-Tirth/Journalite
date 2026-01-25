import React from 'react';
import { Card, Spinner, Row, Col, ProgressBar } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WritingPatterns = ({ data, loading }) => {

  // Setting the data.
  const patterns = data && typeof data === 'object' && data.writingTimes && data.entryLengths && data.weeklyPattern && data.stats && {
    writingTimes: data.writingTimes ,
    entryLengths: data.entryLengths,
    weeklyPattern: data.weeklyPattern ,
    stats: data.stats
  };

  // Removed unused timeColors variable

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="mb-1"><strong>{label}</strong></p>
          <p className="mb-0" style={{ color: payload[0].color }}>
            {payload[0].value} entries
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-100 insight-card">
      <Card.Header className="d-flex align-items-center">
        <i className="bi bi-pencil-square text-primary me-2"></i>
        <h5 className="mb-0">Writing Patterns</h5>
        {loading && <Spinner animation="border" size="sm" className="ms-auto" />}
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="text-center">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Analyzing writing patterns...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Writing Statistics */}
            <Row className="mb-4">
              <Col md={3} sm={6}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-primary mb-1">{patterns.stats.avg_words_per_entry || 0}</h3>
                  <small className="text-muted">Avg Words per Entry</small>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">{patterns.stats.total_entries || 0}</h3>
                  <small className="text-muted">Total Entries</small>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">{patterns.stats.total_words?.toLocaleString() || 0}</h3>
                  <small className="text-muted">Total Words</small>
                </div>
              </Col>
              <Col md={3} sm={6}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-warning mb-1">{patterns.stats.most_active_day || 'N/A'}</h3>
                  <small className="text-muted">Most Active Day</small>
                </div>
              </Col>
            </Row>

            {/* Additional Statistics */}
            <Row className="mb-4">
              <Col md={4}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-primary mb-1">{patterns.stats.most_active_hour || 'N/A'}</h3>
                  <small className="text-muted">Most Active Hour</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-success mb-1">{patterns.stats.longest_entry || 0}</h3>
                  <small className="text-muted">Longest Entry (words)</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center p-3 bg-light rounded">
                  <h3 className="text-info mb-1">{patterns.stats.shortest_entry || 0}</h3>
                  <small className="text-muted">Shortest Entry (words)</small>
                </div>
              </Col>
            </Row>

            {/* Writing Times */}
            <div className="mb-4">
              <h6 className="text-secondary mb-3">Preferred Writing Times</h6>
              {(patterns.writingTimes || []).map((time, index) => (
                <div key={time.time || index} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-medium">{time.time}</span>
                    <span className="small text-muted">{time.count} entries ({time.percentage}%)</span>
                  </div>
                  <ProgressBar
                    now={time.percentage}
                    style={{ height: '8px' }}
                    variant={time.time === 'Morning' ? 'warning' :
                            time.time === 'Afternoon' ? 'success' :
                            time.time === 'Evening' ? 'primary' : 'info'}
                  />
                </div>
              ))}
            </div>

            {/* Weekly Pattern Chart */}
            <div className="mb-4">
              <h6 className="text-secondary mb-3">Weekly Writing Pattern</h6>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patterns.weeklyPattern || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Entry Length Distribution */}
            <div className="mb-3">
              <h6 className="text-secondary mb-3">Entry Length Distribution</h6>
              {(patterns.entryLengths || []).map((length, index) => (
                <div key={length.range || index} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-medium">{length.range}</span>
                    <span className="small text-muted">{length.count} entries ({length.percentage}%)</span>
                  </div>
                  <ProgressBar
                    now={length.percentage}
                    style={{ height: '6px' }}
                    variant={index === 0 ? 'danger' :
                            index === 1 ? 'warning' :
                            index === 2 ? 'success' : 'primary'}
                  />
                </div>
              ))}
            </div>

            {/* Insights Summary */}
            <div className="p-3 bg-light rounded">
              <h6 className="text-primary mb-2">
                <i className="bi bi-lightbulb me-1"></i>
                Writing Insights
              </h6>
              <div className="small text-muted">
                <Row>
                  <Col md={6}>
                    <p className="mb-1">
                      • Most active hour: <strong>{patterns.stats.most_active_hour || 'N/A'}:00</strong>
                    </p>
                    <p className="mb-1">
                      • Most productive day: <strong>{patterns.stats.most_active_day || 'N/A'}</strong>
                    </p>
                    <p className="mb-1">
                      • Total words written: <strong>{(patterns.stats.total_words || 0).toLocaleString()}</strong>
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1">
                      • Average entry length: <strong>{patterns.stats.avg_words_per_entry || 0} words</strong>
                    </p>
                    <p className="mb-1">
                      • Total entries: <strong>{patterns.stats.total_entries || 0}</strong>
                    </p>
                    <p className="mb-0">
                      • Writing activity: <strong>
                        {(patterns.stats.total_entries || 0) > 20 ? 'Very Active' :
                         (patterns.stats.total_entries || 0) > 10 ? 'Active' :
                         (patterns.stats.total_entries || 0) > 5 ? 'Moderate' : 'Getting Started'}
                      </strong>
                    </p>
                  </Col>
                </Row>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default WritingPatterns;
