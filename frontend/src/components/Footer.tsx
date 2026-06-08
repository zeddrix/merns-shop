import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { DISPLAY_BRAND_NAME } from '../constants/brand';
import { DEVELOPER_NAME } from '../constants/seo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" data-testid="site-footer">
      <Container>
        <Row>
          <Col className="site-footer__inner py-3">
            <span data-testid="footer-copyright">
              Copyright{' '}
              <Link to="/about" data-testid="footer-developer-link">
                {DEVELOPER_NAME}
              </Link>{' '}
              &copy; {currentYear} {DISPLAY_BRAND_NAME}
            </span>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
