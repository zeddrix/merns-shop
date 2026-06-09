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
    <div className="cart-line-item order-line-item">
      <Row className="align-items-center g-2">
        <Col xs={3} md={2}>
          <Image src={item.image} alt={item.name} fluid rounded />
        </Col>
        <Col xs={9} md={4}>
          <Link to={`/product/${item.product}`} className="fw-semibold">
            {item.name}
          </Link>
        </Col>
        <Col xs={6} md={3} className="text-muted small">
          <span data-testid="order-line-qty-price">
            {item.qty} × {formatPrice(item.price)}
          </span>
        </Col>
        <Col xs={6} md={3} className="text-end">
          <span className="fw-semibold" data-testid="order-line-total">
            {formatPrice(lineTotal)}
          </span>
        </Col>
      </Row>
    </div>
  );
};

export default OrderLineItem;
