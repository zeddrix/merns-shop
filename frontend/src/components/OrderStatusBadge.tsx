import { Badge } from 'react-bootstrap';

type OrderStatusBadgeKind = 'paid' | 'unpaid' | 'delivered' | 'pending';

interface OrderStatusBadgeProps {
  kind: OrderStatusBadgeKind;
  dateLabel?: string;
  testId?: string;
}

const LABELS: Record<OrderStatusBadgeKind, string> = {
  paid: 'Paid',
  unpaid: 'To Pay',
  delivered: 'Delivered',
  pending: 'Pending'
};

const VARIANTS: Record<OrderStatusBadgeKind, string> = {
  paid: 'success',
  unpaid: 'warning',
  delivered: 'success',
  pending: 'secondary'
};

const OrderStatusBadge = ({ kind, dateLabel, testId }: OrderStatusBadgeProps) => {
  const label = dateLabel ? `${LABELS[kind]} on ${dateLabel}` : LABELS[kind];

  return (
    <Badge bg={VARIANTS[kind]} className="order-status-badge" data-testid={testId}>
      {label}
    </Badge>
  );
};

export default OrderStatusBadge;
