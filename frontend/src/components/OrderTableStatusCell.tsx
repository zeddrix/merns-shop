import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableStatusCellProps {
  kind: 'paid' | 'delivered';
  isComplete: boolean;
  dateValue?: string;
}

const OrderTableStatusCell = ({ kind, isComplete, dateValue }: OrderTableStatusCellProps) => {
  if (isComplete && dateValue) {
    return (
      <OrderStatusBadge
        kind={kind}
        dateLabel={dateValue.substring(0, 10)}
        testId={`order-status-${kind}`}
      />
    );
  }

  return (
    <OrderStatusBadge
      kind={kind === 'paid' ? 'unpaid' : 'pending'}
      testId={`order-status-${kind === 'paid' ? 'unpaid' : 'pending'}`}
    />
  );
};

export default OrderTableStatusCell;
