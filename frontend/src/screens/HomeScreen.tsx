import { useEffect } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import CatalogFilters from '../components/CatalogFilters';
import Meta from '../components/Meta';
import {
  DEFAULT_META_DESCRIPTION,
  DEFAULT_META_TITLE,
  ROBOTS_INDEX_FOLLOW,
  ROBOTS_NOINDEX_FOLLOW
} from '../constants/seo';
import { listProducts } from '../features/productSlice';
import { isRegisterWelcomeState } from '../utils/authRedirect';
import {
  buildHomeCanonicalPath,
  buildOrganizationJsonLd,
  buildSearchTitle,
  buildWebsiteJsonLd
} from '../utils/seoMeta';

const HomeScreen = () => {
  const location = useLocation();
  const registerWelcome = isRegisterWelcomeState(location.state)
    ? location.state.registerWelcome
    : null;
  const { keyword, pageNumber } = useParams<{
    keyword?: string;
    pageNumber?: string;
  }>();
  const [searchParams] = useSearchParams();
  const page = pageNumber ?? '1';

  const dispatch = useAppDispatch();

  const productList = useAppSelector((state) => state.productList);
  const { loading, error, products, page: currentPage, pages } = productList;

  const filterQuery = searchParams.toString();
  const brand = searchParams.get('brand') ?? '';
  const category = searchParams.get('category') ?? '';
  const subcategory = searchParams.get('subcategory') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = searchParams.get('sort') ?? '';

  useEffect(() => {
    dispatch(
      listProducts({
        keyword: keyword ?? '',
        pageNumber: page,
        brand,
        category,
        subcategory,
        minPrice,
        maxPrice,
        sort
      })
    );
  }, [dispatch, keyword, page, brand, category, subcategory, minPrice, maxPrice, sort]);

  const hasFilterQuery = Boolean(brand || category || subcategory || minPrice || maxPrice || sort);
  const canonicalPath = buildHomeCanonicalPath({
    keyword,
    pageNumber: page,
    hasFilterQuery
  });
  const metaTitle = keyword ? buildSearchTitle(keyword) : DEFAULT_META_TITLE;
  const metaDescription = keyword
    ? `Browse results for "${keyword}" at our electronics store.`
    : DEFAULT_META_DESCRIPTION;
  const robots = keyword ? ROBOTS_NOINDEX_FOLLOW : ROBOTS_INDEX_FOLLOW;
  const jsonLd = keyword ? undefined : [buildWebsiteJsonLd(), buildOrganizationJsonLd()];

  return (
    <>
      <Meta
        title={metaTitle}
        description={metaDescription}
        canonicalPath={canonicalPath}
        robots={robots}
        jsonLd={jsonLd}
      />
      {!keyword ? (
        <ProductCarousel />
      ) : (
        <Link to="/" className="btn btn-light" data-testid="search-go-back">
          Go Back
        </Link>
      )}
      {registerWelcome ? (
        <Message variant="success" data-testid="register-welcome">
          Welcome, {registerWelcome}
        </Message>
      ) : null}
      <h1 data-testid="home-heading">Latest Products</h1>
      <CatalogFilters keyword={keyword} />
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" data-testid="home-products-error">
          {error}
        </Message>
      ) : (
        <>
          {products.length === 0 && keyword ? (
            <Message data-testid="search-empty">No products found for your search</Message>
          ) : null}
          <Row data-testid="product-list">
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <Paginate
            pages={pages ?? 1}
            page={currentPage ?? 1}
            keyword={keyword ?? ''}
            searchQuery={filterQuery}
          />
        </>
      )}
    </>
  );
};

export default HomeScreen;
