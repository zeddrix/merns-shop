import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DISPLAY_BRAND_NAME } from '../constants/brand';

const Footer = () => {
  return (
    <footer data-testid="site-footer">
      <Container>
        <Row>
          <Col className="text-center py-2">
            <Link to="/about" data-testid="footer-about-link">
              About
            </Link>
          </Col>
        </Row>
        <Row>
          <Col className="text-center py-3">Copyright &copy; {DISPLAY_BRAND_NAME}</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
