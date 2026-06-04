import { Container, Row, Col } from 'react-bootstrap';
import { DISPLAY_BRAND_NAME } from '../constants/brand';

const Footer = () => {
  return (
    <footer data-testid="site-footer">
      <Container>
        <Row>
          <Col className="text-center py-3">Copyright &copy; {DISPLAY_BRAND_NAME}</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
