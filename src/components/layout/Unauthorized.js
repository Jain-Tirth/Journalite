import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Header as="h3" className="bg-danger text-white">
              Access Denied
            </Card.Header>
            <Card.Body>
              <Card.Title>Unauthorized Access</Card.Title>
              <Card.Text>
                You don't have permission to access this page. This area is restricted to administrators only.
              </Card.Text>
              <Button as={Link} to="/dashboard" variant="primary">
                Go to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Unauthorized;
