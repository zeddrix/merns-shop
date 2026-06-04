interface RatingProps {
  value: number;
  text?: string;
  color?: string;
}

const Rating = ({ value, text, color = '#f8bf23' }: RatingProps) => {
  const starClass = (threshold: number, halfThreshold: number) => {
    if (value >= threshold) return 'fas fa-star';
    if (value >= halfThreshold) return 'fas fa-star-half-alt';
    return 'far fa-star';
  };

  return (
    <div className="rating" data-testid="product-rating">
      <span>
        <i style={{ color }} className={starClass(1, 0.5)} />
      </span>
      <span>
        <i style={{ color }} className={starClass(2, 1.5)} />
      </span>
      <span>
        <i style={{ color }} className={starClass(3, 2.5)} />
      </span>
      <span>
        <i style={{ color }} className={starClass(4, 3.5)} />
      </span>
      <span>
        <i style={{ color }} className={starClass(5, 4.5)} />
      </span>
      <span>{text}</span>
    </div>
  );
};

export default Rating;
