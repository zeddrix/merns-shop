import { Row, Col } from 'react-bootstrap';

interface FormContainerProps {
  children: React.ReactNode;
}

const FormContainer = ({ children }: FormContainerProps) => {
  return (
    <div className="form-container-inner" data-testid="form-container">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {children}
        </Col>
      </Row>
    </div>
  );
};

export default FormContainer;
