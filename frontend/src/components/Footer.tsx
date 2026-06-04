import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer data-testid="site-footer">
      <Container>
        <Row>
          <Col className="text-center py-3">Copyright &copy; Mern&apos;s Shop</Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
