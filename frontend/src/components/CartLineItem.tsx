import { Link } from 'react-router-dom';
import { Row, Col, Image, Button, Form } from 'react-bootstrap';
import AppSelect from './AppSelect';
import type { CartItem } from '../types';
import { cartLineTestId } from '../utils/cartTestId';
import { formatPrice } from '../utils/formatPrice';

interface CartLineItemProps {
  item: CartItem;
  maxQty: number;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}

const CartLineItem = ({ item, maxQty, onQtyChange, onRemove }: CartLineItemProps) => {
  const lineId = cartLineTestId(item.product, item.variantSku);

  return (
    <div className="cart-line-item" data-testid={`cart-item-${lineId}`}>
      <Row className="align-items-center g-2">
        <Col xs={4} md={2}>
          <Image src={item.image} alt={item.name} fluid rounded />
        </Col>
        <Col xs={8} md={3}>
          <Link to={`/product/${item.product}`} className="fw-semibold">
            {item.name}
          </Link>
          {item.variantLabel ? <div className="text-muted small">{item.variantLabel}</div> : null}
        </Col>
        <Col xs={4} md={2} className="text-muted small d-md-none">
          <span>Price</span>
          <div className="text-dark">{formatPrice(item.price)}</div>
        </Col>
        <Col md={2} className="d-none d-md-block">
          {formatPrice(item.price)}
        </Col>
        <Col xs={4} md={2}>
          <Form.Label className="text-muted small mb-1 d-md-none">Qty</Form.Label>
          <AppSelect
            value={item.qty}
            data-testid={`cart-qty-${lineId}`}
            onChange={(value) => onQtyChange(Number(value))}
            options={[...Array(maxQty).keys()].map((x) => ({
              value: String(x + 1),
              label: String(x + 1)
            }))}
          />
        </Col>
        <Col xs={4} md={2} className="text-end text-md-start">
          <Button
            type="button"
            variant="light"
            className="touch-target"
            data-testid={`cart-remove-${lineId}`}
            onClick={onRemove}
          >
            <i className="fas fa-trash"></i>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CartLineItem;
