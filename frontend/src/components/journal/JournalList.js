import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Form,
  InputGroup,
  Image,
  Modal
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { encryptedJournalService } from '../../services/encryptedJournalService'
import JournaliteLoader from '../ui/JournaliteLoader';
import useDocumentTitle from '../../hooks/useDocumentTitle';

import { formatReadableDate } from '../../utils/taskUtils';

const JournalList = () => {
  useDocumentTitle('My Journal');
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Only fetch entries if user is loaded
    if (currentUser && currentUser.uid) {
      fetchEntries();
      fetchStats();
    } else {
      setLoading(false);
      setError('Please log in to view your journal entries.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    filterEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, searchTerm]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      // Double-check user is available
      if (!currentUser || !currentUser.uid) {
        throw new Error('User not authenticated. Please log in again.');
      }
      const response = await encryptedJournalService.getUserEntries(currentUser.uid);
      if (response && response.success) {
        setEntries(response.data || []);


      } else if (response && response.data == null) {
        setEntries([]);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setError(`Failed to load journal entries: ${error.message}. Please check your internet connection and try again.`);
      setEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Double-check user is available
      if (!currentUser || !currentUser.uid) {
        return;
      }

      const response = await encryptedJournalService.getJournalStats(currentUser.uid);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching journal stats:', error);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.tags && entry.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    setFilteredEntries(filtered);
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;

    try {
      await encryptedJournalService.deleteEntry(entryToDelete.id, currentUser.uid);
      setEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
      setShowDeleteModal(false);
      setEntryToDelete(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete entry. Please try again.');
    }
  };

  // Mood emoji helper function
  const getMoodEmoji = (mood) => {
    const emojiMap = {
      happy: '😊', sad: '😢', angry: '😠', anxious: '😟', excited: '🤩',
      calm: '😌', neutral: '😐', grateful: '🙏', frustrated: '😤',
      content: '😊', tired: '😴', stressed: '😰', surprised: '😲',
      confused: '😕', disappointed: '😞', hopeful: '🤞', proud: '😌',
      peaceful: '😌'
    };
    return emojiMap[mood?.toLowerCase()] || '😐';
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Container fluid className="mt-4 text-center px-4">
        <JournaliteLoader message="Loading your journal entries..." />
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 px-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center journal-list-header">
            <div>
              <h2 className="journal-list-title">
                <i className="bi bi-journal-text me-2"></i>
                My Journal
              </h2>
              {stats && (
                <p className="text-muted journal-list-stats">
                  {stats.totalEntries} entries • {stats.entriesThisMonth} this month
                </p>
              )}
            </div>
            <div className="journal-list-actions">
              <Button as={Link} to="/journal/new" variant="primary" className="me-2">
                <i className="bi bi-plus-circle me-2"></i>
                New Entry
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search */}
      <Row className="mb-4 justify-content-center">
        <Col lg={8} md={10} sm={12}>
          <InputGroup size="lg">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search entries by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm"
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </InputGroup>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <i className="bi bi-journal-plus display-1 text-muted"></i>
            <h4 className="mt-3">No journal entries found</h4>
            <p className="text-muted">
              {entries.length === 0
                ? "Start your journaling journey by creating your first entry!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {entries.length === 0 && (
              <Button as={Link} to="/journal/new" variant="primary">
                Create Your First Entry
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredEntries.map(entry => (
            <Col xxl={3} xl={4} lg={6} md={6} sm={12} key={entry.id} className="mb-4">
              <Card className="h-100 shadow-sm journal-entry-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    {entry.mood && (
                      <Badge
                        bg="primary"
                        className="me-2"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {getMoodEmoji(entry.mood)} {entry.mood}
                      </Badge>
                    )}
                    {entry.isPrivate && (
                      <Badge bg="secondary" className="me-2">
                        <i className="bi bi-lock"></i>
                      </Badge>
                    )}
                  </div>
                  <small className="text-muted">
                    {entry.createdAt ? formatReadableDate(entry.createdAt) : 'No date'}
                  </small>
                </Card.Header>

                <Card.Body>
                  <Card.Title className="h5">{entry.title}</Card.Title>
                  {entry.location && (
                    <Card.Text className="text-muted small">
                      <i className="bi bi-geo-alt me-1"></i>
                      {entry.location}
                    </Card.Text>
                  )}

                  <Card.Text>
                    {truncateContent(entry.content)}
                  </Card.Text>

                  {entry.images && entry.images.length > 0 && (
                    <div className="mb-2">
                      <Row>
                        {entry.images.slice(0, 3).map((imageUrl, index) => (
                          <Col xs={4} key={index}>
                            <Image
                              src={imageUrl}
                              thumbnail
                              className="w-100"
                              style={{ height: '60px', objectFit: 'cover' }}
                            />
                          </Col>
                        ))}
                      </Row>
                      {entry.images.length > 3 && (
                        <small className="text-muted">
                          +{entry.images.length - 3} more photos
                        </small>
                      )}
                    </div>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div>
                      {entry.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} bg="secondary" className="me-1">
                          #{tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge bg="secondary">
                          +{entry.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </Card.Body>

                <Card.Footer className="text-center">
                  <Button
                    as={Link}
                    to={`/journal/${entry.id}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    Read More
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Journal Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{entryToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEntry}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JournalList;
