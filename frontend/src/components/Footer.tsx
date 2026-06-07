import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DISPLAY_BRAND_NAME } from '../constants/brand';
import { DEVELOPER_NAME } from '../constants/seo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer data-testid="site-footer">
      <Container>
        <Row>
          <Col className="text-center py-3">
            <Link to="/about" data-testid="footer-about-link">
              About
            </Link>
            {' · '}
            <Link to="/about" data-testid="footer-developer-link">
              Developed by {DEVELOPER_NAME}
            </Link>
            {' · '}
            <span data-testid="footer-copyright">
              Copyright &copy; {currentYear} {DISPLAY_BRAND_NAME}
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
