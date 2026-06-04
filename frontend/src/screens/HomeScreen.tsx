import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import { listProducts } from '../features/productSlice';

const HomeScreen = () => {
  const { keyword, pageNumber } = useParams<{
    keyword?: string;
    pageNumber?: string;
  }>();
  const page = pageNumber ?? '1';

  const dispatch = useAppDispatch();

  const productList = useAppSelector((state) => state.productList);
  const { loading, error, products, page: currentPage, pages } = productList;

  useEffect(() => {
    dispatch(listProducts({ keyword: keyword ?? '', pageNumber: page }));
  }, [dispatch, keyword, page]);

  return (
    <>
      <Meta />
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to="/" className="btn btn-light" data-testid="search-go-back">
          Go Back
        </Link>
      )}
      <h1 data-testid="home-heading">Latest Products</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Row data-testid="product-list">
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate pages={pages ?? 1} page={currentPage ?? 1} keyword={keyword ?? ''} />
        </>
      )}
    </>
  );
};

export default HomeScreen;
