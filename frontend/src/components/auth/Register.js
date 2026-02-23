import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Register = () => {
  useDocumentTitle('Create Account');
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      // Register the user
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setSuccess('Registration successful! Logging you in...');

      // Auto login after successful registration
      setTimeout(async () => {
        try {
          await login(values.email, values.password);
          navigate('/dashboard');
        } catch (loginErr) {
          setError('Registration successful, but failed to login automatically. Please login manually.');
          navigate('/login');
        }
      }, 1500);

      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="auth-form-card">
            <Card.Header className="auth-form-header text-center py-4">
              <h3 className="mb-2">
                <i className="bi bi-journal-bookmark text-primary me-2"></i>
                <span className="auth-brand-title">Journalite</span>
              </h3>
              <h4 className="auth-subtitle mb-0">Start Your Journey</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Formik
                initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <Field
                        type="text"
                        name="name"
                        className={`form-control ${touched.name && errors.name ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="name" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <Field
                        type="email"
                        name="email"
                        className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field
                        type="password"
                        name="password"
                        className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="password" component="div" className="invalid-feedback" />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                    </div>

                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting || success}
                      >
                        {isSubmitting ? 'Registering...' : 'Register'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="text-center">
              Already have an account? <Link to="/login">Login</Link>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
