import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import type { Product as ProductType } from '../types';
import Rating from './Rating';
import PriceDisplay from './PriceDisplay';

interface ProductProps {
  product: ProductType;
}

const Product = ({ product }: ProductProps) => {
  const priceFrom = product.priceFrom ?? product.variants[0]?.price ?? 0;
  const listPriceFrom = product.listPriceFrom ?? product.variants[0]?.listPrice;

  return (
    <Card
      className="my-3 p-3 rounded h-100 product-card"
      data-testid={`product-card-${product._id}`}
    >
      <Link to={`/product/${product._id}`} className="product-card__link">
        <div className="product-card__media" data-testid="catalog-card-media">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </Link>

      <Card.Body className="d-flex flex-column">
        <Badge bg="secondary" className="mb-2 align-self-start">
          {product.brand}
        </Badge>
        <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>
        <Card.Text as="div" className="text-muted small">
          {product.subcategory}
        </Card.Text>

        <Card.Text as="div">
          <Rating value={product.rating} text={`${product.numReviews} reviews`} />
        </Card.Text>

        <PriceDisplay price={priceFrom} listPrice={listPriceFrom} showFrom />
        {!product.inStock && (
          <Card.Text as="div" className="text-danger small mt-1">
            Out of stock
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
};

export default Product;
