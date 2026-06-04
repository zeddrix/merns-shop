import { Link } from 'react-router-dom';
import { Row, Col, Image } from 'react-bootstrap';
import { formatPrice } from '../utils/formatPrice';

interface OrderLineItemData {
  product: string;
  name: string;
  image: string;
  price: number;
  qty: number;
}

interface OrderLineItemProps {
  item: OrderLineItemData;
}

const OrderLineItem = ({ item }: OrderLineItemProps) => {
  const lineTotal = item.qty * item.price;

  return (
    <div className="cart-line-item">
      <Row className="align-items-center g-2">
        <Col xs={3} md={1}>
          <Image src={item.image} alt={item.name} fluid rounded />
        </Col>
        <Col xs={9} md={7}>
          <Link to={`/product/${item.product}`} className="fw-semibold">
            {item.name}
          </Link>
          <div className="text-muted small mt-1">
            {item.qty} x {formatPrice(item.price)} = {formatPrice(lineTotal)}
          </div>
        </Col>
        <Col md={4} className="d-none d-md-block text-md-end">
          {item.qty} x {formatPrice(item.price)} = {formatPrice(lineTotal)}
        </Col>
      </Row>
    </div>
  );
};

export default OrderLineItem;
