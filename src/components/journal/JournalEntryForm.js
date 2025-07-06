import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Image,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { journalService } from '../../services/journalService';
import { aiService } from '../../services/aiService';
import { aiMoodAnalysisService } from '../../services/aiMoodAnalysisService';
import { pythonAnalyticsService } from '../../services/pythonAnalyticsService';

const JournalEntryForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Get entry ID from URL for edit mode
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: '',
    tags: [],
    isPrivate: true
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // For edit mode
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // For loading existing entry
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null);
  const [moodDetectionLoading, setMoodDetectionLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false); // Fixed typo and naming

  // Load existing entry data when in edit mode
  useEffect(() => {
    if (id && currentUser?.uid) {
      setIsEdit(true);
      loadExistingEntry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser]);

  const loadExistingEntry = async () => {
    try {
      setInitialLoading(true);
      setError('');

      const response = await journalService.getEntry(id, currentUser.uid);

      if (response.success && response.data) {
        const entry = response.data;

        // Populate form with decrypted data
        setFormData({
          title: entry.title || '',
          content: entry.content || '',
          mood: entry.mood || '',
          tags: entry.tags || [],
          isPrivate: entry.isPrivate !== undefined ? entry.isPrivate : true
        });

        // Set existing images
        setExistingImages(entry.images || []);
      } else {
        setError('Failed to load journal entry for editing.');
        navigate('/journal');
      }
    } catch (error) {
      if (error.message.includes('Decryption failed')) {
        setError('Failed to decrypt journal entry. Please try refreshing the page.');
      } else {
        setError('Failed to load journal entry. Please try again.');
      }
      navigate('/journal');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Please upload only images under 5MB.');
    }

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      happy: '😊', sad: '😢', angry: '😠', anxious: '😟', excited: '🤩',
      calm: '😌', neutral: '😐', grateful: '🙏', frustrated: '😤',
      content: '😊', tired: '😴', stressed: '😰', surprised: '😲',
      confused: '😕', disappointed: '😞', hopeful: '🤞', proud: '😌'
    };
    return emojiMap[emotion?.toLowerCase()] || '😐';
  };


  const detectMoodFromContent = async () => {
    const content = `${formData.title} ${formData.content}`.trim();

    if (!content) {
      return;
    }

    setMoodDetectionLoading(true);
    try {
      // Try Python backend first
      const moodResult = await pythonAnalyticsService.analyzeMood(content);

      if (moodResult.success) {
        const mood = {
          primary: moodResult.mood,
          confidence: moodResult.confidence,
          emotions: moodResult.emotions,
          sentimentScore: moodResult.sentimentScore,
          keywords: moodResult.keywords
        };

        setDetectedMood(mood);

        // Auto-set the mood in form data
        setFormData(prev => ({
          ...prev,
          mood: moodResult.mood
        }));
      } else {
        // Use AI mood analysis as fallback
        const aiMoodResult = await aiMoodAnalysisService.analyzeMood(content);

        if (aiMoodResult.success) {
          const mood = {
            primary: aiMoodResult.mood,
            confidence: aiMoodResult.confidence,
            emotions: aiMoodResult.emotions,
            sentimentScore: aiMoodResult.sentiment?.polarity,
            keywords: aiMoodResult.keywords,
            reasoning: aiMoodResult.reasoning
          };

          setDetectedMood(mood);
          setFormData(prev => ({ ...prev, mood: aiMoodResult.mood }));
        } else {
          // Final fallback to simple mood detection
          const fallbackMood = await aiService.analyzeMood(content);
          setDetectedMood({ primary: fallbackMood, confidence: 0.7 });
          setFormData(prev => ({ ...prev, mood: fallbackMood }));
        }
      }
    } catch (error) {
      setError('Failed to detect mood. Please try again later.');
      setDetectedMood(null);
    } finally {
      setMoodDetectionLoading(false);
    }
  };

  const getAISuggestion = async () => {
    if (!formData.title && !formData.content) {
      setError('Please add a title or some content first to get AI suggestions.');
      return;
    }

    setLoadingAI(true);
    try {
      const context = "You are a helpful journaling assistant providing thoughtful prompts and suggestions.";
      const prompt = `Based on this journal entry:
Title: "${formData.title}"
Content: "${formData.content}"

Provide a thoughtful suggestion, reflection question, or writing prompt to help the user explore their thoughts deeper. Keep it encouraging and insightful.`;

      const suggestion = await aiService.callGeminiAPI(prompt, context);
      setAiSuggestion(suggestion);
    } catch (error) {
      setError('Failed to get AI suggestion. Please try again.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please provide both a title and content for your journal entry.');
      return;
    }

    // Validate user authentication and credentials
    if (!currentUser || !currentUser.uid) {
      setError('You must be logged in to save a journal entry. Please log in and try again.');
      return;
    }



    setLoading(true);
    setError('');

    try {
      if (isEdit) {     
        // Upload new images if any
        const newImageUrls = [];
        for (const image of images) {
          try {
            const uploadResult = await journalService.uploadImage(image, currentUser.uid, id);
            if (uploadResult.success) {
              newImageUrls.push(uploadResult.url);
            }
          } catch (imageError) {
            console.warn('Failed to upload new image:', imageError);
          }
        }

        // Combine existing images with new ones
        const allImages = [...existingImages, ...newImageUrls];

        const entryData = {
          ...formData,
          images: allImages
        };

        const result = await journalService.updateEntry(id, entryData, currentUser.uid);

        if (result.success) {
          setSuccess('Journal entry updated successfully!');
          setTimeout(() => {
            navigate(`/journal/${id}`);
          }, 1500);
        } else {
          setError('Failed to update journal entry. Please try again.');
        }
      } else {
        // Create new encrypted entry
        const entryData = {
          ...formData,
          images: [] // Will be updated with image URLs
        };

        const result = await journalService.createEntry(entryData, currentUser.uid);

        if (result.success) {
          // Upload images if any
          const imageUrls = [];
          for (const image of images) {
            try {
              const uploadResult = await journalService.uploadImage(image, currentUser.uid, result.id);
              if (uploadResult.success) {
                imageUrls.push(uploadResult.url);
              }
            } catch (imageError) {
              console.warn('Failed to upload image:', imageError);
            }
          }

          // Update entry with image URLs if any were uploaded
          if (imageUrls.length > 0) {
            await journalService.updateEntry(result.id, { images: imageUrls }, currentUser.uid);
          }

          setSuccess('Journal entry created successfully!');
          setTimeout(() => {
            navigate('/journal');
          }, 1500);
        } else {
          setError('Failed to create journal entry. Please try again.');
        }
      }
    } catch (error) {
      setError(`Failed to ${isEdit ? 'update' : 'create'} journal entry. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while loading existing entry
  if (initialLoading) {
    return (
      <Container fluid className="mt-4 text-center px-4">
        <Spinner animation="border" />
        <p className="mt-2">Loading journal entry...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 px-4">
      <Row className="justify-content-center">
        <Col xl={10} lg={11}>
          <Card className="shadow-sm">
            <Card.Header className="journal-form-header">
              <h4 className="mb-0">
                <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-journal-plus'} me-2`}></i>
                {isEdit ? 'Edit Journal Entry' : 'New Journal Entry'}
              </h4>
            </Card.Header>

            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Title */}
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="What's on your mind today?"
                    required
                  />
                </Form.Group>

                {/* Content */}
                <Form.Group className="mb-3">
                  <Form.Label>Content *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write about your day, thoughts, feelings, or anything that comes to mind..."
                    required
                  />
                </Form.Group>

                {/* AI Mood Detection */}
                <Card className="mb-3 ai-mood-card">
                  <Card.Header className="ai-mood-header d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-emoji-smile me-2"></i>
                      AI Mood Detection
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={detectMoodFromContent}
                      disabled={moodDetectionLoading || (!formData.title && !formData.content)}
                    >
                      {moodDetectionLoading ? <Spinner animation="border" size="sm" /> : 'Detect Mood'}
                    </Button>
                  </Card.Header>
                  {detectedMood && (
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <span className="fs-4 me-2">{getEmotionEmoji(detectedMood.primary)}</span>
                        <div>
                          <strong className="text-capitalize">{detectedMood.primary}</strong>
                          <div className="small text-muted">
                            Confidence: {Math.round(detectedMood.confidence * 100)}%
                            {detectedMood.sentimentScore && (
                              <span className="ms-2">
                                Sentiment: {detectedMood.sentimentScore > 0 ? '😊 Positive' :
                                  detectedMood.sentimentScore < 0 ? '😔 Negative' : '😐 Neutral'}
                              </span>
                            )}
                          </div>
                          {detectedMood.keywords && detectedMood.keywords.length > 0 && (
                            <div className="mt-1">
                              <small className="text-muted">Key emotions: </small>
                              {detectedMood.keywords.slice(0, 3).map((keyword, index) => (
                                <Badge key={index} bg="secondary" className="me-1">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  )}
                </Card>

                {/* AI Suggestion */}
                <Card className="mb-3 ai-suggestion-card">
                  <Card.Header className="ai-suggestion-header d-flex justify-content-between align-items-center">
                    <span>
                      <i className="bi bi-robot me-2"></i>
                      AI Writing Assistant
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={getAISuggestion}
                      disabled={loadingAI}
                    >
                      {loadingAI ? <Spinner animation="border" size="sm" /> : 'Get Suggestion'}
                    </Button>
                  </Card.Header>
                  {aiSuggestion && (
                    <Card.Body>
                      <p className="mb-0 fst-italic">{aiSuggestion}</p>
                    </Card.Body>
                  )}
                </Card>

                {/* Images */}
                <Form.Group className="mb-3">
                  <Form.Label>{isEdit ? 'Manage Photos' : 'Add Photos'}</Form.Label>

                  {/* Existing Images (Edit Mode) */}
                  {isEdit && existingImages.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-muted">Current Photos</h6>
                      <Row>
                        {existingImages.map((imageUrl, index) => (
                          <Col xs={6} md={4} lg={3} key={`existing-${index}`} className="mb-2">
                            <div className="position-relative">
                              <Image
                                src={imageUrl}
                                thumbnail
                                className="w-100"
                                style={{ height: '100px', objectFit: 'cover' }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0"
                                onClick={() => removeExistingImage(index)}
                                title="Remove existing photo"
                              >
                                ×
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* New Images Upload */}
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                  <Form.Text className="text-muted">
                    {isEdit ? 'Add new photos (max 5MB each)' : 'You can upload multiple images (max 5MB each)'}
                  </Form.Text>

                  {/* New Images Preview */}
                  {images.length > 0 && (
                    <div className="mt-3">
                      <h6 className="text-muted">New Photos to Add</h6>
                      <Row>
                        {images.map((image, index) => (
                          <Col xs={6} md={4} lg={3} key={`new-${index}`} className="mb-2">
                            <div className="position-relative">
                              <Image
                                src={URL.createObjectURL(image)}
                                thumbnail
                                className="w-100"
                                style={{ height: '100px', objectFit: 'cover' }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0"
                                onClick={() => removeImage(index)}
                                title="Remove new photo"
                              >
                                ×
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Form.Group>

                {/* Tags */}
                <Form.Group className="mb-3">
                  <Form.Label>Tags</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button variant="outline-secondary" onClick={addTag}>
                      Add
                    </Button>
                  </InputGroup>

                  {formData.tags.length > 0 && (
                    <div className="mt-2">
                      {formData.tags.map(tag => (
                        <Badge
                          key={tag}
                          bg="primary"
                          className="me-1 mb-1"
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </Form.Group>

                {/* Privacy */}
                <Form.Group className="mb-4">
                  <Form.Check
                    type="checkbox"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    label="Keep this entry private"
                  />
                </Form.Group>

                {/* Submit Buttons */}
                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(isEdit ? `/journal/${id}` : '/journal')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        {isEdit ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEdit ? 'bi-check-circle' : 'bi-save'} me-2`}></i>
                        {isEdit ? 'Update Entry' : 'Save Entry'}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default JournalEntryForm;
