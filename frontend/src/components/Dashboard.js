import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { journalService } from '../services/journalService';
import { encryptedJournalService } from '../services/encryptedJournalService';
import { formatReadableDate } from '../utils/taskUtils';
import { useAuth } from '../context/AuthContext';
import JournaliteLoader from './ui/JournaliteLoader';
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchJournalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchJournalData = async () => {
    try {
      setLoading(true);
      // Validate user is available
      if (!currentUser || !currentUser.uid) {
        setError('Please log in to view your journal data.');
        return;
      }

      // Fetch recent journal entries (DECRYPTED)
      const entriesResponse = await encryptedJournalService.getUserEntries(currentUser.uid, 5);
      if (entriesResponse.success) {
        setEntries(entriesResponse.data || []);
      }

      // Fetch journal statistics (optionally use encryptedJournalService if stats need decryption)
      const statsResponse = await journalService.getJournalStats(currentUser.uid);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      console.error('❌ Dashboard: Error fetching journal data:', err);
      setError('Failed to fetch journal data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const moodMap = {
      'happy': '😊',
      'excited': '🤩',
      'grateful': '🙏',
      'peaceful': '😌',
      'neutral': '😐',
      'tired': '😴',
      'stressed': '😰',
      'sad': '😢',
      'angry': '😠',
      'anxious': '😟'
    };
    return moodMap[mood] || '😐';
  };
  // Helper to get string value safely
  function getDisplayValue(field) {
    if (typeof field === 'string') return field;
    if (field && typeof field === 'object' && '_value' in field) return String(field._value);
    return '';
  }
  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <JournaliteLoader message="Loading your journal dashboard..." />
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Welcome Section with Background */}
      <div className="hero-section mb-4 p-4 rounded-3">
        <Row className="align-items-center">
          <Col>
            <h2 className="mb-2">
              <i className="bi bi-journal-bookmark me-2"></i>
              Welcome to Journalite
            </h2>
            <p className="mb-0">Hello, {currentUser?.displayName || currentUser?.email || 'Journaler'}! Ready to capture your thoughts today?</p>
          </Col>
          <Col xs="auto">
            <Button as={Link} to="/journal/new" variant="primary" size="lg" className="fw-bold">
              <i className="bi bi-plus-circle me-2"></i>New Journal Entry
            </Button>
          </Col>
        </Row>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Recent Entries and Mood Overview */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Entries
              </h5>
              <Link to="/journal" className="btn btn-sm btn-outline-primary">View All</Link>
            </Card.Header>
            <Card.Body>
              {entries.length > 0 ? (
                <div className="list-group list-group-flush">
                  {entries.slice(0, 3).map(entry => (
                    <Link
                      to={`/journal/${entry.id}`}
                      key={entry.id}
                      className="list-group-item list-group-item-action border-0 px-0"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{getDisplayValue(entry.title)}</h6>
                          <p className="mb-1 text-muted small">
                            {getDisplayValue(entry.content)}...
                          </p>
                          <small className="text-muted">
                            {entry.createdAt ? formatReadableDate(entry.createdAt) : 'No date'}
                          </small>
                        </div>
                        {entry.mood && (
                          <span className="ms-2 fs-4">
                            {getMoodEmoji(entry.mood)}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-journal-plus display-4 text-muted"></i>
                  <p className="text-muted mt-2">No entries yet. Start your journaling journey!</p>
                  <Button as={Link} to="/journal/new" variant="primary" size="sm">
                    Write First Entry
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header className=''>
              <h5 className="mb-0">
                <i className="bi bi-emoji-smile me-2"></i>
                Mood Overview
              </h5>
            </Card.Header>
            <Card.Body>
              {stats && stats.moodCounts && Object.keys(stats.moodCounts).length > 0 ? (
                <div>
                  {Object.entries(stats.moodCounts).slice(0, 5).map(([mood, count]) => (
                    <div key={mood} className="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <span className="me-2 fs-5">{getMoodEmoji(mood)}</span>
                        {mood}
                      </span>
                      <span className="badge bg-primary">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-emoji-neutral display-4 text-muted"></i>
                  <p className="text-muted mt-2">Start tracking your moods by writing entries!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-lightning me-2"></i>
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="justify-content-center">
                <Col xl={3} lg={4} md={6} sm={12} className="mb-3">
                  <Button as={Link} to="/journal/new" variant="primary" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="bi bi-plus-circle fs-1 mb-2"></i>
                    <span className="fw-semibold">New Entry</span>
                  </Button>
                </Col>
                <Col xl={3} lg={4} md={6} sm={12} className="mb-3">
                  <Button as={Link} to="/journal" variant="outline-primary" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="bi bi-journal-text fs-1 mb-2"></i>
                    <span className="fw-semibold">View All</span>
                  </Button>
                </Col>
                <Col xl={3} lg={4} md={6} sm={12} className="mb-3">
                  <Button as={Link} to="/insights" variant="outline-info" className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="bi bi-graph-up fs-1 mb-2"></i>
                    <span className="fw-semibold">Insights</span>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
};

export default Dashboard;
