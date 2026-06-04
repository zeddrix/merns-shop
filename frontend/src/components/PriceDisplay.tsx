import { calcSavingsAmount, calcSavingsPercent, formatPrice } from '../utils/formatPrice';

interface PriceDisplayProps {
  price: number;
  listPrice?: number;
  showFrom?: boolean;
  size?: 'sm' | 'lg';
}

const PriceDisplay = ({ price, listPrice, showFrom = false, size = 'sm' }: PriceDisplayProps) => {
  const savingsPercent = listPrice !== undefined ? calcSavingsPercent(listPrice, price) : 0;
  const savingsAmount = listPrice !== undefined ? calcSavingsAmount(listPrice, price) : 0;
  const hasSavings = savingsPercent > 0 && listPrice !== undefined;

  const priceClass = size === 'lg' ? 'h3 mb-0' : 'h5 mb-0';

  return (
    <div data-testid="product-price-display">
      {hasSavings && listPrice !== undefined ? (
        <>
          <span className="text-muted text-decoration-line-through me-2">
            {formatPrice(listPrice)}
          </span>
          <span className={priceClass}>
            {showFrom ? 'From ' : ''}
            {formatPrice(price)}
          </span>
          <div className="text-success small mt-1" data-testid="product-savings-badge">
            Save {formatPrice(savingsAmount)} ({savingsPercent}% off)
          </div>
        </>
      ) : (
        <span className={priceClass}>
          {showFrom ? 'From ' : ''}
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
