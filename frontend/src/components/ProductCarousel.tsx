import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Loader from './Loader';
import Message from './Message';
import { listTopProducts } from '../features/productSlice';

const ProductCarousel = () => {
  const dispatch = useAppDispatch();

  const productTopRated = useAppSelector((state) => state.productTopRated);
  const { loading, error, products } = productTopRated;

  useEffect(() => {
    dispatch(listTopProducts());
  }, [dispatch]);

  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger" data-testid="home-carousel-error">
      {error}
    </Message>
  ) : (
    <Carousel pause="hover" className="bg-dark product-carousel" data-testid="product-carousel">
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/product/${product._id}`} className="product-carousel__slide">
            <div className="product-carousel__media" data-testid="product-carousel-media">
              <Image src={product.image} alt={product.name} />
            </div>
            <Carousel.Caption className="carousel-caption">
              <h2>
                {product.name} (from ${product.priceFrom ?? product.variants[0]?.price ?? 0})
              </h2>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
