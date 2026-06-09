import { Link } from 'react-router-dom';
import { Row, Col, Button, Form, Badge } from 'react-bootstrap';
import AppSelect from './AppSelect';
import CatalogImage from './CatalogImage';
import AppIcon from './icons/AppIcon';
import { faTrash } from './icons';
import { CART_CATALOG_SIZES } from '../utils/catalogImage';
import type { CartItem } from '../types';
import { cartLineTestId } from '../utils/cartTestId';
import { formatPrice } from '../utils/formatPrice';
import { isToPayItem } from '../features/cartSlice';

interface CartLineItemProps {
  item: CartItem;
  maxQty: number;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}

const CartLineItem = ({ item, maxQty, onQtyChange, onRemove }: CartLineItemProps) => {
  const lineId = cartLineTestId(item.product, item.variantSku);
  const isPendingPayment = isToPayItem(item);

  return (
    <div className="cart-line-item" data-testid={`cart-item-${lineId}`}>
      <Row className="align-items-center g-2">
        <Col xs={4} md={2}>
          <CatalogImage
            src={item.image}
            alt={item.name}
            sizes={CART_CATALOG_SIZES}
            className="img-fluid rounded"
          />
        </Col>
        <Col xs={8} md={3}>
          {isPendingPayment && item.orderId ? (
            <Link
              to={`/order/${item.orderId}`}
              className="fw-semibold link-cta"
              data-testid={`cart-item-order-link-${lineId}`}
            >
              {item.name}
            </Link>
          ) : (
            <Link to={`/product/${item.product}`} className="fw-semibold">
              {item.name}
            </Link>
          )}
          {item.variantLabel ? <div className="text-muted small">{item.variantLabel}</div> : null}
          {isPendingPayment && (
            <Badge bg="warning" className="mt-1" data-testid="cart-item-to-pay-badge">
              To Pay
            </Badge>
          )}
        </Col>
        <Col xs={4} md={2} className="text-muted small d-md-none">
          <span>Price</span>
          <div className="text-dark">{formatPrice(item.price)}</div>
        </Col>
        <Col md={2} className="d-none d-md-block">
          {formatPrice(item.price)}
        </Col>
        <Col xs={4} md={2}>
          {isPendingPayment ? (
            <span className="text-muted small">Qty: {item.qty}</span>
          ) : (
            <>
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
            </>
          )}
        </Col>
        <Col xs={4} md={2} className="text-end text-md-start">
          {!isPendingPayment && (
            <Button
              type="button"
              variant="light"
              className="touch-target"
              data-testid={`cart-remove-${lineId}`}
              onClick={onRemove}
            >
              <AppIcon icon={faTrash} />
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default CartLineItem;
