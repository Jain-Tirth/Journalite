import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Image,
  Modal,
  Spinner,
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { encryptedJournalService } from '../../services/encryptedJournalService';
import { formatReadableDate } from '../../utils/taskUtils';

const JournalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const moods = [
    { value: 'happy', emoji: '😊', color: 'success' },
    { value: 'excited', emoji: '🤩', color: 'warning' },
    { value: 'grateful', emoji: '🙏', color: 'info' },
    { value: 'peaceful', emoji: '😌', color: 'primary' },
    { value: 'neutral', emoji: '😐', color: 'secondary' },
    { value: 'tired', emoji: '😴', color: 'dark' },
    { value: 'stressed', emoji: '😰', color: 'warning' },
    { value: 'sad', emoji: '😢', color: 'primary' },
    { value: 'angry', emoji: '😠', color: 'danger' },
    { value: 'anxious', emoji: '😟', color: 'warning' }
  ];

  useEffect(() => {
    fetchEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const response = await encryptedJournalService.getEntry(id, currentUser.uid);
      setEntry(response.data);
    } catch (error) {
      setError('Failed to load journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async () => {
    try {
      await encryptedJournalService.deleteEntry(id, currentUser.uid);
      navigate('/journal');
    } catch (error) {
      setError('Failed to delete entry. Please try again.');
    }
  };

  const getMoodEmoji = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj ? moodObj.emoji : '😐';
  };

  const getMoodColor = (mood) => {
    const moodObj = moods.find(m => m.value === mood);
    return moodObj ? moodObj.color : 'secondary';
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <Container fluid className="mt-4 text-center px-4">
        <Spinner animation="border" />
        <p className="mt-2">Loading journal entry...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="mt-4 px-4">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/journal" variant="primary">
          Back to Journal
        </Button>
      </Container>
    );
  }

  if (!entry) {
    return (
      <Container fluid className="mt-4 px-4">
        <Alert variant="warning">Journal entry not found.</Alert>
        <Button as={Link} to="/journal" variant="primary">
          Back to Journal
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 px-4">
      <Row className="justify-content-center">
        <Col xl={10} lg={11}>
          <Card className="shadow-sm">
            {/* Header */}
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Button
                  as={Link}
                  to="/journal"
                  variant="outline-secondary"
                  size="sm"
                  className="me-3"
                >
                  <i className="bi bi-arrow-left"></i>
                </Button>
                <div>
                  <h4 className="mb-0">{entry.title}</h4>
                  <small className="text-muted">
                    {entry.createdAt ? formatReadableDate(entry.createdAt) : 'No date'}
                    {entry.location && ` • ${entry.location}`}
                  </small>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="position-relative">

              {/* Mood */}
              <div className="mb-3 content-with-menu" style={{ paddingRight: '50px' }}>
                {entry.mood && (
                  <Badge bg={getMoodColor(entry.mood)} className="me-2">
                    {getMoodEmoji(entry.mood)} {entry.mood}
                  </Badge>
                )}
                {entry.isPrivate && (
                  <Badge bg="secondary" className="ms-2">
                    <i className="bi bi-lock me-1"></i>
                    Private
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="mb-4 content-with-menu" style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
                paddingRight: '50px' // Ensure content doesn't get hidden by floating menu
              }}>
                {entry.content}
              </div>

              {/* Images */}
              {entry.images && entry.images.length > 0 && (
                <div className="mb-4">
                  <h6 className="mb-3">
                    <i className="bi bi-images me-2"></i>
                    Photos ({entry.images.length})
                  </h6>
                  <Row>
                    {entry.images.map((imageUrl, index) => (
                      <Col xs={6} md={4} lg={3} key={index} className="mb-3">
                        <Image
                          src={imageUrl}
                          thumbnail
                          className="w-100 journal-image"
                          style={{ 
                            height: '150px', 
                            objectFit: 'cover',
                            cursor: 'pointer'
                          }}
                          onClick={() => openImageModal(imageUrl)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="mb-3">
                  <h6 className="mb-2">
                    <i className="bi bi-tags me-2"></i>
                    Tags
                  </h6>
                  <div>
                    {entry.tags.map(tag => (
                      <Badge key={tag} bg="primary" className="me-1 mb-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <Card className="metadata-card">
                <Card.Body className="py-2">
                  <Row className="text-muted small">
                    <Col xs={6}>
                      <i className="bi bi-calendar me-1"></i>
                      Created: {entry.createdAt ? formatReadableDate(entry.createdAt) : 'No date'}
                    </Col>
                    <Col xs={6}>
                      {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                        <>
                          <i className="bi bi-pencil me-1"></i>
                          Updated: {entry.updatedAt ? formatReadableDate(entry.updatedAt) : 'No date'}
                        </>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>

            <Card.Footer className="journal-detail-footer">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2">
                <Button as={Link} to="/journal" variant="secondary" className="order-1 order-sm-0">
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Journal
                </Button>

                <div className="d-flex flex-column flex-sm-row gap-2 order-0 order-sm-1">
                  <Button
                    as={Link}
                    to={`/journal/${entry.id}/edit`}
                    variant="primary"
                    className="w-100 w-sm-auto"
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Entry
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-100 w-sm-auto"
                  >
                    <i className="bi bi-trash me-2"></i>
                    Delete
                  </Button>
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Journal Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this journal entry?</p>
          <p className="fw-bold">"{entry.title}"</p>
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteEntry}>
            <i className="bi bi-trash me-2"></i>
            Delete Entry
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={selectedImage} className="w-100" />
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .journal-image:hover {
          transform: scale(1.05);
          transition: transform 0.2s ease-in-out;
        }

        .floating-menu-btn {
          transition: all 0.2s ease-in-out;
        }

        .floating-menu-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .dropdown-menu {
          border-radius: 12px !important;
          padding: 8px !important;
        }

        .dropdown-item {
          border-radius: 8px !important;
          margin-bottom: 2px;
        }

        .dropdown-item:hover {
          background-color: rgba(0, 123, 255, 0.1) !important;
        }

        @media (max-width: 768px) {
          .content-with-menu {
            padding-right: 45px !important;
          }

          .floating-menu-btn {
            width: 28px !important;
            height: 28px !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default JournalDetail;
