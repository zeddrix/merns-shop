import AppIcon from './icons/AppIcon';
import { faStar, faStarHalfAlt, faStarRegular } from './icons';

interface RatingProps {
  value: number;
  text?: string;
  color?: string;
}

const pickStar = (value: number, threshold: number, halfThreshold: number) => {
  if (value >= threshold) return faStar;
  if (value >= halfThreshold) return faStarHalfAlt;
  return faStarRegular;
};

const Rating = ({ value, text, color = '#f8bf23' }: RatingProps) => {
  const stars = [
    pickStar(value, 1, 0.5),
    pickStar(value, 2, 1.5),
    pickStar(value, 3, 2.5),
    pickStar(value, 4, 3.5),
    pickStar(value, 5, 4.5)
  ];

  return (
    <div className="rating" data-testid="product-rating">
      {stars.map((icon, index) => (
        <span key={index}>
          <AppIcon icon={icon} style={{ color }} />
        </span>
      ))}
      <span>{text}</span>
    </div>
  );
};

export default Rating;
